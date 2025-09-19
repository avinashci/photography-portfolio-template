'use client'

import Script from 'next/script'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { SITE_CONFIG } from '@/config/site.config'

// 🎓 LEARNING: Google Analytics 4 Types
// Professional practice: Type your analytics functions for better DX
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer: Record<string, any>[]
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

// 🎓 LEARNING: Content Categorization Logic
// Professional practice: Categorize content for better analytics insights
const getPageSection = (path: string): string => {
  if (path.includes('/galleries')) return 'gallery'
  if (path.includes('/blog')) return 'blog'
  if (path.includes('/gear')) return 'gear'
  if (path.includes('/about')) return 'about'
  if (path === '/en' || path === '/ta') return 'homepage'
  return 'other'
}

// 🎓 LEARNING: Page Tracking Component (needs Suspense)
// Separate component for useSearchParams to avoid build issues
const PageTracker: React.FC = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 🎓 LEARNING: Automatic Page View Tracking
  // Modern GA4 pattern: Track route changes in Next.js App Router
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      const url = pathname + searchParams.toString()
      
      // Enhanced page view tracking for photography sites
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: url,
        page_title: document.title,
        // Photography-specific parameters
        site_section: getPageSection(pathname),
        content_language: document.documentElement.lang || 'en',
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      })
    }
  }, [pathname, searchParams])

  return null
}

// 🎓 LEARNING: GA4 Component Architecture
// This component handles all GA4 initialization and page tracking
export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ measurementId }) => {

  return (
    <>
      {/* 🎓 LEARNING: Page Tracking with Suspense */}
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
      
      {/* 🎓 LEARNING: Next.js Script Optimization */}
      {/* Strategy="afterInteractive" loads after page is interactive */}
      {/* This is optimal for analytics - doesn't block page rendering */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // 🎓 LEARNING: GA4 Initialization Code
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Set initial timestamp
            gtag('js', new Date());
            
            // Configure GA4 with photography-optimized settings
            gtag('config', '${measurementId}', {
              // 🎓 LEARNING: Privacy-First Configuration
              // These settings comply with GDPR and improve user privacy
              anonymize_ip: true,                    // Anonymize IP addresses
              allow_google_signals: false,           // Disable remarketing data
              allow_ad_personalization_signals: false, // Disable ad personalization
              
              // 🎓 LEARNING: Performance Optimization
              send_page_view: false,                 // We handle page views manually
              transport_type: 'beacon',              // Use sendBeacon API for reliability
              
              // 🎓 LEARNING: Photography Site Optimizations
              content_group1: 'Photography Portfolio', // Content grouping
              custom_map: {
                'dimension1': 'page_section',         // Custom dimension mapping
                'dimension2': 'content_language',
                'dimension3': 'image_category',
                'dimension4': 'gallery_name',
                'dimension5': 'equipment_used'
              },
              
              // 🎓 LEARNING: Enhanced Measurement Settings
              enhanced_conversions: true,            // Better conversion tracking
              linker: {
                domains: [new URL('${SITE_CONFIG.url.base}').hostname] // Cross-domain tracking
              }
            });
            
            // 🎓 LEARNING: Custom Photography Events Setup
            // Define standard events for photography sites
            gtag('event', 'analytics_initialized', {
              site_type: 'photography_portfolio',
              template_version: '2.0.0',
              cms_type: 'payload',
              framework: 'nextjs_15'
            });
          `,
        }}
      />
    </>
  )
}

// 🎓 LEARNING: Analytics Utility Functions
// Export utility functions for manual event tracking
export const GA4_EVENTS = {
  // Photography-specific events
  PHOTO_VIEW: 'photo_view',
  PHOTO_ZOOM: 'photo_zoom', 
  PHOTO_SHARE: 'photo_share',
  PHOTO_DOWNLOAD: 'photo_download',
  GALLERY_VIEW: 'gallery_view',
  GALLERY_COMPLETE: 'gallery_complete',
  
  // Engagement events
  CONTACT_FORM: 'contact_form_submit',
  EMAIL_SIGNUP: 'email_signup',
  SOCIAL_FOLLOW: 'social_follow',
  
  // Performance events
  IMAGE_LOAD_TIME: 'image_load_time',
  PAGE_LOAD_TIME: 'page_load_time',
  CORE_WEB_VITALS: 'core_web_vitals'
} as const

// 🎓 LEARNING: Type-Safe Event Tracking
export const trackGA4Event = (
  eventName: string, 
  parameters: Record<string, any> = {}
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Add standard parameters to all events
    const eventData = {
      ...parameters,
      event_category: 'photography_site',
      event_timestamp: Date.now(),
      page_location: window.location.href,
      page_referrer: document.referrer || 'direct',
    }
    
    window.gtag('event', eventName, eventData)
  }
}

// 🎓 LEARNING: Photography-Specific Tracking Functions
export const trackPhotoEngagement = (
  action: 'view' | 'zoom' | 'share' | 'download',
  imageId: string,
  metadata?: {
    title?: string
    gallery?: string
    category?: string
    equipment?: string
    location?: string
  }
) => {
  trackGA4Event(GA4_EVENTS.PHOTO_VIEW, {
    content_type: 'image',
    content_id: imageId,
    content_title: metadata?.title,
    content_category: metadata?.category,
    gallery_name: metadata?.gallery,
    equipment_used: metadata?.equipment,
    photo_location: metadata?.location,
    engagement_type: action,
    value: action === 'download' ? 10 : action === 'share' ? 5 : 1
  })
}

export const trackGalleryEngagement = (
  galleryId: string,
  metadata?: {
    title?: string
    imageCount?: number
    category?: string
    completionRate?: number
  }
) => {
  trackGA4Event(GA4_EVENTS.GALLERY_VIEW, {
    content_type: 'gallery',
    content_id: galleryId,
    content_title: metadata?.title,
    content_category: metadata?.category,
    gallery_image_count: metadata?.imageCount,
    gallery_completion_rate: metadata?.completionRate,
    value: 5
  })
}

export default GoogleAnalytics