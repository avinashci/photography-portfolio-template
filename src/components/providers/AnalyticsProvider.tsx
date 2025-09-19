'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { SITE_CONFIG } from '@/config/site.config'
import { trackGA4Event, GA4_EVENTS, trackPhotoEngagement, trackGalleryEngagement } from '@/components/analytics/GoogleAnalytics'

// 🎓 LEARNING: TypeScript Interface Design
// This interface defines the shape of our analytics context
// Professional practice: Always type your context for better developer experience
interface AnalyticsContextType {
  // Tracking functions
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void
  trackPageView: (url: string, title?: string) => void
  trackPhotoView: (imageId: string, title: string, gallery?: string) => void
  trackGalleryView: (galleryId: string, title: string) => void
  trackPhotoInteraction: (action: 'zoom' | 'share' | 'download', imageId: string) => void
  
  // State management
  isInitialized: boolean
  hasConsent: boolean | null // null = not decided, true/false = user choice
  
  // Consent management
  grantConsent: () => void
  denyConsent: () => void
  resetConsent: () => void
}

// 🎓 LEARNING: Context Creation Pattern
// Creating context with undefined initial value is a common pattern
// This forces us to use the context only within a provider
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

// 🎓 LEARNING: Custom Hook Pattern
// This is a professional pattern for consuming context
// It provides type safety and better error messages
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

interface AnalyticsProviderProps {
  children: ReactNode
}

// 🎓 LEARNING: Provider Pattern Implementation
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  // 🎓 LEARNING: LocalStorage State Persistence
  // Professional practice: Persist user preferences across sessions
  useEffect(() => {
    const storedConsent = localStorage.getItem('analytics-consent')
    if (storedConsent !== null) {
      setHasConsent(storedConsent === 'true')
    }
  }, [])

  // 🎓 LEARNING: Effect Dependencies and Cleanup
  // Initialize analytics when consent is granted
  useEffect(() => {
    if (hasConsent === true && !isInitialized) {
      initializeAnalytics()
      setIsInitialized(true)
    }
  }, [hasConsent, isInitialized])

  // 🎓 LEARNING: Async Initialization Pattern
  const initializeAnalytics = async () => {
    if (SITE_CONFIG.analytics.ga4.enabled && SITE_CONFIG.analytics.ga4.measurementId) {
      // Initialize GA4 tracking
      trackGA4Event('analytics_consent_granted', {
        consent_timestamp: new Date().toISOString(),
        privacy_mode: SITE_CONFIG.analytics.privacy.anonymizeIp ? 'privacy_enhanced' : 'standard'
      })
    } else {
    }
  }

  // 🎓 LEARNING: Event Tracking Function Design
  // Professional practice: Create consistent, typed event tracking
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (!hasConsent || !isInitialized) {
      return
    }

    // Add standard parameters for all events
    const eventData = {
      ...parameters,
      site_section: 'photography_portfolio',
      user_language: document.documentElement.lang || 'en',
      timestamp: new Date().toISOString(),
    }

    // Send to GA4 if configured
    if (SITE_CONFIG.analytics.ga4.enabled && SITE_CONFIG.analytics.ga4.measurementId) {
      trackGA4Event(eventName, eventData)
    } else {
    }
  }

  // 🎓 LEARNING: Specialized Tracking Functions
  // Photography-specific event tracking
  const trackPageView = (url: string, title?: string) => {
    trackEvent('page_view', {
      page_location: url,
      page_title: title || document.title,
    })
  }

  const trackPhotoView = (imageId: string, title: string, gallery?: string) => {
    if (SITE_CONFIG.analytics.events.trackPhotoViews) {
      // Use specialized GA4 tracking function
      if (SITE_CONFIG.analytics.ga4.enabled) {
        trackPhotoEngagement('view', imageId, { title, gallery })
      }
      trackEvent('photo_view', {
        content_type: 'image',
        content_id: imageId,
        content_title: title,
        content_gallery: gallery,
        value: 1,
      })
    }
  }

  const trackGalleryView = (galleryId: string, title: string) => {
    if (SITE_CONFIG.analytics.events.trackGalleryViews) {
      // Use specialized GA4 tracking function
      if (SITE_CONFIG.analytics.ga4.enabled) {
        trackGalleryEngagement(galleryId, { title })
      }
      trackEvent('gallery_view', {
        content_type: 'gallery',
        content_id: galleryId,
        content_title: title,
        value: 5,
      })
    }
  }

  const trackPhotoInteraction = (action: 'zoom' | 'share' | 'download', imageId: string) => {
    // Use specialized GA4 tracking function
    if (SITE_CONFIG.analytics.ga4.enabled) {
      trackPhotoEngagement(action, imageId)
    }
    trackEvent('photo_interaction', {
      interaction_type: action,
      content_id: imageId,
      value: action === 'download' ? 10 : 1,
    })
  }

  // 🎓 LEARNING: Consent Management Functions
  const grantConsent = () => {
    setHasConsent(true)
    localStorage.setItem('analytics-consent', 'true')
  }

  const denyConsent = () => {
    setHasConsent(false)
    localStorage.setItem('analytics-consent', 'false')
  }

  const resetConsent = () => {
    setHasConsent(null)
    localStorage.removeItem('analytics-consent')
  }

  // 🎓 LEARNING: Context Value Object
  // Memoizing context value to prevent unnecessary re-renders
  const contextValue: AnalyticsContextType = {
    // Tracking functions
    trackEvent,
    trackPageView,
    trackPhotoView,
    trackGalleryView,
    trackPhotoInteraction,
    
    // State
    isInitialized,
    hasConsent,
    
    // Consent management
    grantConsent,
    denyConsent,
    resetConsent,
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// 🎓 LEARNING: TypeScript Export Patterns
// Export both the hook and provider for clean imports
export default AnalyticsProvider