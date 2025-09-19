import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { edgeCache, CACHE_CONFIGS } from '@/lib/cache/edge-cache'

interface PerformanceMetrics {
  timestamp: string
  cacheStatus: {
    galleries: string
    images: string
    blogPosts: string
    globalHome: string
    globalSettings: string
  }
  buildInfo: {
    nextVersion: string
    nodeVersion: string
    environment: string
  }
  optimization: {
    imageOptimization: boolean
    bundleSplitting: boolean
    cssOptimization: boolean
    serverComponents: boolean
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for secret to confirm this is a valid request
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      cacheStatus: {
        galleries: 'active',
        images: 'active', 
        blogPosts: 'active',
        globalHome: 'active',
        globalSettings: 'active'
      },
      buildInfo: {
        nextVersion: process.env.npm_package_dependencies_next || '15.4.6',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      optimization: {
        imageOptimization: true, // Next.js Image component enabled
        bundleSplitting: true, // Advanced webpack bundle splitting
        cssOptimization: true, // Tailwind CSS optimization
        serverComponents: true // React Server Components
      }
    }

    // Use edge caching for performance metrics (short-lived cache)
    return edgeCache.cacheApiResponse(metrics, 'API_DYNAMIC')
  } catch (err) {
    console.error('Performance metrics error:', err)
    return NextResponse.json(
      { message: 'Error retrieving metrics', error: err }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for secret to confirm this is a valid request
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { action, tags } = body

    if (action === 'warm-cache') {
      // Warm up critical cache paths
      const criticalTags = [
        'global_home',
        'global_settings', 
        'galleries-list-optimized',
        'galleries-paginated',
        'blog-posts-list'
      ]
      
      for (const tag of criticalTags) {
        revalidateTag(tag)
      }
      
      return NextResponse.json({
        message: 'Cache warmed successfully',
        tags: criticalTags,
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'clear-cache' && tags) {
      for (const tag of tags) {
        revalidateTag(tag)
      }
      
      return NextResponse.json({
        message: 'Cache cleared successfully',
        tags,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { message: 'Invalid action' }, 
      { status: 400 }
    )
  } catch (err) {
    console.error('Performance action error:', err)
    return NextResponse.json(
      { message: 'Error performing action', error: err }, 
      { status: 500 }
    )
  }
}