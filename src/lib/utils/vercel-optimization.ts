// Vercel-specific optimization utilities
import { NextRequest, NextResponse } from 'next/server'
import { edgeCache } from '@/lib/cache/edge-cache'

/**
 * Vercel Edge Function optimizations
 */
export class VercelOptimizer {
  /**
   * Optimize response with proper cache headers for Vercel Edge
   */
  static optimizeEdgeResponse(
    data: any,
    options: {
      maxAge?: number
      staleWhileRevalidate?: number
      tags?: string[]
      vary?: string[]
    } = {}
  ): NextResponse {
    const {
      maxAge = 3600, // 1 hour default
      staleWhileRevalidate = 86400, // 24 hours default
      tags = [],
      vary = []
    } = options

    const response = NextResponse.json(data)

    // Vercel-optimized cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
    )

    // Edge cache tags for selective invalidation
    if (tags.length > 0) {
      response.headers.set('Cache-Tag', tags.join(','))
    }

    // Vary header for conditional caching
    if (vary.length > 0) {
      response.headers.set('Vary', vary.join(', '))
    }

    // Vercel-specific headers
    response.headers.set('X-Edge-Cache', 'MISS')
    response.headers.set('CDN-Cache-Control', `public, max-age=${maxAge}`)

    return response
  }

  /**
   * ISR (Incremental Static Regeneration) optimization
   */
  static getISRConfig(pageType: 'static' | 'dynamic' | 'hybrid') {
    switch (pageType) {
      case 'static':
        return {
          revalidate: 3600, // 1 hour
          generateStaticParams: true
        }
      case 'dynamic':
        return {
          revalidate: 300, // 5 minutes
          generateStaticParams: false
        }
      case 'hybrid':
        return {
          revalidate: 1800, // 30 minutes
          generateStaticParams: true
        }
      default:
        return {
          revalidate: 3600
        }
    }
  }

  /**
   * Edge runtime configuration for API routes
   */
  static getEdgeConfig() {
    return {
      runtime: 'edge',
      regions: ['iad1'], // Primary region (adjust based on your users)
      unstable_allowDynamic: [
        // Allow specific modules in Edge runtime if needed
        '/lib/utils/edge-safe-modules.js',
      ]
    }
  }

  /**
   * Optimize images for CDN delivery
   */
  static optimizeImageDelivery(
    src: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'auto'
      blur?: boolean
    } = {}
  ): string {
    const {
      width,
      height,
      quality = 85,
      format = 'auto',
      blur = false
    } = options

    const url = new URL('/_next/image', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    url.searchParams.set('url', src)
    
    if (width) url.searchParams.set('w', width.toString())
    if (height) url.searchParams.set('h', height.toString())
    url.searchParams.set('q', quality.toString())
    
    // Vercel automatically handles format optimization
    if (format !== 'auto') {
      url.searchParams.set('fm', format)
    }
    
    if (blur) {
      url.searchParams.set('blur', '20')
    }

    return url.toString()
  }

  /**
   * Preload critical resources for better FCP
   */
  static generatePreloadHeaders(resources: {
    fonts?: string[]
    images?: string[]
    scripts?: string[]
    styles?: string[]
  }): Record<string, string> {
    const links: string[] = []

    // Fonts (highest priority)
    resources.fonts?.forEach(font => {
      links.push(`<${font}>; rel=preload; as=font; type=font/woff2; crossorigin`)
    })

    // Critical images
    resources.images?.forEach(image => {
      links.push(`<${image}>; rel=preload; as=image; fetchpriority=high`)
    })

    // Critical scripts
    resources.scripts?.forEach(script => {
      links.push(`<${script}>; rel=preload; as=script`)
    })

    // Critical styles
    resources.styles?.forEach(style => {
      links.push(`<${style}>; rel=preload; as=style`)
    })

    return links.length > 0 ? { Link: links.join(', ') } : {}
  }

  /**
   * Generate optimal cache configuration for different content types
   */
  static getCacheConfig(contentType: 'page' | 'api' | 'image' | 'font' | 'static') {
    const configs = {
      page: {
        'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, max-age=3600',
        'Vercel-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      },
      api: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'public, max-age=60'
      },
      image: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable'
      },
      font: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      },
      static: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable'
      }
    }

    return configs[contentType]
  }

  /**
   * Middleware helper for edge optimization
   */
  static async optimizeRequest(request: NextRequest): Promise<NextResponse | null> {
    const { pathname } = request.nextUrl
    
    // Skip optimization for API routes that shouldn't be cached
    if (pathname.startsWith('/api/') && this.shouldSkipCache(pathname)) {
      return null
    }

    // Apply edge caching for appropriate requests
    if (pathname.startsWith('/api/') && this.shouldEdgeCache(pathname)) {
      const cacheKey = `edge:${pathname}:${request.nextUrl.searchParams.toString()}`
      
      // Note: Edge cache would be implemented in middleware
      // This is a placeholder for demonstration
      try {
        // Implement actual cache retrieval based on your edge cache strategy
        return null // Return null to continue with normal processing
      } catch (error) {
        // Cache miss or error, continue normally
        return null
      }
    }

    return null
  }

  private static shouldSkipCache(pathname: string): boolean {
    const skipPaths = [
      '/api/auth',
      '/api/webhooks',
      '/api/revalidate',
      '/api/health',
      '/api/db-health'
    ]
    return skipPaths.some(path => pathname.startsWith(path))
  }

  private static shouldEdgeCache(pathname: string): boolean {
    const cachePaths = [
      '/api/galleries',
      '/api/blog-posts',
      '/api/images',
      '/api/search',
      '/api/performance',
      '/api/analytics'
    ]
    return cachePaths.some(path => pathname.startsWith(path))
  }
}

/**
 * Generate Vercel deployment configuration
 */
export function generateVercelConfig() {
  return {
    version: 2,
    framework: 'nextjs',
    buildCommand: 'pnpm build',
    outputDirectory: '.next',
    installCommand: 'pnpm install --frozen-lockfile',
    functions: {
      'pages/api/performance.ts': {
        maxDuration: 10
      },
      'pages/api/analytics/**.ts': {
        maxDuration: 15
      }
    },
    headers: [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ],
    rewrites: [
      {
        source: '/health',
        destination: '/api/health'
      }
    ]
  }
}

/**
 * Edge-safe modules configuration
 */
export const EDGE_SAFE_MODULES = [
  '@/lib/cache/edge-cache',
  '@/lib/utils/edge-helpers',
  '@/lib/utils/validation'
]

/**
 * Region configuration for optimal performance
 */
export const VERCEL_REGIONS = {
  primary: ['iad1'], // US East (primary for most users)
  secondary: ['sfo1', 'fra1'], // US West, Europe
  all: ['iad1', 'sfo1', 'fra1', 'sin1', 'syd1'] // Global distribution
} as const