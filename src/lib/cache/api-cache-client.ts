// Enhanced API client with edge caching support for Vercel
'use client'

interface CachedResponse<T> {
  data: T
  timestamp: number
  etag?: string
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  maxAge: number
  etag?: string
}

class ApiCacheClient {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_MAX_AGE = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch data with client-side caching
   */
  async fetch<T>(url: string, options: RequestInit = {}, maxAge?: number): Promise<T> {
    const cacheKey = this.getCacheKey(url, options)
    const cachedEntry = this.cache.get(cacheKey)

    // Check if cache is still valid
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return cachedEntry.data
    }

    try {
      // Add conditional headers if we have cached data
      const headers = new Headers(options.headers)
      if (cachedEntry?.etag) {
        headers.set('If-None-Match', cachedEntry.etag)
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle 304 Not Modified
      if (response.status === 304 && cachedEntry) {
        // Update timestamp but keep existing data
        cachedEntry.timestamp = Date.now()
        return cachedEntry.data
      }

      if (!response.ok) {
        // If we have stale cache data, return it
        if (cachedEntry) {
          console.warn(`API request failed, returning stale cache for ${url}`)
          return cachedEntry.data
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: T = await response.json()
      const etag = response.headers.get('etag')

      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        maxAge: maxAge || this.DEFAULT_MAX_AGE,
        etag: etag || undefined,
      })

      return data
    } catch (error) {
      // Return stale cache if available and network fails
      if (cachedEntry) {
        console.warn(`Network error, returning stale cache for ${url}:`, error)
        return cachedEntry.data
      }
      throw error
    }
  }

  /**
   * Invalidate cache for specific URL pattern
   */
  invalidate(urlPattern: string | RegExp): void {
    const pattern = typeof urlPattern === 'string' 
      ? new RegExp(urlPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      : urlPattern

    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (pattern.test(key)) {
        this.cache.delete(key)
      }
    })
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const entries = Array.from(this.cache.values())
    const valid = entries.filter(entry => this.isCacheValid(entry))
    const stale = entries.filter(entry => !this.isCacheValid(entry))

    return {
      total: entries.length,
      valid: valid.length,
      stale: stale.length,
      hitRate: this.calculateHitRate(),
    }
  }

  private getCacheKey(url: string, options: RequestInit): string {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }

  private isCacheValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.maxAge
  }

  private hitCount = 0
  private missCount = 0

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount
    return total > 0 ? this.hitCount / total : 0
  }

  /**
   * Performance metrics fetcher with optimized caching
   */
  async fetchPerformanceMetrics(secret: string) {
    return this.fetch(`/api/performance?secret=${secret}`, {}, 60 * 1000) // 1 minute cache
  }

  /**
   * Web Vitals fetcher with optimized caching
   */
  async fetchWebVitals(secret: string, hours = 24) {
    return this.fetch(`/api/analytics/web-vitals?secret=${secret}&hours=${hours}`, {}, 2 * 60 * 1000) // 2 minute cache
  }

  /**
   * Page performance fetcher with optimized caching
   */
  async fetchPagePerformance(secret: string, hours = 24) {
    return this.fetch(`/api/analytics/page-performance?secret=${secret}&hours=${hours}`, {}, 5 * 60 * 1000) // 5 minute cache
  }
}

// Singleton instance
export const apiCacheClient = new ApiCacheClient()

/**
 * React hook for cached API calls
 */
export function useCachedApi() {
  return {
    fetch: apiCacheClient.fetch.bind(apiCacheClient),
    invalidate: apiCacheClient.invalidate.bind(apiCacheClient),
    clearCache: apiCacheClient.clearAll.bind(apiCacheClient),
    getCacheStats: apiCacheClient.getCacheStats.bind(apiCacheClient),
    fetchPerformanceMetrics: apiCacheClient.fetchPerformanceMetrics.bind(apiCacheClient),
    fetchWebVitals: apiCacheClient.fetchWebVitals.bind(apiCacheClient),
    fetchPagePerformance: apiCacheClient.fetchPagePerformance.bind(apiCacheClient),
  }
}