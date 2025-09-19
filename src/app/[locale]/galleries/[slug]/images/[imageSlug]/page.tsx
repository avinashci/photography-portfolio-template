import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getImageBySlug, getGalleryBySlug, getGalleries, getLocalizedValue, formatDate } from '@/lib/api/api-client'
import { getSEOPersonalData, getDefaultCopyright } from '@/lib/utils/seo-helpers'
import type { PayloadImage, PayloadGallery } from '@/lib/api/api-client'
import { getResponsiveImageProps, formatFileSize } from '@/lib/utils/image-utils'
import OptimizedImage from '@/components/ui/base/OptimizedImage'
import { Button } from '@/components/ui/base/button'
import ImageDetailClient from './ImageDetailClient'
import ImageActions from './ImageActions'
import type { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
import StructuredData from '@/components/seo/StructuredData'
import CommentForm from '@/components/frontend/comments/CommentForm'
import CommentsList from '@/components/frontend/comments/CommentsList'

interface ImageDetailPageProps {
  params: Promise<{ locale: string; slug: string; imageSlug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ImageDetailPageProps): Promise<Metadata> {
  const { locale, slug, imageSlug } = await params
  
  const [image, gallery, personalData] = await Promise.all([
    getImageBySlug(imageSlug),
    getGalleryBySlug(slug),
    getSEOPersonalData(locale as 'en')
  ])
  
  if (!image || !gallery) {
    return {
      title: DERIVED_CONFIG.getPageTitle('Image Not Found'),
      description: 'The requested image could not be found.'
    }
  }

  // Extract base content
  const imageTitle = getLocalizedValue(image.title, locale as 'en')
  const imageDescription = getLocalizedValue(image.description, locale as 'en')
  const imageCaption = getLocalizedValue(image.caption, locale as 'en')
  const galleryTitle = getLocalizedValue((gallery as PayloadGallery).title, locale as 'en')
  const locationName = image.location ? getLocalizedValue(image.location.name, locale as 'en') : null
  const imageTags = image.tags ? getLocalizedValue(image.tags, locale as 'en') : []
  const imageUrl = ('imageUrls' in image ? image.imageUrls?.full : null) || ''

  // Extract SEO fields (new!)
  const seo = image.seo || {}
  const customTitle = seo.metaTitle ? getLocalizedValue(seo.metaTitle as any, locale as 'en') : null
  const customDescription = seo.metaDescription ? getLocalizedValue(seo.metaDescription as any, locale as 'en') : null
  const seoKeywords = seo.keywords || []
  const customOgImage = seo.ogImage || null
  const canonicalUrl = seo.canonicalUrl || `${SITE_CONFIG.url.base}/${locale}/galleries/${slug}/images/${imageSlug}`
  const shouldIndex = !seo.noIndex

  // Build technical metadata description
  const technicalDetails = []
  if (image.technical) {
    if (image.technical.cameraBody && typeof image.technical.cameraBody === 'object' && 'name' in image.technical.cameraBody) {
      technicalDetails.push(getLocalizedValue(image.technical.cameraBody.name, locale as 'en'))
    }
    if (image.technical.lensGear && typeof image.technical.lensGear === 'object' && 'name' in image.technical.lensGear) {
      technicalDetails.push(getLocalizedValue(image.technical.lensGear.name, locale as 'en'))
    }
    if (image.technical.aperture) technicalDetails.push(image.technical.aperture)
    if (image.technical.shutterSpeed) technicalDetails.push(image.technical.shutterSpeed)
    if (image.technical.iso) technicalDetails.push(`ISO ${image.technical.iso}`)
  }

  // Build final metadata with SEO field priority
  const finalTitle = customTitle || imageTitle
  const autoDescription = `${imageTitle} - A photograph${locationName ? ` taken in ${locationName}` : ''}${technicalDetails.length > 0 ? ` using ${technicalDetails.slice(0, 2).join(' and ')}` : ''}. Part of the ${galleryTitle} ${SITE_CONFIG.site.type} collection by ${personalData.name}.`
  const finalDescription = customDescription || imageCaption || imageDescription || autoDescription
  const finalKeywords = seoKeywords.length > 0 ? seoKeywords.join(', ') : 
    (imageTags.length > 0 ? imageTags.join(', ') : `${SITE_CONFIG.site.type}, ${galleryTitle.toLowerCase()}, ${imageTitle.toLowerCase()}`)
  const finalOgImage = customOgImage || imageUrl

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
      type: 'article',
      siteName: SITE_CONFIG.site.name,
      images: finalOgImage ? [
        {
          url: finalOgImage,
          width: 1200,
          height: 800,
          alt: finalTitle,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      creator: SITE_CONFIG.social.twitter ? `@${SITE_CONFIG.social.twitter.split('/').pop()}` : undefined,
      images: finalOgImage ? [finalOgImage] : [],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${SITE_CONFIG.url.base}/en/galleries/${slug}/images/${imageSlug}`,
        'ta': `${SITE_CONFIG.url.base}/ta/galleries/${slug}/images/${imageSlug}`,
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
    other: {
      // Add structured data for better SEO
      'article:author': personalData.name,
      'article:section': galleryTitle,
      ...(image.captureDate && { 'article:published_time': image.captureDate }),
      ...(locationName && { 'geo.placename': locationName }),
    }
  }
}

export default async function ImageDetailPage({ params }: ImageDetailPageProps) {
  const { locale, slug, imageSlug } = await params
  const t = await getTranslations('galleries')
  const tNav = await getTranslations('nav')
  
  // Fetch image, gallery and default copyright from CMS
  const [image, defaultCopyright] = await Promise.all([
    getImageBySlug(imageSlug),
    getDefaultCopyright(locale as 'en')
  ])
  
  if (!image || !image.gallery) {
    notFound()
  }
  
  const gallery = await getGalleryBySlug(slug)
  
  if (!gallery) {
    notFound()
  }

  // Sanitize gallery data for client component to prevent serialization errors
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
    images: gallery.images?.map((img: any) => ({
      id: img.id || img.filename || 'unknown',
      slug: img.slug || '',
      title: img.title || '',
      description: img.description || '',
      alt: img.alt || img.altText || '',
      imageUrls: img.imageUrls || {
        full: img.url || '',
        large: img.url || '', 
        medium: img.url || '',
        thumbnail: img.url || ''
      },
      url: img.url || '',
      filename: img.filename || ''
    })) || []
  }

  // Get localized values
  const imageTitle = getLocalizedValue(image.title, locale as 'en')
  const imageDescription = getLocalizedValue(image.description, locale as 'en')
  const imageAlt = 'alt' in image ? getLocalizedValue(image.alt, locale as 'en') : (image.altText || '')
  const galleryTitle = getLocalizedValue((gallery as PayloadGallery).title, locale as 'en')

  // Find current image index in gallery for navigation
  const galleryImages = (gallery as PayloadGallery).images
  const imageIndex = galleryImages?.findIndex(img => img.slug === imageSlug) ?? -1
  const prevImage = imageIndex > 0 && galleryImages ? galleryImages[imageIndex - 1] : null
  const nextImage = imageIndex < (galleryImages?.length || 0) - 1 && galleryImages ? galleryImages[imageIndex + 1] : null

  return (
    <>
      {/* JSON-LD Structured Data */}
      <StructuredData 
        locale={locale as 'en'}
        pageType="image"
        pageData={image}
        customData={{
          title: imageTitle,
          description: imageDescription || undefined,
          url: `${SITE_CONFIG.url.base}/${locale}/galleries/${slug}/images/${imageSlug}`,
          image: image.imageUrls?.full || ('url' in image ? image.url as string : undefined),
          datePublished: image.captureDate || image.createdAt,
          dateModified: image.updatedAt
        }}
      />
      
      <div>
      {/* Full-Width Image Hero Section */}
      <section className="relative">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1800px] mx-auto py-12 lg:py-16">
          {/* Breadcrumb - modern styling */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href={`/${locale}/galleries`} className="hover:text-foreground transition-colors">
                  {tNav('galleries')}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/${locale}/galleries/${slug}`} className="hover:text-foreground transition-colors">
                  {galleryTitle}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">{imageTitle}</li>
            </ol>
          </nav>

          {/* Immersive Image Layout */}
          <div className="grid xl:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
            {/* Main Image - Takes center stage */}
            <div className="xl:col-span-2">
              <ImageDetailClient 
                image={image as PayloadImage}
                defaultCopyright={defaultCopyright}
              />
              
              {/* Action Buttons - Below Image */}
              <div className="mt-6">
                <ImageActions 
                  image={image as PayloadImage}
                  galleryImages={galleryImages as PayloadImage[] || []}
                  currentIndex={imageIndex}
                  shareUrl={`${SITE_CONFIG.url.base}/${locale}/galleries/${slug}/images/${imageSlug}`}
                  galleryTitle={galleryTitle}
                  variant="inline"
                />
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="xl:space-y-10 space-y-6">
              {/* Image Title & Description */}
              <div className="space-y-6">
                <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {imageTitle}
                </h1>
                
                {imageDescription && (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {imageDescription}
                  </p>
                )}
              </div>

              {/* Image Details - Modern Cards */}
              <div className="space-y-6">
                {/* Date and Location Card */}
                <div className="bg-muted/30 rounded-2xl p-6 border border-border/10">
                  <h3 className="font-serif text-base md:text-lg font-semibold text-foreground mb-4">Details</h3>
                  <div className="space-y-4">
                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Captured</div>
                        <div className="font-medium text-foreground">{formatDate(image.captureDate, locale as 'en')}</div>
                      </div>
                    </div>
                    
                    {/* Location */}
                    {image.location && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Location</div>
                          <div className="font-medium text-foreground">
                            {image.location?.name && getLocalizedValue(image.location.name, locale as 'en')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {[
                              image.location?.city && getLocalizedValue(image.location.city, locale as 'en'),
                              image.location?.region && getLocalizedValue(image.location.region, locale as 'en'), 
                              image.location?.country && getLocalizedValue(image.location.country, locale as 'en')
                            ].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Details Card */}
                {image.technical && (image.technical.cameraBody || image.technical.lensGear || image.technical.aperture || image.technical.shutterSpeed || image.technical.iso) && (
                  <div className="bg-muted/30 rounded-2xl p-6 border border-border/10">
                    <h3 className="font-serif text-base md:text-lg font-semibold text-foreground mb-4">Technical</h3>
                    <div className="space-y-4">
                      {/* Camera & Lens */}
                      {(image.technical.cameraBody || image.technical.lensGear) && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Equipment</div>
                            <div className="font-medium text-foreground">
                              {(image.technical.cameraBody && typeof image.technical.cameraBody === 'object' && 'name' in image.technical.cameraBody && image.technical.cameraBody.name) && (image.technical.lensGear && typeof image.technical.lensGear === 'object' && 'name' in image.technical.lensGear && image.technical.lensGear.name) ? (
                                <>{getLocalizedValue(image.technical.cameraBody.name, locale as 'en')} + {getLocalizedValue(image.technical.lensGear.name, locale as 'en')}</>
                              ) : (image.technical.cameraBody && typeof image.technical.cameraBody === 'object' && 'name' in image.technical.cameraBody && image.technical.cameraBody.name) ? (
                                <>{getLocalizedValue(image.technical.cameraBody.name, locale as 'en')}</>
                              ) : (image.technical.lensGear && typeof image.technical.lensGear === 'object' && 'name' in image.technical.lensGear && image.technical.lensGear.name) ? (
                                <>{getLocalizedValue(image.technical.lensGear.name, locale as 'en')}</>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Camera Settings */}
                      {(image.technical.aperture || image.technical.shutterSpeed || image.technical.iso || image.technical.focalLength) && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Settings</div>
                            <div className="font-medium text-foreground">
                              {[
                                image.technical.aperture,
                                image.technical.shutterSpeed,
                                image.technical.iso && `ISO ${image.technical.iso}`,
                                image.technical.focalLength && `${image.technical.focalLength}mm`
                              ].filter(Boolean).join(' • ')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>


            </div>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="relative bg-muted/50 border-t border-border/20">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto py-16">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
              Comments
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Share your thoughts about this image. Your comments help create a community 
              around visual storytelling and photography appreciation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Comments Form */}
            <div className="space-y-6">
              <div className="bg-background border border-border/20 rounded-2xl p-6 shadow-sm">
                <CommentForm
                  imageId={image.id}
                  imageSlug={imageSlug}
                  imageTitle={imageTitle}
                />
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              <div className="bg-background border border-border/20 rounded-2xl p-6 shadow-sm">
                <CommentsList
                  imageId={image.id}
                  className="h-fit max-h-[600px] overflow-auto"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Modern Navigation Section */}
      <section className="relative bg-background border-t border-border/20">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1800px] mx-auto py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <Link 
                href={`/${locale}/galleries/${slug}`}
                className="group inline-flex items-center justify-center gap-3 px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-full hover:bg-secondary/80 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Back to Gallery
              </Link>
            </div>
            
            <div className="flex gap-4">
              {prevImage && (
                <Link 
                  href={`/${locale}/galleries/${slug}/images/${prevImage.slug}`}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-primary text-primary font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Link>
              )}
              {nextImage && (
                <Link 
                  href={`/${locale}/galleries/${slug}/images/${nextImage.slug}`}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-primary text-primary font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Next
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

// Generate static params for all images in all galleries
export async function generateStaticParams() {
  try {
    const galleries = await getGalleries()
    const params: { slug: string; imageSlug: string }[] = []
    
    for (const gallery of galleries) {
      if (gallery.images) {
        gallery.images.forEach((image: any) => {
          params.push({
            slug: gallery.slug,
            imageSlug: image.slug
          })
        })
      }
    }
    
    return params
  } catch (error) {
    console.warn('Failed to generate static params for image details:', error)
    return []
  }
}