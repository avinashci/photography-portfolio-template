'use client'

import React, { useState, useEffect } from 'react'
import { useCachedApi } from '@/lib/cache/api-cache-client'

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

interface WebVitalsData {
  summary: {
    total: number
    byMetric: Record<string, any>
    byRating: {
      good: number
      'needs-improvement': number
      poor: number
    }
    averageValues: Record<string, number>
  }
  data: any[]
  timestamp: string
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [webVitals, setWebVitals] = useState<WebVitalsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { fetchPerformanceMetrics, fetchWebVitals, getCacheStats, clearCache } = useCachedApi()
  const [cacheStats, setCacheStats] = useState<any>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'dev-secret'
      
      // Fetch performance metrics using cached client
      const metricsData = await fetchPerformanceMetrics(secret) as PerformanceMetrics
      setMetrics(metricsData)
      
      // Fetch Web Vitals data using cached client
      const vitalsData = await fetchWebVitals(secret) as WebVitalsData
      setWebVitals(vitalsData)
      
      // Update cache stats
      setCacheStats(getCacheStats())
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }

  const performCacheAction = async (action: string, tags?: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET
      const response = await fetch(`/api/performance?secret=${secret}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, tags }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh metrics after action
      await fetchMetrics()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (loading && !metrics) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {metrics && (
        <div className="space-y-6">
          {/* Cache Status */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Cache Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(metrics.cacheStatus).map(([key, status]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Features */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Optimizations</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(metrics.optimization).map(([key, enabled]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Build Info */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Build Information</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Next.js: {metrics.buildInfo.nextVersion}</div>
              <div>Node.js: {metrics.buildInfo.nodeVersion}</div>
              <div>Environment: <span className="capitalize">{metrics.buildInfo.environment}</span></div>
              <div>Last Updated: {new Date(metrics.timestamp).toLocaleString()}</div>
            </div>
          </div>

          {/* Web Vitals */}
          {webVitals && webVitals.summary.total > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Web Vitals (Last 24h)</h4>
              <div className="space-y-4">
                {/* Overall Rating */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Good: {webVitals.summary.byRating.good}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Needs Improvement: {webVitals.summary.byRating['needs-improvement']}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Poor: {webVitals.summary.byRating.poor}</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(webVitals.summary.byMetric).map(([metric, data]: [string, any]) => (
                    <div key={metric} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 uppercase">{metric}</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {metric === 'CLS' ? data.average.toFixed(3) : Math.round(data.average)}
                        {metric === 'CLS' ? '' : metric.includes('FCP') || metric.includes('LCP') || metric.includes('TTFB') || metric.includes('INP') ? 'ms' : ''}
                      </div>
                      <div className="text-xs text-gray-600">
                        P75: {metric === 'CLS' ? data.p75.toFixed(3) : Math.round(data.p75)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Client-side Cache Stats */}
          {cacheStats && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Client Cache Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-blue-500 uppercase">Total Entries</div>
                  <div className="text-lg font-semibold text-blue-900">{cacheStats.total}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-green-500 uppercase">Valid</div>
                  <div className="text-lg font-semibold text-green-900">{cacheStats.valid}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-yellow-500 uppercase">Stale</div>
                  <div className="text-lg font-semibold text-yellow-900">{cacheStats.stale}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-purple-500 uppercase">Hit Rate</div>
                  <div className="text-lg font-semibold text-purple-900">
                    {(cacheStats.hitRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cache Actions */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Cache Management</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => performCacheAction('warm-cache')}
                disabled={loading}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Warm Cache
              </button>
              <button
                onClick={() => performCacheAction('clear-cache', ['galleries', 'images'])}
                disabled={loading}
                className="px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Clear Gallery Cache
              </button>
              <button
                onClick={() => performCacheAction('clear-cache', ['blog-posts'])}
                disabled={loading}
                className="px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Clear Blog Cache
              </button>
              <button
                onClick={() => { clearCache(); setCacheStats(getCacheStats()); }}
                disabled={loading}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Clear Client Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}