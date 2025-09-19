import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getGalleries, getSiteMetadata, getLocalizedValue } from '@/lib/api/api-client'
import { getCachedGlobal } from '@/lib/utils/getGlobals'
import type { PayloadGallery, PayloadImage } from '@/lib/api/api-client'
import { getResponsiveImageProps, getCardImageSrc } from '@/lib/utils/image-utils'
import OptimizedImage, { GalleryGridSkeleton } from '@/components/ui/base/OptimizedImage'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
import StructuredData from '@/components/seo/StructuredData'

interface GalleriesPageProps {
  params: Promise<{ locale: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: GalleriesPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('galleries')
  
  // Fetch CMS data - prioritize SiteMetadata for personal info and settings for custom SEO
  const [galleries, siteMetadata, settings] = await Promise.all([
    getGalleries(),
    getSiteMetadata(locale as 'en').catch(() => null),
    getCachedGlobal('settings', 2)().catch(() => null)
  ])
  const galleryCount = galleries.length
  
  // Get personal info from SiteMetadata first, then fallback
  const photographerName = siteMetadata?.personal?.name?.[locale as keyof typeof siteMetadata.personal.name] || 
    SITE_CONFIG.personal.name
  const photographerTitle = siteMetadata?.personal?.title?.[locale as keyof typeof siteMetadata.personal.title] || 
    SITE_CONFIG.personal.title

  // Extract gallery statistics for enhanced metadata
  const photographyStyles = Array.from(new Set(galleries.map((g: any) => g.photographyStyle).filter(Boolean))).slice(0, 5)
  const featuredGalleryCount = galleries.filter((g: any) => g.featured).length
  const totalImages = galleries.reduce((sum: number, g: any) => sum + (g.imageCount || 0), 0)

  // Build enhanced descriptions
  const stylesList = photographyStyles.length > 0 ? 
    `including ${photographyStyles.slice(0, 3).join(', ')}${photographyStyles.length > 3 ? ' and more' : ''}` : ''
  
  const description = `Explore ${galleryCount} curated photography galleries ${stylesList} by ${photographerName}. Featuring over ${totalImages} carefully selected images showcasing ${SITE_CONFIG.site.type} photography.`
  
  // Simple gallery keywords with CMS fallback
  const galleryKeywords = ['photography galleries', 'photo collections']
  
  // Add photographer info
  if (photographerName) galleryKeywords.push(`${photographerName.toLowerCase()} galleries`)
  
  // Add photography styles from actual galleries if available
  if (photographyStyles.length > 0) {
    galleryKeywords.push(...photographyStyles.map(style => `${style} photography`))
  }
  
  // Use settings keywords if available, otherwise use generated keywords
  const seoSettings = (settings as any)?.seo || {}
  const settingsKeywords = seoSettings.keywords?.join(', ') || ''
  const keywords = settingsKeywords || galleryKeywords.join(', ')

  // Use settings SEO defaults if available
  const defaultTitle = seoSettings.defaultTitle?.[locale] || DERIVED_CONFIG.getPageTitle(t('title'))
  const defaultDescription = seoSettings.defaultDescription?.[locale] || description
  const defaultImage = seoSettings.defaultImage || null
  
  return {
    title: defaultTitle,
    description: defaultDescription,
    keywords,
    authors: [{ name: photographerName }],
    category: SITE_CONFIG.site.type.charAt(0).toUpperCase() + SITE_CONFIG.site.type.slice(1),
    publisher: SITE_CONFIG.site.name,
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      type: 'website',
      siteName: SITE_CONFIG.site.name,
      images: (() => {
        // Priority: default image from settings → first featured gallery → first gallery
        if (defaultImage && typeof defaultImage === 'object' && 'imageUrls' in defaultImage) {
          return [{
            url: defaultImage.imageUrls?.medium || defaultImage.imageUrls?.full || '',
            width: 1200,
            height: 630,
            alt: `${photographerName} Photography Galleries`,
          }]
        }
        const featuredGallery = galleries.find((g: any) => g.featured && g.coverImage)
        const fallbackGallery = galleries.find((g: any) => g.coverImage)
        const gallery = featuredGallery || fallbackGallery
        if (gallery?.coverImage && typeof gallery.coverImage === 'string') {
          return [{
            url: gallery.coverImage,
            width: 1200,
            height: 630,
            alt: `${getLocalizedValue(gallery.title, locale as 'en')} - Featured Gallery`,
          }]
        }
        return []
      })(),
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDescription,
      creator: SITE_CONFIG.social.twitter ? `@${SITE_CONFIG.social.twitter.split('/').pop()}` : undefined,
      images: (() => {
        if (defaultImage && typeof defaultImage === 'object' && 'imageUrls' in defaultImage) {
          return [defaultImage.imageUrls?.medium || defaultImage.imageUrls?.full || '']
        }
        const featuredGallery = galleries.find((g: any) => g.featured && g.coverImage)
        const fallbackGallery = galleries.find((g: any) => g.coverImage)
        const gallery = featuredGallery || fallbackGallery
        return gallery?.coverImage && typeof gallery.coverImage === 'string' ? [gallery.coverImage] : []
      })(),
    },
    alternates: {
      canonical: `${SITE_CONFIG.url.base}/${locale}/galleries`,
      languages: {
        'en': `${SITE_CONFIG.url.base}/en/galleries`,
        'ta': `${SITE_CONFIG.url.base}/ta/galleries`,
      }
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function GalleriesPage({ params }: GalleriesPageProps) {
  const { locale } = await params
  const t = await getTranslations('galleries')
  const tCommon = await getTranslations('common')

  // Fetch galleries and site metadata for name
  const [galleries, siteMetadata] = await Promise.all([
    getGalleries(),
    getSiteMetadata(locale).catch(() => null)
  ])

  // Get photographer name from CMS
  const photographerName = siteMetadata?.personal?.name?.[locale as keyof typeof siteMetadata.personal.name] ||
    SITE_CONFIG.personal.name
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <StructuredData 
        locale={locale as 'en'}
        pageType="galleryList"
        pageData={{ galleries }}
        customData={{
          description: t('description', { name: photographerName }),
          url: `${SITE_CONFIG.url.base}/${locale}/galleries`
        }}
      />
      
      <div className="min-h-screen">
      {/* Clean minimal header */}
      <section className="relative">
        <div className="py-12 lg:py-16">
          <div className="px-6 lg:px-12 xl:px-16">
            <div className="text-center mb-16">
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
                {t('title')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t('description', { name: photographerName })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Gallery Grid */}
      <section className="relative">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1800px] mx-auto pt-12 lg:pt-16 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-16">
          {galleries.map((gallery, index) => {
            const title = getLocalizedValue(gallery.title, locale as 'en')
            const description = getLocalizedValue(gallery.description, locale as 'en')
            const tags = getLocalizedValue(gallery.tags, locale as 'en')
            
            return (
              <Link
                key={gallery.id}
                href={`/${locale}/galleries/${gallery.slug}`}
                className="group block"
              >
                <article className="relative overflow-hidden">
                  {/* Large immersive image */}
                  <div className="aspect-square md:aspect-[4/3] bg-slate-800 dark:bg-slate-200 overflow-hidden relative rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-700">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-all duration-700"></div>
                    
                    {gallery.coverImage ? (
                      <>
                        <img
                          src={typeof gallery.coverImage === 'string'
                            ? gallery.coverImage
                            : typeof gallery.coverImage === 'object' && 'imageUrls' in gallery.coverImage
                              ? getCardImageSrc(gallery.coverImage as PayloadImage)
                              : gallery.coverImage
                          }
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                          loading={index < 2 ? 'eager' : 'lazy'}
                        />
                        {/* Always visible gradient for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        {/* Enhanced gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 opacity-30">
                            <svg fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                            </svg>
                          </div>
                          <p className="text-lg font-medium">{title}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Featured badge - subtle */}
                    {gallery.featured && (
                      <div className="absolute top-6 left-6">
                        <span className="px-3 py-1.5 bg-white/90 text-foreground text-xs font-medium rounded-full backdrop-blur-sm">
                          {tCommon('featured')}
                        </span>
                      </div>
                    )}
                    
                    {/* Default content - visible on load */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                      <div className="text-white">
                        <h3 className="font-serif text-xl lg:text-2xl font-bold mb-2 drop-shadow-xl">
                          {title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm drop-shadow-lg">
                            {t('imageCount', { count: gallery.imageCount || 0 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced content on hover - replaces default content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="text-white">
                        <h3 className="font-serif text-xl lg:text-2xl font-bold mb-3 drop-shadow-xl">
                          {title}
                        </h3>
                        <p className="text-white/90 text-sm lg:text-base drop-shadow-lg line-clamp-2 mb-4">
                          {description}
                        </p>
                        
                        {/* Enhanced meta info on hover */}
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm drop-shadow-lg">
                            {t('imageCount', { count: gallery.imageCount || 0 })}
                          </span>
                          
                          <div className="flex items-center text-white/90 text-sm font-medium drop-shadow-lg">
                            View Gallery
                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Clean minimal tags only - no title duplication */}
                  <div className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {tags && Array.isArray(tags) && tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
          </div>
        </div>
      </section>
      </div>
    </>
  )
}