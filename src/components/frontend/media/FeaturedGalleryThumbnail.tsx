'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useImageOrientation } from '@/lib/hooks/useImageOrientation'
import { getLocalizedValue } from '@/lib/utils/localization'

interface FeaturedGalleryThumbnailProps {
  image: any
  gallerySlug: string
  locale: string
}

export default function FeaturedGalleryThumbnail({
  image,
  gallerySlug,
  locale
}: FeaturedGalleryThumbnailProps) {
  const { orientation, handleImageLoad, getObjectFitClass } = useImageOrientation()

  return (
    <Link href={`/${locale}/galleries/${gallerySlug}/images/${image.slug}`} className="group">
      <div className="aspect-square bg-slate-800 dark:bg-slate-200 rounded-2xl overflow-hidden relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500">
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-10"></div>

        {image.imageUrls?.thumbnail || image.imageUrls?.medium || image.imageUrls?.full ? (
          <Image
            src={image.imageUrls.thumbnail || image.imageUrls.medium || image.imageUrls.full}
            alt={getLocalizedValue(image.title, locale as 'en')}
            width={400}
            height={400}
            className={`w-full h-full ${getObjectFitClass()} group-hover:scale-110 transition-transform duration-500`}
            quality={85}
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onLoad={handleImageLoad as any}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 opacity-40">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                </svg>
              </div>
              <p className="text-xs">Image</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}