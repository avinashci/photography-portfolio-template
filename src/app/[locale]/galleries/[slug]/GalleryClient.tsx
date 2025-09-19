'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useLocale } from 'next-intl'
import GalleryImage from '@/components/frontend/media/GalleryImage'
import { PayloadImage } from '@/types/payload-image'

const Lightbox = dynamic(() => import('@/components/frontend/media/Lightbox'), {
  loading: () => <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>
})

interface PayloadGallery {
  id: string
  slug: string
  title: {
    en: string
    ta: string
  }
  description: {
    en: string
    ta: string
  }
  tags?: {
    en: string[]
    ta: string[]
  }
  images?: PayloadImage[]
}

interface GalleryClientProps {
  gallery: PayloadGallery
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

export default function GalleryClient({ gallery }: GalleryClientProps) {
  const locale = useLocale()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    if (!gallery.images) return
    setCurrentImageIndex((prev) => (prev + 1) % gallery.images!.length)
  }

  const prevImage = () => {
    if (!gallery.images) return
    setCurrentImageIndex((prev) => (prev - 1 + gallery.images!.length) % gallery.images!.length)
  }

  return (
    <>
      {/* Immersive Gallery Controls */}
      <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Gallery Images
          </h2>
          <p className="text-muted-foreground">
            {gallery.images?.length || 0} photographs in this collection
          </p>
        </div>
        
        <button
          onClick={() => openLightbox(0)}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          View Slideshow
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Apple-style Masonry Photo Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 lg:gap-6 space-y-4 lg:space-y-6">
        {gallery.images?.map((image, index) => {
          const imageTitle = getLocalizedValue(image.title, locale as 'en')
          const imageAlt = (getLocalizedValue(image.alt, locale as 'en') || image.altText || imageTitle) as string

          // Calculate dynamic height for masonry effect
          const imageHeight = (image as any).height
          const imageWidth = (image as any).width
          const aspectRatio = imageHeight && imageWidth ? imageHeight / imageWidth : 1
          const baseHeight = 280
          const dynamicHeight = Math.max(200, Math.min(400, baseHeight * aspectRatio))

          return (
            <GalleryImage
              key={image.id}
              image={image}
              index={index}
              locale={locale as 'en'}
              gallerySlug={gallery.slug}
              imageTitle={imageTitle}
              imageAlt={imageAlt}
              dynamicHeight={dynamicHeight}
              onLightboxOpen={openLightbox}
            />
          )
        })}
      </div>

      {/* Lightbox */}
      {gallery.images && (
        <Lightbox
          images={gallery.images}
          currentIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          locale={locale as 'en'}
        />
      )}
    </>
  )
}