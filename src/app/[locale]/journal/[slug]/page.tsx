import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getBlogPostBySlug, getBlogPosts, getLocalizedValue, formatDate, getSettings, getSiteMetadata } from '@/lib/api/api-client'
import { getSEOPersonalData } from '@/lib/utils/seo-helpers'
import type { PayloadBlogPost, PayloadImage } from '@/lib/api/api-client'
import { getResponsiveImageProps, getSafeImageProps } from '@/lib/utils/image-utils'
import OptimizedImage from '@/components/ui/base/OptimizedImage'
import RichTextRenderer from '@/components/ui/base/RichTextRenderer'
import { calculateReadingTime } from '@/lib/utils/reading-time'
import ReadingProgress from './ReadingProgress'
import SocialShare from '@/components/frontend/sharing/SocialShare'
import type { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  
  const [post, personalData] = await Promise.all([
    getBlogPostBySlug(slug),
    getSEOPersonalData(locale as 'en')
  ])
  
  if (!post) {
    return {
      title: DERIVED_CONFIG.getPageTitle('Post Not Found'),
      description: 'The requested blog post could not be found.'
    }
  }

  // Extract base content
  const title = getLocalizedValue(post.title, locale as 'en')
  const subtitle = getLocalizedValue(post.subtitle, locale as 'en')
  const excerpt = getLocalizedValue(post.excerpt, locale as 'en')
  const tags = getLocalizedValue(post.tags, locale as 'en') || []
  const featuredImageUrl = (post.featuredImage && typeof post.featuredImage === 'object' && 'imageUrls' in post.featuredImage) ? 
    post.featuredImage.imageUrls?.medium || post.featuredImage.imageUrls?.full : undefined

  // Extract SEO fields (new!)
  const seo = post.seo || {}
  const customTitle = seo.metaTitle ? getLocalizedValue(seo.metaTitle as any, locale as 'en') : null
  const customDescription = seo.metaDescription ? getLocalizedValue(seo.metaDescription as any, locale as 'en') : null
  const seoKeywords = seo.keywords || []
  const customOgImage = seo.ogImage || null
  const canonicalUrl = seo.canonicalUrl || `${SITE_CONFIG.url.base}/${locale}/journal/${slug}`
  const shouldIndex = !seo.noIndex

  // Article schema data
  const schema = seo.schema || {}
  const articleType = schema.articleType || 'BlogPosting'
  const readingTime = schema.readingTime || null
  const photographyLocation = schema.photographyLocation || null

  // Build final metadata with SEO field priority
  const finalTitle = customTitle || (subtitle ? `${title}: ${subtitle}` : title)
  const finalDescription = customDescription || excerpt || `${title} - A photography blog post by ${personalData.name}`
  const finalKeywords = seoKeywords.length > 0 ? seoKeywords.join(', ') : 
    (tags.length > 0 ? tags.join(', ') : `${SITE_CONFIG.site.type} blog, photography, travel, ${personalData.title.toLowerCase()}`)
  const finalOgImage = customOgImage || featuredImageUrl

  return {
    title: DERIVED_CONFIG.getPageTitle(finalTitle),
    description: finalDescription,
    keywords: finalKeywords,
    authors: [{ name: (post as any).author || personalData.name }],
    category: 'Photography Blog',
    publisher: SITE_CONFIG.site.name,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: 'article',
      publishedTime: (post as any).createdAt,
      modifiedTime: (post as any).updatedAt,
      authors: [(post as any).author || personalData.name],
      tags: tags.length > 0 ? tags : undefined,
      images: finalOgImage ? [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        }
      ] : [],
      siteName: SITE_CONFIG.site.name,
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
        'en': `${SITE_CONFIG.url.base}/en/journal/${slug}`,
        'ta': `${SITE_CONFIG.url.base}/ta/journal/${slug}`,
      }
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: (() => {
      const otherMeta: { [key: string]: string } = {}
      if (readingTime) otherMeta['article:reading_time'] = `${readingTime} min`
      if (photographyLocation) otherMeta['article:location'] = photographyLocation
      otherMeta['article:type'] = articleType
      return Object.keys(otherMeta).length > 0 ? otherMeta : undefined
    })()
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params
  const t = await getTranslations('journal')
  
  // Fetch blog post from PayloadCMS
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Fetch site settings for dynamic values
  const settings = await getSettings(locale)
  const siteMetadata = await getSiteMetadata(locale)

  // Get localized values
  const title = getLocalizedValue(post.title, locale as 'en')
  const subtitle = getLocalizedValue(post.subtitle, locale as 'en')
  const tripDates = getLocalizedValue(post.tripDates, locale as 'en')
  const excerpt = getLocalizedValue(post.excerpt, locale as 'en')
  const contentBlocks = getLocalizedValue(post.contentBlocks, locale as 'en') || []
  const tags = getLocalizedValue(post.tags, locale as 'en') || []
  const readTime = calculateReadingTime(contentBlocks)


  // Find related posts (same tags, excluding current post)
  const allPosts = await getBlogPosts(10)
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && 
      getLocalizedValue(p.tags, locale as 'en')?.some(tag => tags.includes(tag))
    )
    .slice(0, 3)

  // Find next and previous posts (by publish date)
  const sortedPosts = allPosts.sort((a, b) => new Date((a as any).publishedAt || a.createdAt).getTime() - new Date((b as any).publishedAt || b.createdAt).getTime())
  const currentIndex = sortedPosts.findIndex(p => p.id === post.id)
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null

  // Generate structured data for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": excerpt,
    "image": (post.featuredImage && typeof post.featuredImage === 'object' && 'imageUrls' in post.featuredImage) ? post.featuredImage.imageUrls?.full || '' : '',
    "author": (post as any).author ? {
      "@type": "Person",
      "name": (post as any).author
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": settings?.site?.name?.[locale] || siteMetadata?.personal?.name?.[locale] || "Photography Portfolio"
    },
    "datePublished": (post as any).createdAt,
    "dateModified": (post as any).updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${settings?.site?.url || process.env.NEXT_PUBLIC_SERVER_URL || 'https://yoursite.com'}/${locale}/journal/${slug}`
    },
    "keywords": (tags || []).join(', '),
    "articleSection": undefined,
    "wordCount": undefined,
    "url": `${settings?.site?.url || process.env.NEXT_PUBLIC_SERVER_URL || 'https://yoursite.com'}/${locale}/journal/${slug}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ReadingProgress readTime={readTime} />
      
      <div className="min-h-screen">
        {/* Immersive Article Hero */}
        <section className="relative overflow-hidden">
          {/* Featured Image Background */}
          {post.featuredImage && typeof post.featuredImage === 'object' && 'imageUrls' in post.featuredImage ? (
            <div className="absolute inset-0">
              <OptimizedImage
                {...getResponsiveImageProps(post.featuredImage as PayloadImage, 'detail-main')}
                alt={getLocalizedValue((post.featuredImage as PayloadImage).alt, locale as 'en')}
                className="w-full h-full object-cover object-top"
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
                      href={`/${locale}/journal`} 
                      className={`transition-colors ${post.featuredImage ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Journal
                    </Link>
                  </li>
                  <li className={post.featuredImage ? 'text-white/50' : 'text-muted-foreground'}>/</li>
                  <li className={`font-medium ${post.featuredImage ? 'text-white' : 'text-foreground'}`}>{title}</li>
                </ol>
              </nav>

              {/* Article Header */}
              <header className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                    post.featuredImage 
                      ? 'bg-white/20 text-white/90 backdrop-blur-sm' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {tags[0] || 'General'}
                  </span>
                  
                  <div className={`flex items-center gap-3 text-sm ${
                    post.featuredImage ? 'text-white/80' : 'text-muted-foreground'
                  }`}>
                    {(post as any).author && (
                      <>
                        <span className="font-medium">{(post as any).author}</span>
                        <span>•</span>
                      </>
                    )}
                    {((post as any)._status === 'published' && (post as any).createdAt) && (
                      <>
                        <span>{formatDate((post as any).createdAt, locale as 'en')}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{readTime}</span>
                  </div>
                </div>
                
                <h1 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight ${
                  post.featuredImage ? 'text-white drop-shadow-2xl' : 'text-foreground'
                }`}>
                  {title}
                </h1>
                
                {subtitle && (
                  <h2 className={`text-xl md:text-2xl font-light mb-4 max-w-3xl leading-relaxed ${
                    post.featuredImage ? 'text-white/90 drop-shadow-xl' : 'text-muted-foreground'
                  }`}>
                    {subtitle}
                  </h2>
                )}
                
                {tripDates && (
                  <p className={`text-base italic mb-8 ${
                    post.featuredImage ? 'text-white/80 drop-shadow-lg' : 'text-muted-foreground'
                  }`}>
                    {tripDates}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-2 text-sm font-medium rounded-full ${
                        post.featuredImage 
                          ? 'bg-white/15 text-white/90 backdrop-blur-sm' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </header>
            </div>
          </div>
        </section>

        {/* Article Content Section */}
        <section className="relative">
          <div className="px-6 lg:px-12 xl:px-16 max-w-[1600px] mx-auto py-12 lg:py-16">
            <article className="space-y-16 mx-auto max-w-7xl">
            {contentBlocks && contentBlocks.map((block: any, index: number) => (
              <div key={index} className="content-block">
                {/* Text Section */}
                {block.blockType === 'textSection' && (
                  <div className={`space-y-6 ${
                    block.layout === 'centered' ? 'text-center' :
                    block.layout === 'narrow' ? 'max-w-5xl mx-auto' :
                    ''
                  }`}>
                    {block.title && (
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6">
                        {getLocalizedValue(block.title, locale as 'en')}
                      </h2>
                    )}
                    <div className="text-foreground leading-relaxed">
                      <RichTextRenderer content={getLocalizedValue(block.content, locale as 'en')} />
                    </div>
                  </div>
                )}

                {/* Image Section */}
                {block.blockType === 'imageSection' && block.images && (
                  <div className="space-y-6">
                    {block.title && (
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground text-center">
                        {getLocalizedValue(block.title, locale as 'en')}
                      </h2>
                    )}
                    <div className={`grid gap-4 ${
                      block.layout === 'single' ? 'grid-cols-1' :
                      block.layout === 'two-column' ? 'grid-cols-1 md:grid-cols-2' :
                      block.layout === 'three-grid' ? 'grid-cols-1 md:grid-cols-3' :
                      block.layout === 'gallery-grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
                      'grid-cols-1'
                    }`}>
                      {block.images.map((image: any) => (
                        <div key={image.id} className={`${
                          block.aspectRatio === 'square' ? 'aspect-square' :
                          block.aspectRatio === 'landscape' ? 'aspect-video' :
                          block.aspectRatio === 'portrait' ? 'aspect-[4/5]' :
                          'aspect-auto'
                        } ${block.layout === 'full-bleed' ? '-mx-4 md:-mx-8' : ''} overflow-hidden rounded-lg`}>
                          <OptimizedImage
                            {...getSafeImageProps(image, 'detail-main')}
                            alt={getLocalizedValue(image.alt, locale as 'en') || getLocalizedValue(image.title, locale as 'en')}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {block.caption && (
                      <p className="text-sm text-muted-foreground text-center italic mt-4">
                        {getLocalizedValue(block.caption, locale as 'en')}
                      </p>
                    )}
                  </div>
                )}

                {/* Text + Image Section */}
                {block.blockType === 'textImageSection' && (
                  <div className={`grid gap-8 items-center ${
                    block.layout === 'image-left' || block.layout === 'text-left' ? 'md:grid-cols-2' : 'grid-cols-1'
                  }`}>
                    <div className={`space-y-4 ${
                      block.layout === 'image-left' ? 'md:order-2' : ''
                    }`}>
                      {block.title && (
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                          {getLocalizedValue(block.title, locale as 'en')}
                        </h2>
                      )}
                      <div className="text-foreground leading-relaxed">
                        <RichTextRenderer content={getLocalizedValue(block.content, locale as 'en')} />
                      </div>
                    </div>
                    {block.image && (
                      <div className={`${
                        block.layout === 'image-left' ? 'md:order-1' : ''
                      }`}>
                        <div className="aspect-auto overflow-hidden rounded-lg">
                          <OptimizedImage
                            {...getSafeImageProps(block.image, 'detail-main')}
                            alt={getLocalizedValue(block.image.alt, locale as 'en') || block.title}
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quote Section */}
                {block.blockType === 'quoteSection' && (
                  <div className={`text-center space-y-4 py-8 ${
                    block.style === 'callout' ? 'bg-card border border-border rounded-lg p-8' : ''
                  }`}>
                    <blockquote className={`${
                      block.style === 'large' ? 'text-2xl md:text-3xl' :
                      block.style === 'emphasized' ? 'text-xl md:text-2xl font-semibold' :
                      block.style === 'minimal' ? 'text-lg' :
                      'text-xl md:text-2xl'
                    } text-foreground italic leading-relaxed max-w-5xl mx-auto`}>
                      "{getLocalizedValue(block.quote, locale as 'en')}"
                    </blockquote>
                    {block.author && (
                      <cite className="text-muted-foreground not-italic">
                        — {getLocalizedValue(block.author, locale as 'en')}
                      </cite>
                    )}
                  </div>
                )}

                {/* Image Carousel with Text */}
                {block.blockType === 'imageCarouselText' && block.images && (
                  <div className={`grid gap-8 items-center ${
                    ['left', 'right'].includes(block.textPosition) ? 'lg:grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {/* Text Content */}
                    <div className={`space-y-4 ${
                      block.textPosition === 'right' ? 'lg:order-2' : 
                      block.textPosition === 'bottom' ? 'order-2' : 
                      'order-1'
                    } ${
                      // Width logic only applies to left/right positioning
                      ['left', 'right'].includes(block.textPosition) ? (
                        block.textSize === 'small' ? 'lg:w-[30%]' :
                        block.textSize === 'large' ? 'lg:w-[50%]' :
                        block.textSize === 'xlarge' ? 'lg:w-[75%]' :
                        'lg:w-[40%]' // Default medium width
                      ) : ''
                    }`}>
                      {block.title && (
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                          {getLocalizedValue(block.title, locale as 'en')}
                        </h2>
                      )}
                      <div className="text-foreground leading-relaxed">
                        <RichTextRenderer content={getLocalizedValue(block.content, locale as 'en')} />
                      </div>
                    </div>

                    {/* Image Display */}
                    <div className={`${
                      block.textPosition === 'right' ? 'lg:order-1' : 
                      block.textPosition === 'bottom' ? 'order-1' : 
                      'order-2'
                    } ${
                      // Complementary width logic for left/right positioning
                      ['left', 'right'].includes(block.textPosition) ? (
                        block.textSize === 'small' ? 'lg:w-[70%]' :
                        block.textSize === 'large' ? 'lg:w-[50%]' :
                        block.textSize === 'xlarge' ? 'lg:w-[25%]' :
                        'lg:w-[60%]' // Default medium complement
                      ) : ''
                    }`}>
                      {/* Carousel Display */}
                      {block.displayMode === 'carousel' && (
                        <div className="relative overflow-hidden rounded-lg">
                          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                            {block.images.map((image: any, imageIndex: number) => (
                              <div 
                                key={image.id} 
                                className={`flex-shrink-0 w-full snap-center ${
                                  block.imageRatio === 'square' ? 'aspect-square' :
                                  block.imageRatio === 'landscape' ? 'aspect-[3/2]' :
                                  block.imageRatio === 'portrait' ? 'aspect-[2/3]' :
                                  'aspect-auto'
                                }`}
                              >
                                <OptimizedImage
                                  {...getSafeImageProps(image, 'detail-main')}
                                  alt={getLocalizedValue(image.alt, locale as 'en') || getLocalizedValue(image.title, locale as 'en')}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grid Collage Display */}
                      {block.displayMode === 'grid-collage' && (
                        <div className={`grid gap-2 ${
                          block.images.length === 2 ? 'grid-cols-2' :
                          block.images.length === 3 ? 'grid-cols-3' :
                          block.images.length === 4 ? 'grid-cols-2' :
                          'grid-cols-2 md:grid-cols-3'
                        }`}>
                          {block.images.map((image: any) => (
                            <div 
                              key={image.id} 
                              className={`overflow-hidden rounded-lg ${
                                block.imageRatio === 'square' ? 'aspect-square' :
                                block.imageRatio === 'landscape' ? 'aspect-[3/2]' :
                                block.imageRatio === 'portrait' ? 'aspect-[2/3]' :
                                'aspect-square'
                              }`}
                            >
                              <OptimizedImage
                                {...getSafeImageProps(image, 'detail-main')}
                                alt={getLocalizedValue(image.alt, locale as 'en') || getLocalizedValue(image.title, locale as 'en')}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Masonry Collage Display */}
                      {block.displayMode === 'masonry-collage' && (
                        <div className="columns-2 md:columns-3 gap-2 space-y-2">
                          {block.images.map((image: any) => (
                            <div key={image.id} className="break-inside-avoid overflow-hidden rounded-lg">
                              <OptimizedImage
                                {...getSafeImageProps(image, 'detail-main')}
                                alt={getLocalizedValue(image.alt, locale as 'en') || getLocalizedValue(image.title, locale as 'en')}
                                className="w-full h-auto hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stacked Layout Display */}
                      {block.displayMode === 'stacked' && (
                        <div className="space-y-4">
                          {block.images.map((image: any) => (
                            <div key={image.id} className="overflow-hidden rounded-lg">
                              <OptimizedImage
                                {...getSafeImageProps(image, 'detail-main')}
                                alt={getLocalizedValue(image.alt, locale as 'en') || getLocalizedValue(image.title, locale as 'en')}
                                className="w-full h-auto"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flexible Content Block */}
                {block.blockType === 'flexibleContent' && block.elements && (
                  <div className={`space-y-6 ${
                    block.layout === 'narrow' ? 'max-w-5xl mx-auto' :
                    ''
                  }`}>
                    {block.title && (
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8">
                        {getLocalizedValue(block.title, locale as 'en')}
                      </h2>
                    )}
                    
                    {block.elements.map((element: any, elementIndex: number) => (
                      <div key={elementIndex} className="element">
                        {/* Text Element */}
                        {element.blockType === 'textElement' && (
                          <div className={`${
                            element.alignment === 'center' ? 'text-center' :
                            element.alignment === 'right' ? 'text-right' :
                            'text-left'
                          }`}>
                            <div className={`prose max-w-none ${
                              element.style === 'large' ? 'prose-lg text-lg' :
                              element.style === 'small' ? 'prose-sm text-sm' :
                              element.style === 'highlighted' ? 'prose p-4 bg-card border-l-4 border-primary rounded-r-lg' :
                              element.style === 'quote' ? 'prose italic text-center text-lg border-l-4 border-primary pl-6' :
                              'prose'
                            } text-foreground leading-relaxed`}>
                              <RichTextRenderer content={getLocalizedValue(element.content, locale as 'en')} />
                            </div>
                          </div>
                        )}

                        {/* Image Element */}
                        {element.blockType === 'imageElement' && element.image && (
                          <div className={`${
                            element.alignment === 'center' ? 'mx-auto' :
                            element.alignment === 'right' ? 'ml-auto' :
                            ''
                          } ${
                            element.size === 'thumbnail' ? 'w-1/4' :
                            element.size === 'small' ? 'w-1/3' :
                            element.size === 'medium' ? 'w-1/2' :
                            element.size === 'large' ? 'w-3/4' :
                            'w-full'
                          }`}>
                            <div className={`overflow-hidden rounded-lg ${
                              element.aspectRatio === 'square' ? 'aspect-square' :
                              element.aspectRatio === 'landscape' ? 'aspect-video' :
                              element.aspectRatio === 'portrait' ? 'aspect-[4/5]' :
                              'aspect-auto'
                            }`}>
                              <OptimizedImage
                                {...getSafeImageProps(element.image, 'detail-main')}
                                alt={getLocalizedValue(element.image.alt, locale as 'en') || getLocalizedValue(element.image.title, locale as 'en')}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}

                        {/* Spacer Element */}
                        {element.blockType === 'spacer' && (
                          <div className={`${
                            element.height === 'small' ? 'h-4' :
                            element.height === 'large' ? 'h-16' :
                            element.height === 'extra-large' ? 'h-24' :
                            'h-8'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Gallery Showcase */}
                {block.blockType === 'galleryShowcase' && block.gallery && (
                  <div className="space-y-6">
                    {block.title && (
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground text-center">
                        {getLocalizedValue(block.title, locale as 'en')}
                      </h2>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {block.gallery.images?.slice(0, block.maxImages || 6).map((image: any) => (
                        <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
                          <OptimizedImage
                            {...getSafeImageProps(image, 'gallery-thumb')}
                            alt={getLocalizedValue(image.title, locale as 'en')}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <Link
                        href={`/${locale}/galleries/${block.gallery.slug}`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        View Full Gallery
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

              {/* Article Footer - Modern Design */}
              <footer className="border-t border-border/20 pt-16 mt-16">
                {/* Share Buttons */}
                <div className="mb-12">
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Share this story</h3>
                  <SocialShare
                    url={`${SITE_CONFIG.url.base}/${locale}/journal/${slug}`}
                    title={title}
                    description={subtitle || excerpt}
                    hashtags={['photography', 'travel', 'blog', ...(tags?.slice(0, 3) || [])]}
                    className=""
                  />
                </div>
              </footer>
            </article>
          </div>
        </section>

        {/* Navigation Section */}
        <section className="relative bg-muted/20 border-t border-border/20">
          <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto py-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              {prevPost && (
                <Link 
                  href={`/${locale}/journal/${prevPost.slug}`}
                  className="group flex items-center gap-4 p-6 bg-background rounded-2xl border border-border hover:shadow-xl transition-all duration-300 max-w-sm"
                >
                  <svg className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">Previous Story</p>
                    <p className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {getLocalizedValue(prevPost.title, locale as 'en')}
                    </p>
                  </div>
                </Link>
              )}
              
              <div className="flex-1 flex justify-center">
                <Link 
                  href={`/${locale}/journal`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-secondary text-secondary font-medium rounded-full hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  All Journal Entries
                </Link>
              </div>
              
              {nextPost && (
                <Link 
                  href={`/${locale}/journal/${nextPost.slug}`}
                  className="group flex items-center gap-4 p-6 bg-background rounded-2xl border border-border hover:shadow-xl transition-all duration-300 max-w-sm"
                >
                  <div className="text-right min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">Next Story</p>
                    <p className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {getLocalizedValue(nextPost.title, locale as 'en')}
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Related Gallery - Modern Design */}
        {(post as PayloadBlogPost).gallery && (
          <section className="relative">
            <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto py-16">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-12 text-center">
                Related Gallery
              </h2>
              <Link
                href={`/${locale}/galleries/${(post as PayloadBlogPost).gallery?.slug}`}
                className="group block bg-background rounded-3xl border border-border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="flex flex-col lg:flex-row">
                  {(post as PayloadBlogPost).gallery?.coverImage && (
                    <div className="lg:w-1/2 aspect-[16/10] lg:aspect-auto relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500"></div>
                      <OptimizedImage
                        {...getResponsiveImageProps((post as PayloadBlogPost).gallery?.coverImage as PayloadImage, 'gallery-card')}
                        alt={getLocalizedValue(((post as PayloadBlogPost).gallery?.coverImage as PayloadImage)?.alt, locale as 'en')}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                    <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                      {getLocalizedValue((post as PayloadBlogPost).gallery?.title, locale as 'en')}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      {getLocalizedValue((post as PayloadBlogPost).gallery?.description, locale as 'en')}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                        {(post as PayloadBlogPost).gallery?.imageCount} photographs
                      </span>
                      <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all duration-300">
                        View Gallery
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="relative">
            <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto py-16">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-12 text-center">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/${locale}/journal/${relatedPost.slug}`} className="group">
                    <article className="bg-background rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                        {relatedPost.featuredImage && typeof relatedPost.featuredImage === 'object' && 'imageUrls' in relatedPost.featuredImage ? (
                          <OptimizedImage
                            {...getResponsiveImageProps(relatedPost.featuredImage as PayloadImage, 'gallery-card')}
                            alt={getLocalizedValue((relatedPost.featuredImage as PayloadImage).alt, locale as 'en')}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <div className="w-12 h-12 mx-auto mb-2 opacity-40">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                </svg>
                              </div>
                              <p className="text-xs">{getLocalizedValue(relatedPost.title, locale as 'en')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span>{formatDate((relatedPost as any).publishedAt || relatedPost.createdAt, locale as 'en')}</span>
                          <span>•</span>
                          <span>{calculateReadingTime(getLocalizedValue(relatedPost.contentBlocks, locale as 'en'))}</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {getLocalizedValue(relatedPost.title, locale as 'en')}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {getLocalizedValue(relatedPost.excerpt, locale as 'en')}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getBlogPosts(100) // Get all posts for static generation
  return posts.map((post) => ({
    slug: post.slug,
  }))
}