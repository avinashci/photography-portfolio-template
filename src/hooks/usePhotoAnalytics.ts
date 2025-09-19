import { useCallback } from 'react'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { trackCustomPerformance } from '@/components/analytics/PerformanceMonitor'

// 🎓 LEARNING: Custom Hook Pattern for Photography Analytics
// This demonstrates how to create domain-specific analytics hooks
export const usePhotoAnalytics = () => {
  const { 
    trackPhotoView, 
    trackGalleryView, 
    trackPhotoInteraction,
    hasConsent,
    isInitialized 
  } = useAnalytics()

  // 🎓 LEARNING: Photo View Tracking with Performance
  const trackPhotoViewWithPerformance = useCallback((
    imageId: string, 
    title: string, 
    metadata?: {
      gallery?: string
      category?: string
      location?: string
      equipment?: string
      fileSize?: number
      dimensions?: { width: number; height: number }
    }
  ) => {
    if (!hasConsent || !isInitialized) return

    // Track the view event
    trackPhotoView(imageId, title, metadata?.gallery)
    
    // Start performance measurement for image loading
    const performanceTracker = trackCustomPerformance.trackGalleryLoad(imageId, 1)
    
    console.log('📸 Photo view tracked:', {
      imageId,
      title,
      metadata,
      hasConsent,
      isInitialized
    })
    
    return performanceTracker
  }, [trackPhotoView, hasConsent, isInitialized])

  // 🎓 LEARNING: Gallery Engagement Tracking
  const trackGalleryEngagement = useCallback((
    galleryId: string, 
    title: string,
    metadata?: {
      imageCount?: number
      category?: string
      viewDuration?: number
      completionRate?: number
    }
  ) => {
    if (!hasConsent || !isInitialized) return

    trackGalleryView(galleryId, title)
    
    // Track gallery-specific performance
    const performanceTracker = trackCustomPerformance.trackGalleryLoad(
      galleryId, 
      metadata?.imageCount || 0
    )
    
    console.log('🖼️ Gallery engagement tracked:', {
      galleryId,
      title,
      metadata,
      hasConsent,
      isInitialized
    })
    
    return performanceTracker
  }, [trackGalleryView, hasConsent, isInitialized])

  // 🎓 LEARNING: Photo Interaction Tracking
  const trackPhotoInteractionWithContext = useCallback((
    action: 'zoom' | 'share' | 'download',
    imageId: string,
    context?: {
      gallery?: string
      position?: number
      totalImages?: number
      zoomLevel?: number
      shareDestination?: string
    }
  ) => {
    if (!hasConsent || !isInitialized) return

    // Performance tracking for zoom actions
    let performanceTracker: (() => void) | undefined
    if (action === 'zoom') {
      performanceTracker = trackCustomPerformance.trackImageZoom(imageId)
    }

    trackPhotoInteraction(action, imageId)
    
    console.log('🎯 Photo interaction tracked:', {
      action,
      imageId,
      context,
      hasConsent,
      isInitialized
    })
    
    return performanceTracker
  }, [trackPhotoInteraction, hasConsent, isInitialized])

  return {
    // Basic tracking functions
    trackPhotoView: trackPhotoViewWithPerformance,
    trackGalleryView: trackGalleryEngagement,
    trackPhotoInteraction: trackPhotoInteractionWithContext,
    
    // State
    hasConsent,
    isInitialized,
    isEnabled: hasConsent && isInitialized,
    
    // Performance utilities
    trackCustomPerformance,
  }
}

export default usePhotoAnalytics