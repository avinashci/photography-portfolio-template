import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

export interface WebVitalsData {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  timestamp: number
  url: string
  userAgent: string
  connectionType?: string
  deviceMemory?: number
}

// Performance thresholds based on Google's recommendations
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (replaces FID)
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

function getDeviceInfo() {
  const nav = navigator as any
  return {
    connectionType: nav.connection?.effectiveType || 'unknown',
    deviceMemory: nav.deviceMemory || 'unknown',
    hardwareConcurrency: nav.hardwareConcurrency || 'unknown'
  }
}

function sendToAnalytics(metric: WebVitalsData) {
  // Send to your analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_parameter_1: metric.rating,
        custom_parameter_2: metric.id,
      })
    }

    // Send to internal API for monitoring
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(console.error)
  } else {
    console.log('Web Vitals:', metric)
  }
}

function handleMetric(metric: Metric) {
  const deviceInfo = getDeviceInfo()
  
  const vitalsData: WebVitalsData = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    connectionType: deviceInfo.connectionType,
    deviceMemory: deviceInfo.deviceMemory
  }

  sendToAnalytics(vitalsData)
}

export function initWebVitals() {
  try {
    onCLS(handleMetric)
    onINP(handleMetric)
    onFCP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)
  } catch (error) {
    console.error('Error initializing Web Vitals:', error)
  }
}

// Additional performance monitoring
export function trackPageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (perfData) {
      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        ttfb: perfData.responseStart - perfData.requestStart,
        download: perfData.responseEnd - perfData.responseStart,
        dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        load: perfData.loadEventEnd - perfData.loadEventStart,
        total: perfData.loadEventEnd - perfData.fetchStart // Use fetchStart instead of navigationStart
      }

      // Send page load metrics
      fetch('/api/analytics/page-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: window.location.href,
          metrics,
          timestamp: Date.now()
        }),
      }).catch(console.error)
    }
  })
}

// Track resource loading performance
export function trackResourceLoading() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming
        
        // Track slow resources (>1s load time)
        if (resourceEntry.duration > 1000) {
          fetch('/api/analytics/slow-resources', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: window.location.href,
              resource: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize,
              type: resourceEntry.initiatorType,
              timestamp: Date.now()
            }),
          }).catch(console.error)
        }
      }
    }
  })

  observer.observe({ entryTypes: ['resource'] })
}

// Enhanced Core Web Vitals tracking with user context
export function trackWebVitalsWithContext() {
  if (typeof window === 'undefined') return

  const context = {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio,
    colorDepth: screen.colorDepth,
    cookieEnabled: navigator.cookieEnabled,
    language: navigator.language,
    platform: navigator.platform,
    referrer: document.referrer,
    timestamp: Date.now()
  }

  // Store context for all vitals measurements
  ;(window as any).__webVitalsContext = context
}