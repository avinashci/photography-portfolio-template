'use client'

import { HTMLAttributes, useState, useEffect } from 'react'

interface OptimizedImageProps extends HTMLAttributes<HTMLImageElement> {
  src?: string
  srcSet?: string
  webpSrcSet?: string
  fallbackSrc?: string // Fallback image URL if primary fails to load
  alt: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  sizes?: string
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void
  blurDataURL?: string // Blur data URL for placeholder (not passed to DOM)
}

export default function OptimizedImage({
  src,
  srcSet,
  webpSrcSet,
  fallbackSrc,
  alt,
  width,
  height,
  loading = 'lazy',
  sizes,
  className = '',
  onLoad,
  blurDataURL, // Extract to prevent it from being passed to DOM
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(true)
    }
  }

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (onLoad) {
      onLoad(event)
    }
  }

  if (!currentSrc) return null

  // If we have WebP sources, use picture element with progressive fallback
  if (webpSrcSet) {
    return (
      <picture>
        <source
          srcSet={webpSrcSet}
          type="image/webp"
          sizes={sizes}
        />
        <img
          src={currentSrc}
          srcSet={srcSet}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          className={className}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      </picture>
    )
  }

  // Progressive loading with fallback
  return (
    <img
      src={currentSrc}
      srcSet={srcSet}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      sizes={sizes}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  )
}

export function GalleryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}