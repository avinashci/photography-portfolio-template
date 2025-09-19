// Edge caching utilities optimized for Vercel deployment
import { NextResponse } from 'next/server'

export interface CacheOptions {
  maxAge?: number // seconds
  sMaxAge?: number // seconds for shared caches (CDN)
  staleWhileRevalidate?: number // seconds
  staleIfError?: number // seconds
  mustRevalidate?: boolean
  noCache?: boolean
  noStore?: boolean
  public?: boolean
  private?: boolean
}

/**
 * Generate Cache-Control header optimized for Vercel Edge caching
 */
export function getCacheControlHeader(options: CacheOptions): string {
  const parts: string[] = []

  if (options.noCache) {
    parts.push('no-cache')
  }
  
  if (options.noStore) {
    parts.push('no-store')
  }

  if (options.public) {
    parts.push('public')
  } else if (options.private) {
    parts.push('private')
  }

  if (options.maxAge !== undefined) {
    parts.push(`max-age=${options.maxAge}`)
  }

  if (options.sMaxAge !== undefined) {
    parts.push(`s-maxage=${options.sMaxAge}`)
  }

  if (options.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`)
  }

  if (options.staleIfError !== undefined) {
    parts.push(`stale-if-error=${options.staleIfError}`)
  }

  if (options.mustRevalidate) {
    parts.push('must-revalidate')
  }

  return parts.join(', ')
}

/**
 * Cache configurations for different content types
 */
export const CACHE_CONFIGS = {
  // Static assets (images, fonts, etc.)
  STATIC_ASSETS: {
    public: true,
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000,
    staleWhileRevalidate: 86400, // 1 day
  } as CacheOptions,

  // API responses for dynamic content
  API_DYNAMIC: {
    public: true,
    maxAge: 0,
    sMaxAge: 60, // 1 minute on CDN
    staleWhileRevalidate: 300, // 5 minutes
  } as CacheOptions,

  // API responses for semi-static content (galleries, blog posts)
  API_SEMI_STATIC: {
    public: true,
    maxAge: 300, // 5 minutes
    sMaxAge: 3600, // 1 hour on CDN
    staleWhileRevalidate: 86400, // 1 day
  } as CacheOptions,

  // Static pages
  STATIC_PAGES: {
    public: true,
    maxAge: 3600, // 1 hour
    sMaxAge: 86400, // 1 day on CDN
    staleWhileRevalidate: 604800, // 1 week
  } as CacheOptions,

  // Dynamic pages with user content
  DYNAMIC_PAGES: {
    public: true,
    maxAge: 0,
    sMaxAge: 300, // 5 minutes on CDN
    staleWhileRevalidate: 1800, // 30 minutes
  } as CacheOptions,

  // Never cache (for user-specific content)
  NO_CACHE: {
    noCache: true,
    noStore: true,
    mustRevalidate: true,
  } as CacheOptions,
}

/**
 * Add cache headers to NextResponse
 */
export function addCacheHeaders(
  response: NextResponse,
  config: CacheOptions
): NextResponse {
  const cacheControl = getCacheControlHeader(config)
  response.headers.set('Cache-Control', cacheControl)
  
  // Add additional performance headers
  if (config.public) {
    response.headers.set('Vary', 'Accept-Encoding, Accept')
    
    // Add ETag for better caching
    const etag = generateETag(response)
    if (etag) {
      response.headers.set('ETag', etag)
    }
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  return response
}

/**
 * Create a cached API response
 */
export function createCachedResponse(
  data: any,
  config: CacheOptions = CACHE_CONFIGS.API_SEMI_STATIC
): NextResponse {
  const response = NextResponse.json(data)
  return addCacheHeaders(response, config)
}

/**
 * Generate ETag for response caching
 */
function generateETag(response: NextResponse): string | null {
  try {
    // For JSON responses, use content hash
    const content = JSON.stringify(response)
    if (content) {
      // Simple hash function for ETag
      let hash = 0
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return `"${Math.abs(hash).toString(16)}"`
    }
  } catch (error) {
    console.warn('Failed to generate ETag:', error)
  }
  return null
}

/**
 * Conditional request handling (304 Not Modified)
 */
export function handleConditionalRequest(
  request: Request,
  etag?: string,
  lastModified?: Date
): NextResponse | null {
  // Check If-None-Match header
  if (etag) {
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }
  }

  // Check If-Modified-Since header
  if (lastModified) {
    const ifModifiedSince = request.headers.get('if-modified-since')
    if (ifModifiedSince) {
      const ifModifiedSinceDate = new Date(ifModifiedSince)
      if (lastModified <= ifModifiedSinceDate) {
        return new NextResponse(null, { status: 304 })
      }
    }
  }

  return null
}

/**
 * Cache invalidation helper
 */
export function getCacheInvalidationHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}

/**
 * Optimized caching for Vercel Edge Functions
 */
export class VercelEdgeCache {
  private static instance: VercelEdgeCache
  
  public static getInstance(): VercelEdgeCache {
    if (!VercelEdgeCache.instance) {
      VercelEdgeCache.instance = new VercelEdgeCache()
    }
    return VercelEdgeCache.instance
  }

  /**
   * Cache API response with optimized headers for Vercel
   */
  cacheApiResponse(data: any, type: keyof typeof CACHE_CONFIGS = 'API_SEMI_STATIC'): NextResponse {
    const config = CACHE_CONFIGS[type]
    const response = NextResponse.json(data)
    
    // Add timestamp for cache validation
    const timestamp = new Date().toISOString()
    response.headers.set('X-Cache-Timestamp', timestamp)
    
    return addCacheHeaders(response, config)
  }

  /**
   * Cache static content with long-term caching
   */
  cacheStaticContent(content: any, contentType: string): NextResponse {
    const response = new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
      },
    })
    
    return addCacheHeaders(response, CACHE_CONFIGS.STATIC_ASSETS)
  }

  /**
   * Handle cache revalidation
   */
  handleRevalidation(request: Request, lastModified?: Date): NextResponse | null {
    const etag = request.headers.get('if-none-match')
    return handleConditionalRequest(request, etag || undefined, lastModified)
  }
}

export const edgeCache = VercelEdgeCache.getInstance()