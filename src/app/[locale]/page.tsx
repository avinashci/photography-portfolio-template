import Link from 'next/link'
import Image from 'next/image'
import { getTranslations, getFormatter, setRequestLocale } from 'next-intl/server'
import { getCachedGlobal } from '@/lib/utils/getGlobals'
import { getLocalizedValue } from '@/lib/utils/localization'
import HeroCarousel from '@/components/frontend/content/HeroCarousel'
import { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
import { getSiteMetadata } from '@/lib/api/payload-client'
import StructuredData from '@/components/seo/StructuredData'
import { getCardImageSrc } from '@/lib/utils/image-utils'
import FeaturedGalleryImage from '@/components/frontend/media/FeaturedGalleryImage'
import FeaturedGalleryThumbnail from '@/components/frontend/media/FeaturedGalleryThumbnail'

type Props = {
  params: Promise<{ locale: string }>
}

// Generate metadata for SEO using CMS data
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  // Get CMS data - prioritize site metadata from CMS
  const homeData = await getCachedGlobal('home', 3)() as any
  const settings = await getCachedGlobal('settings', 2)() as any
  
  // Fetch site metadata from CMS
  let siteMetadata
  try {
    siteMetadata = await getSiteMetadata(locale as 'en')
  } catch (error) {
    console.warn('Could not fetch site metadata from CMS, falling back to config')
  }

  // Extract SEO fields from Home global (new!)
  const homeSeo = homeData?.seo || {}
  const customTitle = homeSeo.metaTitle ? getLocalizedValue(homeSeo.metaTitle, locale as 'en') : null
  const customDescription = homeSeo.metaDescription ? getLocalizedValue(homeSeo.metaDescription, locale as 'en') : null

  // Use CMS metadata first, then config as fallback
  const personalName = siteMetadata?.personal?.name?.[locale as keyof typeof siteMetadata.personal.name] || 
                      SITE_CONFIG.personal.name
  // Site info now comes from Settings global, not SiteMetadata
  const siteTitle = settings?.site?.name || SITE_CONFIG.site.title
  const siteDescription = settings?.site?.description || SITE_CONFIG.site.description
  
  const heroTitle = homeData?.hero?.title || siteTitle
  const autoDescription = homeData?.hero?.description || homeData?.hero?.subtitle || siteDescription
  
  // Build page title using CMS data with SEO field priority
  const autoTitle = heroTitle === siteTitle ? 
    `${personalName} - ${siteTitle}` : 
    `${heroTitle} | ${personalName} ${siteTitle}`
  
  const finalTitle = customTitle || autoTitle
  const finalDescription = customDescription || autoDescription

  // Enhanced keywords from settings, home content, and intelligent defaults
  const seoSettings = settings?.seo || {}
  const settingsKeywords = seoSettings.keywords?.join(', ') || ''
  const homeKeywords = homeSeo.keywords?.join(', ') || ''
  
  // Simple fallback keywords if no CMS keywords are provided
  const simpleFallbackKeywords = personalName ? 
    `${personalName.toLowerCase()}, professional photographer, photography portfolio` : 
    'professional photographer, photography portfolio'
  
  // Combine all keywords (CMS first, then simple fallback)
  const allKeywords = [homeKeywords, settingsKeywords, simpleFallbackKeywords].filter(Boolean).join(', ')
  const keywords = homeKeywords || settingsKeywords || simpleFallbackKeywords

  // Determine the best image for social sharing
  const getImageUrl = (customUrl?: string) => {
    if (customUrl) return customUrl.startsWith('http') ? customUrl : `${SITE_CONFIG.url.base}${customUrl}`
    if (homeData?.hero?.heroImages?.[0]) {
      const heroImage = homeData.hero.heroImages[0]
      const imageUrl = heroImage.imageUrls?.full || heroImage.url
      return imageUrl?.startsWith('http') ? imageUrl : `${SITE_CONFIG.url.base}${imageUrl}`
    }
    return `${SITE_CONFIG.url.base}/api/og?title=${encodeURIComponent(heroTitle)}`
  }

  const ogImageUrl = getImageUrl(homeSeo.ogImage)
  const twitterImageUrl = getImageUrl(homeSeo.twitterImage || homeSeo.ogImage)
  
  return {
    title: finalTitle,
    description: finalDescription,
    keywords,
    authors: [{ name: personalName }],
    category: SITE_CONFIG.site.type.charAt(0).toUpperCase() + SITE_CONFIG.site.type.slice(1),
    publisher: SITE_CONFIG.site.name,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ta: '/ta',
      },
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: 'website',
      locale,
      url: `${SITE_CONFIG.url.base}/${locale}`,
      siteName: `${personalName} ${siteTitle}`,
      images: [
        {
          url: ogImageUrl,
          width: homeData?.hero?.heroImages?.[0]?.width || 1200,
          height: homeData?.hero?.heroImages?.[0]?.height || 630,
          alt: homeData?.hero?.heroImages?.[0]?.alt || homeData?.hero?.heroImages?.[0]?.altText || heroTitle,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      site: settings?.social?.twitter ? `@${settings.social.twitter.split('/').pop()}` : 
           SITE_CONFIG.social.twitter ? `@${SITE_CONFIG.social.twitter.split('/').pop()}` : undefined,
      creator: settings?.social?.twitter ? `@${settings.social.twitter.split('/').pop()}` : 
               SITE_CONFIG.social.twitter ? `@${SITE_CONFIG.social.twitter.split('/').pop()}` : undefined,
      images: [twitterImageUrl],
    },
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  
  const t = await getTranslations({ locale, namespace: 'home' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const format = await getFormatter({ locale })

  // Fetch CMS data using cached globals
  const homeData = await getCachedGlobal('home', 3)() as any

  // Fetch site metadata for personal name
  let siteMetadata
  try {
    siteMetadata = await getSiteMetadata(locale as 'en')
  } catch (error) {
    console.warn('Could not fetch site metadata from CMS, falling back to config')
  }

  // Get personal name from CMS
  const personalName = siteMetadata?.personal?.name?.[locale as keyof typeof siteMetadata.personal.name] ||
                      SITE_CONFIG.personal.name
  
  // Sanitize hero images to remove buffers and non-serializable data
  const sanitizedHeroImages = homeData?.hero?.heroImages?.map((image: any) => {
    if (!image) return null
    return {
      id: image.id || image.filename || 'unknown',
      filename: image.filename || '',
      imageUrls: image.imageUrls || {
        full: image.url || '',
        large: image.url || '',
        medium: image.url || '',  
        thumbnail: image.url || ''
      },
      url: image.url || '',
      alt: image.alt || image.altText || '',
      title: image.title || '',
      description: image.description || '',
      caption: image.caption || '',
      location: image.location ? {
        name: image.location.name || '',
        city: image.location.city || '',
        region: image.location.region || '',
        country: image.location.country || ''
      } : undefined
    }
  }).filter(Boolean) || []
  
  // Fetch galleries and blog posts data
  const galleries = await import('@/lib/api/api-client').then(client => client.getGalleries()) || []
  const blogPosts = await import('@/lib/api/api-client').then(client => client.getBlogPosts(3)) || []

  // Extract data with fallbacks
  const heroTitle = homeData?.hero?.title || t('title', { name: personalName })
  const heroSubtitle = homeData?.hero?.subtitle || t('subtitle')
  const heroDescription = homeData?.hero?.description
  const heroQuote = homeData?.hero?.quote
  const heroQuoteAuthor = homeData?.hero?.quoteAuthor

  const featuredGalleriesTitle = homeData?.featured?.featuredGalleriesTitle || t('latestCaptures.title')
  const featuredGalleriesDescription = homeData?.featured?.featuredGalleriesDescription || t('latestCaptures.description', { name: personalName })

  const aboutTitle = homeData?.aboutPreview?.aboutTitle || 'Behind the Lens'
  const aboutText = homeData?.aboutPreview?.aboutText || 'A passionate photographer dedicated to capturing the beauty and essence of the natural world.'

  // Get latest galleries and featured content
  const latestGalleries = galleries.slice(0, 4)
  const featuredGallery = galleries.find(g => g.featured) || galleries[0]
  
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <StructuredData 
        locale={locale as 'en'}
        pageType="homepage"
        pageData={{ featuredGallery }}
        customData={{
          description: heroDescription || aboutText,
          image: sanitizedHeroImages[0]?.imageUrls?.full
        }}
      />
      
      <div className="min-h-screen">
        {/* Accessibility H1 - visually hidden but available to screen readers */}
        <h1 className="sr-only">
          {heroTitle} - {heroSubtitle}
        </h1>

      {/* Hero Carousel Section */}
      <HeroCarousel 
        images={sanitizedHeroImages}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        heroDescription={heroDescription}
        heroQuote={heroQuote}
        heroQuoteAuthor={heroQuoteAuthor}
        locale={locale}
      />

      {/* Featured Gallery Section - Full Width */}
      <section className="relative overflow-hidden bg-muted/50">
        
        <div className="relative py-24 lg:py-32">
          {/* Content container - maintains readability while allowing full-width visuals */}
          <div className="px-6 lg:px-12 xl:px-16 max-w-[1600px] mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                {featuredGalleriesTitle}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                {featuredGalleriesDescription}
              </p>
            </div>
            
            {featuredGallery ? (
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-12 items-start">
                {/* Main featured gallery image - takes up more space */}
                <div className="xl:col-span-3">
                  <FeaturedGalleryImage
                    gallery={featuredGallery}
                    locale={locale}
                  />
                </div>

                {/* Gallery info and thumbnails - more modern layout */}
                <div className="xl:col-span-2 space-y-8">
                  {/* Gallery info */}
                  <div className="space-y-6">
                    <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                      {getLocalizedValue(featuredGallery.title, locale as 'en')}
                    </h3>
                    <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                      {getLocalizedValue(featuredGallery.description, locale as 'en') || 'Explore this featured collection of photography.'}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        {featuredGallery.imageCount || featuredGallery.images?.length || 0} Images
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                        {(featuredGallery as any).category || 'Photography'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Modern thumbnail preview */}
                  <div className="grid grid-cols-3 gap-3">
                    {featuredGallery.images && featuredGallery.images.length > 0 ? (
                      // Show actual images if available
                      featuredGallery.images.slice(0, 3).map((image: any, i: number) => (
                        <FeaturedGalleryThumbnail
                          key={image.id}
                          image={image}
                          gallerySlug={featuredGallery.slug}
                          locale={locale}
                        />
                      ))
                    ) : (
                      // Show placeholder thumbnails if no images available
                      [1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square bg-slate-800 dark:bg-slate-200 rounded-2xl overflow-hidden shadow-lg">
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <div className="w-8 h-8 mx-auto mb-2 opacity-40">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                                </svg>
                              </div>
                              <p className="text-xs">Preview {i}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {/* Fill remaining slots if less than 3 images */}
                    {featuredGallery.images && featuredGallery.images.length > 0 && featuredGallery.images.length < 3 &&
                      Array.from({ length: 3 - featuredGallery.images.length }, (_, i) => (
                        <div key={`placeholder-${i}`} className="aspect-square bg-slate-800 dark:bg-slate-200 rounded-2xl overflow-hidden shadow-lg">
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <div className="w-8 h-8 mx-auto mb-2 opacity-40">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                                </svg>
                              </div>
                              <p className="text-xs">Preview {(featuredGallery.images?.length || 0) + i + 1}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Modern action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link 
                      href={`/${locale}/galleries/${featuredGallery.slug}`}
                      className="group inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-primary text-primary font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {t('featuredGallery.exploreGallery')}
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link 
                      href={`/${locale}/galleries`}
                      className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-secondary text-secondary font-medium rounded-full hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                    >
                      {t('latestCaptures.viewAll')}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              // Fallback when no featured gallery exists - modern layout
              <div className="text-center py-32">
                <div className="w-32 h-32 mx-auto mb-8 opacity-30 text-muted-foreground">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                  </svg>
                </div>
                <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-6">No Featured Gallery</h3>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">Add galleries through the admin panel to showcase your featured photography work.</p>
                <Link 
                  href={`/${locale}/galleries`}
                  className="inline-flex items-center justify-center px-10 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  View All Galleries
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Preview Section - Full Width */}
      {homeData?.aboutPreview?.showAboutPreview && (
        <section className="relative overflow-hidden bg-background">
          
          <div className="relative py-32 lg:py-40">
            <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8 tracking-tight">
                  {aboutTitle}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 font-light max-w-3xl mx-auto">
                  {aboutText}
                </p>
                <Link 
                  href={`/${locale}/about`}
                  className="group inline-flex items-center justify-center px-12 py-5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Learn More About Me
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Blog Posts Section - Full Width */}
      <section className="relative overflow-hidden bg-muted/50">
        
        <div className="relative py-24 lg:py-32">
          <div className="px-6 lg:px-12 xl:px-16 max-w-[1600px] mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                {t('journal.title')}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                {t('journal.description', { name: personalName })}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {blogPosts.length > 0 ? blogPosts.map((post) => {
              const postTitle = getLocalizedValue(post.title, locale as 'en')
              const postExcerpt = getLocalizedValue(post.excerpt, locale as 'en')
              
              return (
                <Link key={post.id} href={`/${locale}/journal/${post.slug}`} className="group">
                  <article className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="aspect-[16/10] bg-slate-800 dark:bg-slate-200 relative overflow-hidden">
                      {post.featuredImage ? (
                        <>
                          <Image
                            src={(post.featuredImage && typeof post.featuredImage === 'object' && 'imageUrls' in post.featuredImage) ? getCardImageSrc(post.featuredImage as any) : (post.featuredImage as any)?.url || ''}
                            alt={postTitle}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            quality={85}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 opacity-40">
                              <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                              </svg>
                            </div>
                            <p className="text-xs">{postTitle}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                          {(post as any).category || 'Photography'}
                        </span>
                        <span>•</span>
                        <span>{format.dateTime(new Date((post as any).publishDate || post.createdAt), { 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                        <span>•</span>
                        <span>{`${Math.max(1, Math.ceil(((postExcerpt || '').split(/\s+/).length) / 200))} min read`}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {postTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {postExcerpt || 'Read this blog post to learn more about photography techniques and experiences.'}
                      </p>
                    </div>
                  </article>
                </Link>
              )
            }) : (
              // Fallback when no blog posts exist
              [1, 2, 3].map((i) => (
                <article key={i} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
                  <div className="aspect-[16/10] bg-slate-800 dark:bg-slate-200 relative overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 opacity-40">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </div>
                        <p className="text-xs">Sample Blog Post {i}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                        Photography
                      </span>
                      <span>•</span>
                      <span>{format.dateTime(new Date(2024, 11, 10 + i), { 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                      <span>•</span>
                      <span>2 min read</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-foreground mb-1 line-clamp-2">
                      Sample Blog Post {i}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      This is a sample blog post. Add content through the admin panel to showcase your photography stories and techniques.
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
          
          <div className="text-center">
            <Link 
              href={`/${locale}/journal`}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-secondary text-secondary font-medium rounded-full hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
            >
              {t('journal.readAllPosts')}
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          </div>
        </div>
      </section>

      </div>
    </>
  )
}