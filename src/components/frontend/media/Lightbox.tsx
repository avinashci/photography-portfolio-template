'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import OptimizedImage from '@/components/ui/base/OptimizedImage'
import { PayloadImage } from '@/types/payload-image'

interface LightboxProps {
  images: PayloadImage[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  locale?: 'en'
  simpleMode?: boolean // When true, hides navigation and info sidebar
}

// Helper function for getting localized values (supports both localized and non-localized strings)
function getLocalizedValue<T>(value: { en: T; ta: T } | T | undefined, locale: 'en'): T | '' {
  if (!value) return '' as T
  
  // If value is a localized object
  if (typeof value === 'object' && value !== null && 'en' in value) {
    const localizedObj = value as { en: T; ta: T }
    const localized = localizedObj[locale]
    const fallback = localizedObj.en
    return localized || fallback || '' as T
  }
  
  // If value is a plain string/primitive
  return value as T
}

export default function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
  locale = 'en',
  simpleMode = false
}: LightboxProps) {
  const t = useTranslations('lightbox')
  const currentImage = images[currentIndex]
  const [hasKeyboard, setHasKeyboard] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      // Detect keyboard usage
      setHasKeyboard(true)

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (!simpleMode) onPrev()
          break
        case 'ArrowRight':
          if (!simpleMode) onNext()
          break
      }
    }

    // Reset keyboard detection when lightbox opens
    if (isOpen) {
      setHasKeyboard(false)
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onNext, onPrev, simpleMode])

  if (!isOpen || !currentImage) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      <div className="flex h-full">
        {/* Navigation arrows - hidden in simple mode */}
        {!simpleMode && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label={t('previous')}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={onNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label={t('next')}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          aria-label={t('close')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            {(() => {
              // Use full-size image for lightbox slideshow, with fallback hierarchy
              const imageUrls = (currentImage as any).imageUrls
              const fullSizeSrc = imageUrls?.full || imageUrls?.large || imageUrls?.medium || imageUrls?.thumbnail || (currentImage as any).url || ''
              const fallbackSrc = imageUrls?.large || imageUrls?.medium || imageUrls?.thumbnail || (currentImage as any).url || ''

              return fullSizeSrc ? (
                <div className="relative">
                  <OptimizedImage
                    src={fullSizeSrc}
                    fallbackSrc={fallbackSrc}
                    alt={getLocalizedValue(currentImage.altText, locale) || getLocalizedValue(currentImage.title, locale)}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    loading="eager"
                  />

                  {/* Mobile image title overlay - only show on mobile when sidebar is hidden */}
                  <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-b-lg">
                    <h2 className="text-white font-medium text-sm text-center drop-shadow-lg">
                      {getLocalizedValue(currentImage.title, locale || 'en') || 'Untitled'}
                    </h2>
                    {currentImage.location?.name && (
                      <p className="text-white/80 text-center text-xs mt-1 drop-shadow-lg">
                        {getLocalizedValue(currentImage.location?.name, locale || 'en')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-muted rounded-lg border border-border aspect-[4/3] w-96 max-w-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 opacity-40">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-white">{getLocalizedValue(currentImage.title, locale)}</p>
                    <p className="text-xs text-white/60">{currentImage.location?.name ? getLocalizedValue(currentImage.location.name, locale) : ''}</p>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Info sidebar - hidden in simple mode and on mobile */}
        {!simpleMode && (
          <div className="hidden lg:block w-80 bg-black/80 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="text-white space-y-6">
            {/* Image Title */}
            <section>
              <h1 className="font-serif text-2xl font-bold text-white mb-4">
                {getLocalizedValue(currentImage.title, locale || 'en') || 'Untitled'}
              </h1>
            </section>

            {/* Technical Details */}
            {currentImage.technical && (currentImage.technical.cameraBody || currentImage.technical.lensGear || currentImage.technical.aperture || currentImage.technical.shutterSpeed || currentImage.technical.iso) && (
              <>
                <div className="border-t border-white/10"></div>
                <section>
                  <h2 className="sr-only">Technical Details</h2>
                  <div className="space-y-2 text-sm text-white/80">
                    {/* Camera | Lens */}
                    {(currentImage.technical.cameraBody || currentImage.technical.lensGear) && (
                      <div>
                        {currentImage.technical.cameraBody && currentImage.technical.lensGear ? (
                          <>{currentImage.technical.cameraBody.name || `${currentImage.technical.cameraBody.brand} ${currentImage.technical.cameraBody.model}`} | {currentImage.technical.lensGear.name || `${currentImage.technical.lensGear.brand} ${currentImage.technical.lensGear.model}`}</>
                        ) : currentImage.technical.cameraBody ? (
                          <>{currentImage.technical.cameraBody.name || `${currentImage.technical.cameraBody.brand} ${currentImage.technical.cameraBody.model}`}</>
                        ) : currentImage.technical.lensGear ? (
                          <>{currentImage.technical.lensGear.name || `${currentImage.technical.lensGear.brand} ${currentImage.technical.lensGear.model}`}</>
                        ) : null}
                      </div>
                    )}
                    
                    {/* Aperture | Shutter | ISO | Focal Length */}
                    {(currentImage.technical.aperture || currentImage.technical.shutterSpeed || currentImage.technical.iso || currentImage.technical.focalLength) && (
                      <div>
                        {[
                          currentImage.technical.aperture,
                          currentImage.technical.shutterSpeed,
                          currentImage.technical.iso && `ISO ${currentImage.technical.iso}`,
                          currentImage.technical.focalLength && `${currentImage.technical.focalLength}mm`
                        ].filter(Boolean).join(' | ')}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Location */}
            {currentImage.location?.name && (
              <>
                <div className="border-t border-white/10"></div>
                <section>
                  <h2 className="sr-only">Location</h2>
                  <div className="text-sm text-white/80">
                    <div>
                      {getLocalizedValue(currentImage.location?.name, locale || 'en')}
                    </div>
                  </div>
                </section>
              </>
            )}
            
            {/* Keyboard shortcuts - only show when keyboard is detected */}
            {hasKeyboard && (
              <div className="pt-6 border-t border-white/20">
                <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">
                  Keyboard Shortcuts
                </h4>
                <div className="text-xs space-y-1 text-white/60">
                  <p>← → Navigate</p>
                  <p>ESC Close</p>
                </div>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  )
}