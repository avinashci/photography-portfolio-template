import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getGalleries, getGalleryBySlug, getLocalizedValue } from '@/lib/api/api-client'
import { getSEOPersonalData } from '@/lib/utils/seo-helpers'
import type { PayloadGallery } from '@/lib/api/api-client'
import GalleryClient from './GalleryClient'
import SocialShare from '@/components/frontend/sharing/SocialShare'
import type { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
import StructuredData from '@/components/seo/StructuredData'

interface GalleryPageProps {
  params: Promise<{ locale: string; slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  
  // Fetch gallery and personal data for SEO
  const [gallery, personalData] = await Promise.all([
    getGalleryBySlug(slug),
    getSEOPersonalData(locale as 'en')
  ])
  
  if (!gallery) {
    return {
      title: DERIVED_CONFIG.getPageTitle('Gallery Not Found'),
      description: 'The requested gallery could not be found.'
    }
  }

  // Extract base content
  const title = getLocalizedValue(gallery.title, locale as 'en')
  const description = getLocalizedValue(gallery.description, locale as 'en')
  const excerpt = getLocalizedValue(gallery.excerpt, locale as 'en')
  const tags = getLocalizedValue(gallery.tags, locale as 'en') || []
  const imageCount = ('imageCount' in gallery ? gallery.imageCount : null) || ('images' in gallery ? gallery.images?.length : 0) || 0
  const coverImageUrl = gallery.coverImage && typeof gallery.coverImage === 'string' ? gallery.coverImage : null

  // Extract SEO fields (new!)
  const seo = gallery.seo || {}
  const customTitle = seo.metaTitle ? getLocalizedValue(seo.metaTitle, locale as 'en') : null
  const customDescription = seo.metaDescription ? getLocalizedValue(seo.metaDescription, locale as 'en') : null
  const seoKeywords = seo.keywords || []
  const customOgImage = seo.ogImage || null
  const canonicalUrl = seo.canonicalUrl || `${SITE_CONFIG.url.base}/${locale}/galleries/${slug}`
  const shouldIndex = !seo.noIndex

  // Build final metadata with SEO field priority
  const finalTitle = customTitle || title
  const finalDescription = customDescription || excerpt || description || `A photography gallery featuring ${imageCount} images showcasing ${title.toLowerCase()}.`
  // Simple gallery keyword generation with CMS priority
  const generateSimpleKeywords = () => {
    const baseKeywords = []
    
    // Add gallery title and tags (best sources)
    if (title) baseKeywords.push(`${title.toLowerCase()} gallery`)
    if (tags && tags.length > 0) {
      baseKeywords.push(...tags.map((tag: string) => tag.toLowerCase()))
    }
    
    // Basic fallback terms
    baseKeywords.push('photography gallery', `${personalData.name.toLowerCase()} photography`)
    
    return baseKeywords.filter(Boolean).join(', ')
  }
  
  // Priority: SEO keywords from CMS → gallery tags → simple fallback
  const finalKeywords = seoKeywords.length > 0 ? seoKeywords.join(', ') : 
    (tags && tags.length > 0 ? tags.join(', ') : generateSimpleKeywords())
  const finalOgImage = customOgImage || coverImageUrl

  return {
    title: DERIVED_CONFIG.getPageTitle(finalTitle),
    description: finalDescription,
    keywords: finalKeywords,
    authors: [{ name: personalData.name }],
    category: SITE_CONFIG.site.type.charAt(0).toUpperCase() + SITE_CONFIG.site.type.slice(1),
    publisher: SITE_CONFIG.site.name,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: 'website',
      siteName: SITE_CONFIG.site.name,
      images: finalOgImage ? [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: `${finalTitle} - ${SITE_CONFIG.site.type.charAt(0).toUpperCase() + SITE_CONFIG.site.type.slice(1)} Gallery`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${finalTitle} Gallery`,
      description: finalDescription,
      creator: SITE_CONFIG.social.twitter ? `@${SITE_CONFIG.social.twitter.split('/').pop()}` : undefined,
      images: finalOgImage ? [finalOgImage] : [],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${SITE_CONFIG.url.base}/en/galleries/${slug}`,
        'ta': `${SITE_CONFIG.url.base}/ta/galleries/${slug}`,
      }
    },
    robots: {
      index: shouldIndex,
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

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale, slug } = await params
  const t = await getTranslations()
  const tGalleries = await getTranslations('galleries')
  
  // Fetch gallery from PayloadCMS
  const gallery = await getGalleryBySlug(slug)

  if (!gallery) {
    notFound()
  }

  // Sanitize gallery data to remove buffers and non-serializable data for client component
  const sanitizedGallery = {
    id: gallery.id,
    slug: gallery.slug,
    title: gallery.title,
    description: gallery.description,
    tags: gallery.tags,
    coverImage: gallery.coverImage && typeof gallery.coverImage === 'object' && 'imageUrls' in gallery.coverImage 
      ? gallery.coverImage.imageUrls?.medium || gallery.coverImage.imageUrls?.full || gallery.coverImage.url
      : typeof gallery.coverImage === 'string' 
        ? gallery.coverImage
        : null,
    images: gallery.images?.map((image: any) => {
      if (!image) return null
      return {
        id: image.id || image.filename || 'unknown',
        slug: image.slug || '',
        title: image.title || '',
        description: image.description || '',
        alt: image.alt || image.altText || '',
        imageUrls: image.imageUrls || {
          full: image.url || '',
          large: image.url || '',
          medium: image.url || '',
          thumbnail: image.url || ''
        },
        url: image.url || '',
        filename: image.filename || '',
        mimeType: image.mimeType || '',
        filesize: image.filesize || 0,
        width: image.width || 0,
        height: image.height || 0,
        // Remove any other complex/non-serializable properties
      }
    }).filter(Boolean) || []
  }
  
  const title = getLocalizedValue(gallery.title, locale as 'en')
  const description = getLocalizedValue(gallery.description, locale as 'en')
  const tags = getLocalizedValue(gallery.tags, locale as 'en')

  return (
    <>
      {/* JSON-LD Structured Data */}
      <StructuredData 
        locale={locale as 'en'}
        pageType="gallery"
        pageData={gallery}
        customData={{
          title,
          description,
          url: `${SITE_CONFIG.url.base}/${locale}/galleries/${slug}`,
          image: gallery.coverImage && typeof gallery.coverImage === 'string' ? gallery.coverImage : undefined
        }}
      />
      
      <div className="min-h-screen">
        {/* Immersive Gallery Hero */}
        <section className="relative overflow-hidden">
          {/* Cover Image Background */}
          {gallery.coverImage ? (
            <div className="absolute inset-0">
              <img
                src={typeof gallery.coverImage === 'string'
                  ? gallery.coverImage
                  : typeof gallery.coverImage === 'object' && 'imageUrls' in gallery.coverImage
                    ? gallery.coverImage.imageUrls?.medium || gallery.coverImage.imageUrls?.full || gallery.coverImage.url
                    : gallery.coverImage
                }
                alt={title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-muted/50"></div>
          )}

          <div className="relative py-16 lg:py-20">
            <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-12">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link
                      href={`/${locale}/galleries`}
                      className={`transition-colors ${gallery.coverImage ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {locale === 'ta' ? 'கேலரிகள்' : 'Galleries'}
                    </Link>
                  </li>
                  <li className={gallery.coverImage ? 'text-white/50' : 'text-muted-foreground'}>/</li>
                  <li className={`font-medium ${gallery.coverImage ? 'text-white' : 'text-foreground'}`}>{title}</li>
                </ol>
              </nav>

              {/* Gallery Header */}
              <header className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  {tags && tags.length > 0 && (
                    <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                      gallery.coverImage
                        ? 'bg-white/20 text-white/90 backdrop-blur-sm'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {tags[0]}
                    </span>
                  )}

                  <div className={`flex items-center gap-3 text-sm ${
                    gallery.coverImage ? 'text-white/80' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${gallery.coverImage ? 'bg-white/60' : 'bg-primary/60'}`}></div>
                    <span className="font-medium">
                      {('imageCount' in gallery ? gallery.imageCount : null) || ('images' in gallery ? gallery.images?.length : 0) || 0} {locale === 'ta' ? 'படங்கள்' : 'Images'}
                    </span>
                  </div>
                </div>

                <h1 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight ${
                  gallery.coverImage ? 'text-white drop-shadow-2xl' : 'text-foreground'
                }`}>
                  {title}
                </h1>

                {description && (
                  <p className={`text-xl md:text-2xl font-light mb-4 max-w-3xl leading-relaxed ${
                    gallery.coverImage ? 'text-white/90 drop-shadow-xl' : 'text-muted-foreground'
                  }`}>
                    {description}
                  </p>
                )}

                {/* Tags */}
                {tags && tags.length > 1 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {tags.slice(1, 5).map((tag: string) => (
                      <span
                        key={tag}
                        className={`px-3 py-2 text-sm font-medium rounded-full ${
                          gallery.coverImage
                            ? 'bg-white/15 text-white/90 backdrop-blur-sm'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social Sharing */}
                <div className={`pt-4 ${gallery.coverImage ? 'border-t border-white/20' : 'border-t border-border'}`}>
                  <SocialShare
                    url={`${SITE_CONFIG.url.base}/${locale}/galleries/${slug}`}
                    title={title}
                    description={description || `${title} photography gallery`}
                    hashtags={['photography', 'gallery', ...(tags?.slice(0, 3) || [])]}
                  />
                </div>
              </header>
            </div>
          </div>
        </section>

      {/* Gallery Images Section */}
      <section className="relative">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1800px] mx-auto py-12 lg:py-16">
          {('images' in gallery && gallery.images && gallery.images.length > 0) ? (
            <GalleryClient gallery={sanitizedGallery} />
          ) : (
            <div className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-6 opacity-20 text-muted-foreground">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Gallery Coming Soon</h3>
              <p className="text-xl text-muted-foreground mb-8">
                {locale === 'ta' ? 'இந்த கேலரியில் இன்னும் படங்கள் இல்லை' : 'No images in this gallery yet'}
              </p>
              <Link
                href={`/${locale}/galleries`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Explore Other Galleries
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Back to galleries - styled consistently */}
      <section className="relative bg-muted/50">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto py-16 text-center">
          <Link
            href={`/${locale}/galleries`}
            className="inline-flex items-center gap-3 px-10 py-4 bg-transparent border-2 border-secondary text-secondary font-medium rounded-full hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Galleries
          </Link>
        </div>
      </section>
      </div>
    </>
  )
}

// Generate static params for all gallery slugs
export async function generateStaticParams() {
  try {
    const galleries = await getGalleries()
    return galleries.map((gallery) => ({
      slug: gallery.slug,
    }))
  } catch (error) {
    console.warn('Failed to generate static params for galleries:', error)
    return []
  }
}