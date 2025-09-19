'use client'

import { useResponsiveHeroImage } from '@/lib/hooks/useResponsiveHeroImage'

interface HeroImage {
  id: string;
  filename: string;
  imageUrls?: {
    full?: string;
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
  url: string;
  alt: string;
  title?: string;
  description?: string;
  caption?: string;
  location?: {
    name?: string;
    city?: string;
    region?: string;
    country?: string;
  };
}

interface HeroCarouselImageProps {
  heroImage: HeroImage
  isActive: boolean
}

export default function HeroCarouselImage({ heroImage, isActive }: HeroCarouselImageProps) {
  // Dynamically select image size based on screen size and device pixel ratio
  // Mobile: medium, Desktop: large, 4K: full - optimizes performance and quality
  const responsiveImageSrc = useResponsiveHeroImage(heroImage)

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background Image - Responsive loading */}
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url(${responsiveImageSrc})`,
        }}
      />

      {/* Image-specific content at bottom right if available */}
      {(heroImage.title || heroImage.caption || heroImage.location?.name || heroImage.location?.city || heroImage.location?.region || heroImage.location?.country) && (
        <div className='absolute bottom-20 right-4 z-20 text-right px-4 max-w-sm'>
          <div className='bg-black/10 backdrop-blur-[1px] rounded-lg p-3'>
            {heroImage.title && (
              <h3 className='text-sm font-serif font-medium text-white/95 leading-tight drop-shadow-lg mb-1'>
                {heroImage.title}
              </h3>
            )}
            {heroImage.caption && (
              <p className='text-xs text-white/90 leading-tight drop-shadow-lg mb-1'>
                {heroImage.caption}
              </p>
            )}
            {heroImage.location?.name && (
              <p className='text-xs font-medium text-white/85 leading-tight drop-shadow-lg'>
                {heroImage.location.name}
              </p>
            )}
            {(heroImage.location?.city || heroImage.location?.region || heroImage.location?.country) && (
              <p className='text-xs text-white/80 leading-tight drop-shadow-lg'>
                {[heroImage.location?.city, heroImage.location?.region, heroImage.location?.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}