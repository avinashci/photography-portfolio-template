'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Dynamic import to avoid SSR issues and reduce bundle size
    const initWebVitals = async () => {
      try {
        const { initWebVitals, trackPageLoad, trackResourceLoading, trackWebVitalsWithContext } = await import('@/lib/analytics/web-vitals')
        
        // Initialize Web Vitals tracking
        initWebVitals()
        trackPageLoad()
        trackResourceLoading()
        trackWebVitalsWithContext()
      } catch (error) {
        console.error('Failed to initialize Web Vitals:', error)
      }
    }

    // Only initialize in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
      initWebVitals()
    }
  }, [])

  // Track route changes
  useEffect(() => {
    // Track page views for SPA navigation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_path: pathname,
      })
    }
  }, [pathname])

  return <>{children}</>
}