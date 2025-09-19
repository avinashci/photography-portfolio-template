'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useImageOrientation } from '@/lib/hooks/useImageOrientation'
import { getLocalizedValue } from '@/lib/utils/localization'

interface FeaturedGalleryImageProps {
  gallery: any
  locale: string
  className?: string
}

export default function FeaturedGalleryImage({
  gallery,
  locale,
  className = ""
}: FeaturedGalleryImageProps) {
  const { orientation, handleImageLoad, getObjectFitClass } = useImageOrientation()

  return (
    <Link href={`/${locale}/galleries/${gallery.slug}`} className="block group">
      <div className={`aspect-[16/10] bg-slate-800 dark:bg-slate-200 rounded-3xl overflow-hidden relative cursor-pointer shadow-2xl ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-700"></div>

        {gallery.coverImage && typeof gallery.coverImage === 'string' ? (
          <Image
            src={gallery.coverImage}
            alt={getLocalizedValue(gallery.title, locale as 'en')}
            width={800}
            height={600}
            className={`w-full h-full ${getObjectFitClass()} group-hover:scale-[1.02] transition-transform duration-700`}
            quality={85}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={handleImageLoad as any}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 opacity-40">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                </svg>
              </div>
              <p className="text-lg">Featured Gallery</p>
            </div>
          </div>
        )}

        {/* Overlay text on hover */}
        <div className="absolute bottom-8 left-8 right-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <h3 className="font-serif text-xl lg:text-2xl font-bold text-white mb-2 drop-shadow-xl">
            {getLocalizedValue(gallery.title, locale as 'en')}
          </h3>
          <p className="text-white/90 text-sm lg:text-base drop-shadow-lg">
            {gallery.imageCount || gallery.images?.length || 0} photographs
          </p>
        </div>
      </div>
    </Link>
  )
}