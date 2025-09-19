'use client'

import { useState, useCallback } from 'react'

export type ImageOrientation = 'landscape' | 'portrait' | 'square' | 'loading'

export interface UseImageOrientationReturn {
  orientation: ImageOrientation
  handleImageLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void
  getObjectFitClass: () => string
}

/**
 * Custom hook to detect image orientation and apply appropriate CSS classes
 *
 * Usage:
 * const { orientation, handleImageLoad, getObjectFitClass } = useImageOrientation()
 *
 * <img
 *   src={src}
 *   onLoad={handleImageLoad}
 *   className={`w-full h-full ${getObjectFitClass()} transition-transform duration-700`}
 * />
 */
export function useImageOrientation(): UseImageOrientationReturn {
  const [orientation, setOrientation] = useState<ImageOrientation>('loading')

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement
    const aspectRatio = img.naturalWidth / img.naturalHeight

    // Determine orientation based on aspect ratio
    if (Math.abs(aspectRatio - 1) < 0.1) {
      // Nearly square (aspect ratio close to 1:1)
      setOrientation('square')
    } else if (aspectRatio > 1) {
      // Landscape (width > height)
      setOrientation('landscape')
    } else {
      // Portrait (width < height)
      setOrientation('portrait')
    }
  }, [])

  const getObjectFitClass = useCallback(() => {
    switch (orientation) {
      case 'landscape':
      case 'square':
        // Fill container completely for landscape and square images
        return 'object-cover'
      case 'portrait':
        // Fit within container for portrait images (letterbox/pillarbox)
        return 'object-contain'
      case 'loading':
      default:
        // Default while loading - you can choose your preference
        return 'object-contain'
    }
  }, [orientation])

  return {
    orientation,
    handleImageLoad,
    getObjectFitClass
  }
}

/**
 * Alternative version that allows custom thresholds
 */
export function useImageOrientationAdvanced(
  landscapeThreshold: number = 1.1,
  squareThreshold: number = 0.1
): UseImageOrientationReturn {
  const [orientation, setOrientation] = useState<ImageOrientation>('loading')

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement
    const aspectRatio = img.naturalWidth / img.naturalHeight

    if (Math.abs(aspectRatio - 1) < squareThreshold) {
      setOrientation('square')
    } else if (aspectRatio > landscapeThreshold) {
      setOrientation('landscape')
    } else {
      setOrientation('portrait')
    }
  }, [landscapeThreshold, squareThreshold])

  const getObjectFitClass = useCallback(() => {
    switch (orientation) {
      case 'landscape':
      case 'square':
        return 'object-cover'
      case 'portrait':
        return 'object-contain'
      case 'loading':
      default:
        return 'object-contain'
    }
  }, [orientation])

  return {
    orientation,
    handleImageLoad,
    getObjectFitClass
  }
}