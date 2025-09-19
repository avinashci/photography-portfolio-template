import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/api/payload-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const locale = searchParams.get('locale') || 'en'
    const type = searchParams.get('type') // 'all', 'galleries', 'images', 'blog'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()
    const searchTerm = query.trim()
    
    // Create search conditions for different content types
    const createSearchCondition = (fields: string[]) => ({
      or: fields.map(field => ({
        [field]: {
          contains: searchTerm
        }
      }))
    })

    const results: {
      galleries: any[]
      images: any[]
      blogPosts: any[]
      totalResults: number
    } = {
      galleries: [],
      images: [],
      blogPosts: [],
      totalResults: 0
    }

    // Search galleries if type is 'all' or 'galleries'
    if (!type || type === 'all' || type === 'galleries') {
      try {
        const galleries = await payload.find({
          collection: 'galleries',
          where: {
            and: [
              { published: { equals: true } },
              createSearchCondition([
                'title',
                'description',
                'excerpt',
                'tags'
              ])
            ]
          },
          limit,
          depth: 2,
          locale: locale as any
        })

        results.galleries = galleries.docs.map((gallery: any) => ({
          id: gallery.id,
          title: gallery.title,
          slug: gallery.slug,
          description: gallery.description,
          excerpt: gallery.excerpt,
          imageCount: gallery.imageCount || 0,
          tags: gallery.tags,
          coverImage: gallery.coverImage,
          type: 'gallery'
        }))
      } catch (error) {
        console.warn('Gallery search failed:', error)
      }
    }

    // Search images if type is 'all' or 'images'
    if (!type || type === 'all' || type === 'images') {
      try {
        const images = await payload.find({
          collection: 'images',
          where: {
            and: [
              { _status: { equals: 'published' } },
              createSearchCondition([
                'title',
                'description',
                'caption',
                'altText',
                'tags',
                'location.name',
                'location.city',
                'location.region',
                'location.country',
                'photographyStyle'
              ])
            ]
          },
          limit,
          depth: 2,
          locale: locale as any
        })

        results.images = images.docs.map((image: any) => ({
          id: image.id,
          title: image.title,
          slug: image.slug,
          description: image.description,
          alt: image.alt,
          tags: image.tags,
          imageUrls: image.imageUrls,
          gallery: image.gallery,
          photographyStyle: image.photographyStyle,
          captureDate: image.captureDate,
          type: 'image'
        }))
      } catch (error) {
        console.warn('Image search failed:', error)
      }
    }

    // Search blog posts if type is 'all' or 'blog'
    if (!type || type === 'all' || type === 'blog') {
      try {
        const blogPosts = await payload.find({
          collection: 'blog-posts',
          where: {
            and: [
              { _status: { equals: 'published' } },
              createSearchCondition([
                'title',
                'subtitle', 
                'excerpt',
                'tags'
              ])
            ]
          },
          limit,
          depth: 2,
          locale: locale as any
        })

        results.blogPosts = blogPosts.docs.map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          subtitle: post.subtitle,
          excerpt: post.excerpt,
          tags: post.tags,
          featuredImage: post.featuredImage,
          publishedAt: post.publishedAt || post.createdAt,
          type: 'blog'
        }))
      } catch (error) {
        console.warn('Blog search failed:', error)
      }
    }

    results.totalResults = results.galleries.length + results.images.length + results.blogPosts.length

    return NextResponse.json({
      query: searchTerm,
      locale,
      results,
      pagination: {
        limit,
        total: results.totalResults
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}