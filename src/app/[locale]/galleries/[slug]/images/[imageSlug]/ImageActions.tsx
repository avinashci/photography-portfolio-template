'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useLocale } from 'next-intl'
import { Maximize2 } from 'lucide-react'
import SocialShare from '@/components/frontend/sharing/SocialShare'
import type { PayloadImage as LightboxPayloadImage } from '@/types/payload-image'
import type { PayloadImage } from '@/lib/api/api-client'

const Lightbox = dynamic(() => import('@/components/frontend/media/Lightbox'), {
  loading: () => <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div></div>
})

interface ImageActionsProps {
  image: PayloadImage
  galleryImages: PayloadImage[]
  currentIndex: number
  shareUrl: string
  galleryTitle: string
  variant?: 'card' | 'floating' | 'inline'
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

export default function ImageActions({ 
  image, 
  galleryImages, 
  currentIndex, 
  shareUrl, 
  galleryTitle,
  variant = 'card'
}: ImageActionsProps) {
  const locale = useLocale()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(currentIndex)

  // Convert PayloadImage to LightboxPayloadImage format for compatibility
  const convertToLightboxImage = (img: PayloadImage): LightboxPayloadImage => ({
    id: img.id,
    slug: img.slug,
    title: img.title,
    description: img.description,
    altText: 'alt' in img ? getLocalizedValue(img.alt, locale as 'en') : '',
    imageUrls: img.imageUrls,
    location: img.location as any,
    tags: img.tags,
    technical: img.technical,
    captureDate: img.captureDate
  } as LightboxPayloadImage)

  const lightboxImages = galleryImages.map(convertToLightboxImage)

  const openLightbox = () => {
    setLightboxIndex(currentIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Icon Buttons */}
        <div className="flex flex-col gap-3">
          {/* View Full Size Button */}
          <div className="group relative">
            <button
              onClick={openLightbox}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl border border-white/20 hover:border-white/40"
              title="View Full Size"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Tooltip */}
            <div className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-xl">
              View Full Size
            </div>
          </div>

          {/* Share Button */}
          <div className="group relative">
            <button
              onClick={async () => {
                try {
                  if (navigator.share) {
                    // Use native share API if available
                    await navigator.share({
                      title: getLocalizedValue(image.title, locale as 'en'),
                      text: `${getLocalizedValue(image.title, locale as 'en')} from ${galleryTitle} gallery`,
                      url: shareUrl,
                    })
                  } else {
                    // Fallback to copying URL to clipboard
                    await navigator.clipboard.writeText(shareUrl)
                    // You could add a toast notification here
                  }
                } catch (error) {
                  console.log('Error sharing:', error)
                }
              }}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl border border-white/20 hover:border-white/40"
              title="Share Image"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            {/* Tooltip */}
            <div className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-xl">
              Share Image
            </div>
          </div>
        </div>

        {/* Lightbox */}
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          locale={locale as 'en'}
          simpleMode={true}
        />
      </>
    )
  }

  if (variant === 'inline') {
    return (
      <>
        {/* Inline Action Buttons */}
        <div className="flex items-center justify-between">
          {/* View Full Size Button */}
          <div className="group relative">
            <button
              onClick={openLightbox}
              className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              title="View Full Size"
            >
              <Maximize2 className="w-6 h-6" />
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-xl">
              View Full Size
            </div>
          </div>

          {/* Social Share Component */}
          <div className="flex items-center">
            <SocialShare
              url={shareUrl}
              title={getLocalizedValue(image.title, locale as 'en')}
              description={`${getLocalizedValue(image.title, locale as 'en')} from ${galleryTitle} gallery`}
              hashtags={['photography', 'gallery', 'art']}
              className="flex items-center gap-2"
            />
          </div>
        </div>

        {/* Lightbox */}
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          locale={locale as 'en'}
          simpleMode={true}
        />
      </>
    )
  }

  // Default card variant
  return (
    <>
      {/* View Full Size Button */}
      <div className="mb-6">
        <button
          onClick={openLightbox}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          View Full Size
        </button>
      </div>

      {/* Social Sharing */}
      <div className="mb-6">
        <h3 className="font-serif text-lg font-semibold mb-4 text-foreground">Share</h3>
        <SocialShare
          url={shareUrl}
          title={getLocalizedValue(image.title, locale as 'en')}
          description={`${getLocalizedValue(image.title, locale as 'en')} from ${galleryTitle} gallery`}
          hashtags={['photography', 'gallery', 'art']}
          className=""
        />
      </div>

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
        locale={locale as 'en'}
        simpleMode={true}
      />
    </>
  )
}