'use client'

import { useLocale } from 'next-intl'
import OptimizedImage from '@/components/ui/base/OptimizedImage'
import { getProgressiveImageSrc, getFallbackImageSrc } from '@/lib/utils/image-utils'
import type { PayloadImage } from '@/lib/api/api-client'

interface ImageDetailClientProps {
  image: PayloadImage
  defaultCopyright: string
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

export default function ImageDetailClient({ image, defaultCopyright }: ImageDetailClientProps) {
  const locale = useLocale()

  const imageAlt = 'alt' in image ? getLocalizedValue(image.alt, locale as 'en') : ''

  // Use full-size image for detail page, with fallback hierarchy
  const imageUrls = (image as any).imageUrls
  const fullSizeSrc = imageUrls?.full || imageUrls?.large || imageUrls?.medium || imageUrls?.thumbnail || (image as any).url || ''
  const fallbackSrc = imageUrls?.large || imageUrls?.medium || imageUrls?.thumbnail || (image as any).url || ''

  return (
    <>
      <figure className="relative">
        <div className="rounded-lg overflow-hidden relative flex items-start justify-center"
             style={{ maxHeight: '80vh' }}>
          <OptimizedImage
            src={fullSizeSrc}
            fallbackSrc={fallbackSrc}
            alt={imageAlt}
            className="w-full h-auto object-contain"
            style={{ maxHeight: '80vh' }}
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        </div>
        
        {/* Copyright below image */}
        <div className="mt-4 text-right">
          <div className="text-sm text-muted-foreground">
            {image.rights?.useCustomRights && image.rights.customCopyright ? (
              <div>© {image.rights.customCopyright}</div>
            ) : (
              <div>{defaultCopyright}</div>
            )}
          </div>
        </div>
      </figure>
    </>
  )
}