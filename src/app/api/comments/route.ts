import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/api/payload-client'
import { 
  checkCommentRateLimits, 
  getClientIP, 
  validateCommentSecurity 
} from '@/lib/utils/rate-limiter'

// Types
interface CommentSubmission {
  name: string
  email: string
  website?: string
  content: string
  relatedTo: {
    type: 'image' | 'blog-post'
    itemId: string
    itemSlug: string
    itemTitle: string
  }
  honeypot?: string
  submissionTime?: number
}

/**
 * POST /api/comments - Submit a new comment
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: CommentSubmission
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Get client IP and user agent for security
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    // Rate limiting check
    const rateLimitResult = checkCommentRateLimits(ipAddress, null)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.reason || 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      )
    }

    // Security validation
    const securityResult = validateCommentSecurity({
      content: body.content,
      name: body.name,
      honeypot: body.honeypot,
      submissionTime: body.submissionTime,
    })

    if (!securityResult.valid) {
      return NextResponse.json(
        { error: securityResult.reason || 'Invalid comment' },
        { status: 400 }
      )
    }

    // Prepare comment data for Payload CMS
    const commentData = {
      author: {
        name: body.name.trim(),
      },
      content: body.content.trim(),
      relatedTo: {
        type: body.relatedTo.type,
        itemId: body.relatedTo.itemId,
        itemSlug: body.relatedTo.itemSlug,
        itemTitle: body.relatedTo.itemTitle,
      },
      status: 'draft' as const, // All comments start as draft for moderation
      security: {
        ipAddress,
        userAgent,
        submissionTime: body.submissionTime || 0,
        honeypot: body.honeypot || '',
      },
      spamScore: securityResult.spamScore,
    }

    // Save to database via Payload CMS
    const payload = await getPayloadClient()
    const comment = await payload.create({
      collection: 'comments',
      data: commentData,
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully. It will be reviewed before publication.',
      commentId: comment.id,
    }, { status: 201 })

  } catch (error) {
    console.error('Comment submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/comments - Fetch approved comments for a specific content item
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageId = searchParams.get('imageId')
    const blogPostId = searchParams.get('blogPostId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate parameters
    if (!imageId && !blogPostId) {
      return NextResponse.json(
        { error: 'Either imageId or blogPostId is required' },
        { status: 400 }
      )
    }

    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid page or limit parameters' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Build query conditions
    const whereConditions: any = {
      status: { equals: 'approved' },
    }

    if (imageId) {
      whereConditions['relatedTo.type'] = { equals: 'image' }
      whereConditions['relatedTo.itemId'] = { equals: imageId }
    } else if (blogPostId) {
      whereConditions['relatedTo.type'] = { equals: 'blog-post' }
      whereConditions['relatedTo.itemId'] = { equals: blogPostId }
    }

    // Fetch comments with pagination
    const result = await payload.find({
      collection: 'comments',
      where: whereConditions,
      limit,
      page,
      sort: '-createdAt', // Newest first
      select: {
        id: true,
        author: true,
        content: true,
        createdAt: true,
        status: true,
      },
    })

    // Transform data for frontend
    const comments = result.docs.map((comment: any) => ({
      id: comment.id,
      author: {
        name: comment.author.name,
        website: comment.author.website,
      },
      content: comment.content,
      createdAt: comment.createdAt,
      status: comment.status,
    }))

    return NextResponse.json({
      comments,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
      hasMore: result.hasNextPage,
    })

  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}