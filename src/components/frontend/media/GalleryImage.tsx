'use client'

import { useState } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/ui/base/OptimizedImage'
import { useImageOrientation } from '@/lib/hooks/useImageOrientation'
import { PayloadImage } from '@/types/payload-image'
import { getProgressiveImageSrc, getFallbackImageSrc } from '@/lib/utils/image-utils'

interface GalleryImageProps {
  image: PayloadImage
  index: number
  locale: 'en'
  gallerySlug: string
  imageTitle: string
  imageAlt: string
  dynamicHeight: number
  onLightboxOpen: (index: number) => void
}

// Helper function for getting localized values
function getLocalizedValue<T>(value: { en: T; ta: T } | T | undefined, locale: 'en'): T | '' {
  if (!value) return '' as T

  // If it's already a plain string/value, return it directly
  if (typeof value === 'string' || typeof value !== 'object') {
    return value as T
  }

  // If it's a localized object, handle accordingly
  if (typeof value === 'object' && 'en' in value && 'ta' in value) {
    const localized = value[locale]
    const fallback = value.en
    return localized || fallback || '' as T
  }

  return value as T || '' as T
}

export default function GalleryImage({
  image,
  index,
  locale,
  gallerySlug,
  imageTitle,
  imageAlt,
  dynamicHeight,
  onLightboxOpen
}: GalleryImageProps) {
  const { orientation, handleImageLoad, getObjectFitClass } = useImageOrientation()

  // Use progressive loading: start with smallest available image
  const progressiveSrc = getProgressiveImageSrc(image as any)
  const fallbackSrc = getFallbackImageSrc(image as any, progressiveSrc)

  return (
    <div key={image.id} className="break-inside-avoid group">
      <Link href={`/${locale}/galleries/${gallerySlug}/images/${image.slug}`} className="block">
        <div
          className="bg-muted/50 rounded-2xl overflow-hidden relative cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1"
          style={{ height: `${dynamicHeight}px` }}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 z-10"></div>

          {/* Actual image with orientation detection */}
          {progressiveSrc ? (
            <OptimizedImage
              src={progressiveSrc}
              fallbackSrc={fallbackSrc}
              alt={imageAlt}
              className={`w-full h-full ${getObjectFitClass()} group-hover:scale-[1.02] transition-transform duration-700`}
              loading="lazy"
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 opacity-30">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium">No image</p>
              </div>
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Title and actions overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-end justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-white font-medium text-sm lg:text-base line-clamp-2 drop-shadow-lg">
                  {imageTitle || 'Untitled'}
                </h3>
              </div>

              <div className="flex gap-2 ml-3">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onLightboxOpen(index)
                  }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  title="View in lightbox"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}