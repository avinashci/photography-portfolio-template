import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/api/payload-client'
import { getServerSideURL } from '@/lib/utils/getURL'

/**
 * GET /api/admin/comments - Fetch comments for admin moderation
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // Check authentication and authorization
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('payload-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the token using /api/users/me endpoint
    let user
    try {
      const meUserReq = await fetch(`${getServerSideURL()}/api/users/me`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      })

      if (!meUserReq.ok) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        )
      }

      const userData = await meUserReq.json()
      user = userData.user
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    // Build query conditions
    const whereConditions: any = {}
    if (status === 'draft') {
      whereConditions.status = { equals: 'draft' }
    }

    // Fetch comments with pagination, now with proper authentication context
    const result = await payload.find({
      collection: 'comments',
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      limit: 50,
      sort: '-createdAt',
      user, // Pass authenticated user context
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Admin comments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/comments - Update comment status for moderation
 * Requires admin authentication
 */
export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // Check authentication and authorization
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('payload-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the token using /api/users/me endpoint
    let user
    try {
      const meUserReq = await fetch(`${getServerSideURL()}/api/users/me`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      })

      if (!meUserReq.ok) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        )
      }

      const userData = await meUserReq.json()
      user = userData.user
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, status, moderatorNotes } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id and status' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected', 'spam'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: approved, rejected, or spam' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      moderatedAt: new Date().toISOString(),
      moderatedBy: user.id, // Track who moderated the comment
    }

    if (moderatorNotes) {
      updateData.moderatorNotes = moderatorNotes
    }

    // Update comment with proper authentication context
    const result = await payload.update({
      collection: 'comments',
      id,
      data: updateData,
      user, // Pass authenticated user context
    })

    return NextResponse.json({
      success: true,
      comment: result,
    })

  } catch (error) {
    console.error('Admin comment update error:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}