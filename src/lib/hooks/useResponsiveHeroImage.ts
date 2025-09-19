'use client'

import { useState, useEffect } from 'react'

// Get hero image source based on screen size - client-side hook
export function useResponsiveHeroImage(image: any) {
  const [imageSrc, setImageSrc] = useState<string>('')

  useEffect(() => {
    const updateImageSrc = () => {
      if (!image?.imageUrls) {
        setImageSrc(image?.url || '')
        return
      }

      const width = window.innerWidth
      const height = window.innerHeight
      const devicePixelRatio = window.devicePixelRatio || 1
      const effectiveWidth = width * devicePixelRatio

      // Choose image size based on screen size and pixel density
      let selectedSrc: string

      if (effectiveWidth >= 2400 || height >= 1440) {
        // 4K+ displays or very large screens - use full size
        selectedSrc = image.imageUrls.full || (image.imageUrls as any).large || image.imageUrls.medium || image.imageUrls.thumbnail || image.url
      } else if (effectiveWidth >= 1920 || height >= 1080) {
        // 1080p+ displays - use large or full
        selectedSrc = (image.imageUrls as any).large || image.imageUrls.full || image.imageUrls.medium || image.imageUrls.thumbnail || image.url
      } else if (effectiveWidth >= 1024) {
        // Desktop/tablet - use medium or large
        selectedSrc = image.imageUrls.medium || (image.imageUrls as any).large || image.imageUrls.full || image.imageUrls.thumbnail || image.url
      } else {
        // Mobile - use medium (still good quality for smaller screens)
        selectedSrc = image.imageUrls.medium || image.imageUrls.thumbnail || (image.imageUrls as any).large || image.imageUrls.full || image.url
      }

      setImageSrc(selectedSrc)
    }

    // Initial load
    updateImageSrc()

    // Update on resize
    window.addEventListener('resize', updateImageSrc)
    return () => window.removeEventListener('resize', updateImageSrc)
  }, [image])

  return imageSrc
}