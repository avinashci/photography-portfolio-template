'use client'

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { generateBlurDataURL, getCachedBlurDataURL, generateShimmerDataURL } from '@/lib/utils/image-blur'

interface ProgressiveImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  src: string
  alt: string
  className?: string
  enableBlur?: boolean
  enableShimmer?: boolean
  placeholderColor?: string
  onLoadStart?: () => void
  onLoadComplete?: () => void
  onError?: () => void
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className,
  enableBlur = true,
  enableShimmer = false,
  placeholderColor = '#f3f4f6',
  onLoadStart,
  onLoadComplete,
  onError,
  ...imageProps
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [blurDataURL, setBlurDataURL] = useState<string>('')

  // Generate blur placeholder on mount
  useEffect(() => {
    if (enableBlur && src) {
      const generateBlur = async () => {
        try {
          const blur = await getCachedBlurDataURL(src, { 
            width: 40, 
            quality: 0.1 
          })
          setBlurDataURL(blur)
        } catch (error) {
          console.warn('Failed to generate blur placeholder:', error)
          setBlurDataURL(generateBlurDataURL(4, 3, placeholderColor))
        }
      }
      
      generateBlur()
    } else if (enableShimmer) {
      setBlurDataURL(generateShimmerDataURL(400, 300))
    } else {
      setBlurDataURL(generateBlurDataURL(4, 3, placeholderColor))
    }
  }, [src, enableBlur, enableShimmer, placeholderColor])

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
    onLoadStart?.()
  }

  const handleLoadComplete = () => {
    setIsLoading(false)
    onLoadComplete?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading overlay with shimmer or blur effect */}
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 z-10 transition-opacity duration-300",
            enableShimmer ? "animate-pulse" : "",
            isLoading ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundImage: enableShimmer ? `url(${blurDataURL})` : undefined,
            backgroundColor: !enableShimmer ? placeholderColor : undefined
          }}
        >
          {enableShimmer && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className={cn(
          "absolute inset-0 z-10 flex items-center justify-center",
          "bg-gray-100 text-gray-400"
        )}>
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Failed to load image</div>
          </div>
        </div>
      )}

      {/* Main image */}
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoadingComplete={handleLoadComplete}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        style={{
          ...imageProps.style,
          objectFit: imageProps.style?.objectFit || 'cover'
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Utility CSS for shimmer animation (add to globals.css)
export const shimmerCSS = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`