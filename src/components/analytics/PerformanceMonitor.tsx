'use client'

import { useEffect, useRef } from 'react'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { trackGA4Event, GA4_EVENTS } from '@/components/analytics/GoogleAnalytics'

// 🎓 LEARNING: Core Web Vitals Types
interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// 🎓 LEARNING: Performance Thresholds (Google's Standards)
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },      // Cumulative Layout Shift
  FID: { good: 100, poor: 300 },       // First Input Delay
  FCP: { good: 1800, poor: 3000 },     // First Contentful Paint
  LCP: { good: 2500, poor: 4000 },     // Largest Contentful Paint
  TTFB: { good: 800, poor: 1800 },     // Time to First Byte
  INP: { good: 200, poor: 500 },       // Interaction to Next Paint
} as const

// 🎓 LEARNING: Performance Rating Function
const getRating = (name: keyof typeof VITALS_THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = VITALS_THRESHOLDS[name]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// 🎓 LEARNING: Performance Observer Component
export const PerformanceMonitor: React.FC = () => {
  const { trackEvent, hasConsent, isInitialized } = useAnalytics()
  const reportedMetrics = useRef(new Set<string>())

  useEffect(() => {
    if (!hasConsent || !isInitialized) return

    // 🎓 LEARNING: Dynamic Import for Performance APIs
    // Only load web-vitals library when user consents
    import('web-vitals').then((webVitals) => {
      // 🎓 LEARNING: Core Web Vitals Measurement
      
      // Largest Contentful Paint (LCP)
      webVitals.onLCP((metric) => {
        handleMetric('LCP', metric as any)
      })

      // First Input Delay (FID) - Legacy, but still important
      // Note: FID may not be available in newer versions, fallback to INP
      if ('onFID' in webVitals) {
        (webVitals as any).onFID((metric: any) => {
          handleMetric('FID', metric)
        })
      }

      // Cumulative Layout Shift (CLS)
      webVitals.onCLS((metric) => {
        handleMetric('CLS', metric as any)
      })

      // First Contentful Paint (FCP)
      webVitals.onFCP((metric) => {
        handleMetric('FCP', metric as any)
      })

      // Time to First Byte (TTFB)
      webVitals.onTTFB((metric) => {
        handleMetric('TTFB', metric as any)
      })

      // Interaction to Next Paint (INP) - Replaces FID
      webVitals.onINP((metric) => {
        handleMetric('INP', metric as any)
      })
    }).catch((error) => {
      console.warn('Failed to load web-vitals:', error)
    })

    // 🎓 LEARNING: Custom Performance Monitoring
    measureCustomMetrics()
    measurePhotoSpecificMetrics()

  }, [hasConsent, isInitialized])

  // 🎓 LEARNING: Metric Handler Function
  const handleMetric = (name: WebVitalMetric['name'], metric: any) => {
    const metricKey = `${name}-${metric.id}`
    
    // Prevent duplicate reports
    if (reportedMetrics.current.has(metricKey)) return
    reportedMetrics.current.add(metricKey)

    const rating = getRating(name, metric.value)
    
    // Send to analytics
    trackEvent(GA4_EVENTS.CORE_WEB_VITALS, {
      metric_name: name,
      metric_value: Math.round(metric.value),
      metric_rating: rating,
      metric_id: metric.id,
      page_url: window.location.pathname,
      connection_type: (navigator as any).connection?.effectiveType || 'unknown',
      device_memory: (navigator as any).deviceMemory || 'unknown',
    })

    // 🎓 LEARNING: Console Logging for Development
    console.log(`📊 ${name}: ${Math.round(metric.value)}ms (${rating})`, {
      value: metric.value,
      rating,
      threshold: VITALS_THRESHOLDS[name],
      page: window.location.pathname
    })
  }

  // 🎓 LEARNING: Custom Performance Metrics
  const measureCustomMetrics = () => {
    // Measure DOM content loaded time
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const domLoadTime = performance.now()
        trackEvent('dom_content_loaded', {
          load_time: Math.round(domLoadTime),
          page_url: window.location.pathname
        })
      })
    }

    // 🎓 LEARNING: Navigation Timing API
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          // Calculate key timing metrics
          const metrics = {
            dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp_connection: navigation.connectEnd - navigation.connectStart,
            ssl_handshake: navigation.connectEnd - navigation.secureConnectionStart,
            server_response: navigation.responseStart - navigation.requestStart,
            dom_processing: navigation.domContentLoadedEventStart - navigation.responseEnd,
            resource_loading: navigation.loadEventStart - navigation.domContentLoadedEventEnd,
            total_load_time: navigation.loadEventEnd - navigation.fetchStart,
          }

          trackEvent('page_load_timing', {
            ...Object.fromEntries(
              Object.entries(metrics).map(([key, value]) => [key, Math.round(value)])
            ),
            page_url: window.location.pathname,
          })

          console.log('📊 Page Load Timing:', metrics)
        }
      }, 0)
    })
  }

  // 🎓 LEARNING: Photography-Specific Performance Metrics
  const measurePhotoSpecificMetrics = () => {
    // Monitor image loading performance
    const imageObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming
        if (resourceEntry.initiatorType === 'img' || resourceEntry.initiatorType === 'picture') {
          trackEvent('image_load_performance', {
            image_url: resourceEntry.name,
            load_time: Math.round(resourceEntry.duration),
            transfer_size: resourceEntry.transferSize,
            encoded_size: resourceEntry.encodedBodySize,
            decoded_size: resourceEntry.decodedBodySize,
            page_url: window.location.pathname,
          })
        }
      })
    })

    try {
      imageObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    // 🎓 LEARNING: Intersection Observer for Lazy Loading Performance
    const lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const startTime = performance.now()
          
          const handleImageLoad = () => {
            const loadTime = performance.now() - startTime
            
            trackEvent('lazy_image_load', {
              image_src: img.src || img.dataset.src,
              load_time: Math.round(loadTime),
              intersection_ratio: entry.intersectionRatio,
              page_url: window.location.pathname,
            })
            
            img.removeEventListener('load', handleImageLoad)
            lazyImageObserver.unobserve(img)
          }
          
          img.addEventListener('load', handleImageLoad)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    })

    // Observe images with data-src (lazy loading)
    document.querySelectorAll('img[data-src]').forEach((img) => {
      lazyImageObserver.observe(img)
    })
  }

  // 🎓 LEARNING: Component Return Pattern
  // This is a "headless" component - it doesn't render anything
  return null
}

// 🎓 LEARNING: Manual Performance Tracking Utilities
export const trackCustomPerformance = {
  // Mark the start of a custom operation
  mark: (name: string) => {
    performance.mark(`${name}-start`)
  },

  // Measure the time taken for an operation
  measure: (name: string, trackingEnabled: boolean = true) => {
    const startMark = `${name}-start`
    const endMark = `${name}-end`
    
    performance.mark(endMark)
    
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name, 'measure')[0]
      
      if (trackingEnabled && measure) {
        trackGA4Event('custom_performance', {
          operation_name: name,
          duration: Math.round(measure.duration),
          page_url: window.location.pathname,
        })
        
        console.log(`📊 Custom Performance - ${name}: ${Math.round(measure.duration)}ms`)
      }
      
      // Cleanup
      performance.clearMarks(startMark)
      performance.clearMarks(endMark)
      performance.clearMeasures(name)
      
      return measure?.duration || 0
    } catch (error) {
      console.warn(`Performance measurement failed for ${name}:`, error)
      return 0
    }
  },

  // Track gallery loading performance
  trackGalleryLoad: (galleryId: string, imageCount: number) => {
    const startTime = performance.now()
    
    return () => {
      const loadTime = performance.now() - startTime
      
      trackGA4Event('gallery_load_performance', {
        gallery_id: galleryId,
        image_count: imageCount,
        load_time: Math.round(loadTime),
        average_per_image: Math.round(loadTime / imageCount),
        page_url: window.location.pathname,
      })
    }
  },

  // Track image zoom performance
  trackImageZoom: (imageId: string) => {
    const startTime = performance.now()
    
    return () => {
      const zoomTime = performance.now() - startTime
      
      trackGA4Event('image_zoom_performance', {
        image_id: imageId,
        zoom_time: Math.round(zoomTime),
        page_url: window.location.pathname,
      })
    }
  }
}

export default PerformanceMonitor