import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAboutPage, getCurrentGear, getSiteMetadata } from '@/lib/api/api-client'
import { getLocalizedValue } from '@/lib/utils/localization'
import OptimizedImage from '@/components/ui/base/OptimizedImage'
import RichTextRenderer from '@/components/ui/base/RichTextRenderer'
import { getResponsiveImageProps } from '@/lib/utils/image-utils'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  
  // Fetch all CMS data - prioritize SiteMetadata as primary source
  const [aboutData, siteMetadata] = await Promise.all([
    getAboutPage(),
    getSiteMetadata(locale as 'en').catch(() => null)
  ])
  
  // Extract SEO fields from About global (new!)
  const seo = aboutData?.seo || {}
  const customTitle = seo.metaTitle ? getLocalizedValue(seo.metaTitle as any, locale as 'en') : null
  const customDescription = seo.metaDescription ? getLocalizedValue(seo.metaDescription as any, locale as 'en') : null
  const seoKeywords = seo.keywords || []
  const customOgImage = seo.ogImage || null
  const canonicalUrl = seo.canonicalUrl || `${SITE_CONFIG.url.base}/${locale}/about`
  
  // Enhanced person schema data
  const schema = seo.schema || {}
  const customJobTitle = schema.jobTitle ? getLocalizedValue(schema.jobTitle as any, locale as 'en') : null
  const worksFor = schema.worksFor || null
  const alumniOf = schema.alumniOf || null
  const awards = schema.awards || []
  const languages = schema.knowsLanguage || []
  
  // Extract data from About page CMS
  const pageHeader = aboutData && 'header' in aboutData ? aboutData.header : null
  const heroBlock = aboutData && 'contentBlocks' in aboutData 
    ? aboutData.contentBlocks?.find((block: any) => block.blockType === 'heroSection')
    : null
  
  // Priority: About page content blocks > SiteMetadata > SITE_CONFIG
  const name = (heroBlock && heroBlock.blockType === 'heroSection' && heroBlock.name 
      ? getLocalizedValue(heroBlock.name, locale as 'en') : null)
    || pageHeader?.title 
    || siteMetadata?.personal?.name?.[locale as keyof typeof siteMetadata.personal.name]
    || SITE_CONFIG.personal.name
    
  const title = customJobTitle || (heroBlock && heroBlock.blockType === 'heroSection' && heroBlock.title
      ? getLocalizedValue(heroBlock.title, locale as 'en') : null)
    || pageHeader?.subtitle 
    || siteMetadata?.personal?.title?.[locale as keyof typeof siteMetadata.personal.title]
    || SITE_CONFIG.personal.title
    
  const location = (heroBlock && heroBlock.blockType === 'heroSection' && heroBlock.location
      ? getLocalizedValue(heroBlock.location, locale as 'en') : null) 
    || siteMetadata?.personal?.location?.[locale as keyof typeof siteMetadata.personal.location]
    || SITE_CONFIG.personal.location
  
  // Handle introduction - avoid redundant location text
  let introduction: string
  if (heroBlock && heroBlock.blockType === 'heroSection' && heroBlock.introduction) {
    // CMS has custom introduction - use as-is
    const richTextIntro = getLocalizedValue(heroBlock.introduction, locale as 'en')
    introduction = typeof richTextIntro === 'string' ? richTextIntro : richTextIntro?.toString() || ''
  } else {
    // Generate fallback introduction without location (since we'll add it separately if needed)
    introduction = `Learn about ${name}, a ${title.toLowerCase()}.`
  }
  
  // Build description - only add location if it's not already in introduction
  let autoDescription = introduction
  if (location && !introduction.toLowerCase().includes(location.toLowerCase())) {
    autoDescription = `${introduction} Based in ${location}.`
  }
  
  // Add professional credentials to description if available
  if (awards.length > 0) {
    autoDescription += ` Award-winning photographer with recognition including ${awards.slice(0, 2).join(', ')}.`
  }
  
  const profileImageUrl = (heroBlock && heroBlock.blockType === 'heroSection' && heroBlock.profileImage
      ? (typeof heroBlock.profileImage === 'string' ? heroBlock.profileImage : heroBlock.profileImage.imageUrls?.full)
      : null) 
    || pageHeader?.heroImage 
    || null

  // Build final metadata with SEO field priority
  const finalTitle = customTitle || `About ${name}`
  const finalDescription = customDescription || autoDescription
  const finalKeywords = seoKeywords.length > 0 ? seoKeywords.join(', ') : 
    `${name}, ${title.toLowerCase()}, ${SITE_CONFIG.site.type} photographer, about, biography, ${location?.toLowerCase()}`
  const finalOgImage = customOgImage || profileImageUrl
  
  return {
    title: DERIVED_CONFIG.getPageTitle(finalTitle),
    description: finalDescription,
    keywords: finalKeywords,
    authors: [{ name }],
    category: SITE_CONFIG.site.type.charAt(0).toUpperCase() + SITE_CONFIG.site.type.slice(1),
    publisher: SITE_CONFIG.site.name,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: 'profile',
      siteName: SITE_CONFIG.site.name,
      images: finalOgImage ? [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: `${name} - ${title}`,
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
        'en': `${SITE_CONFIG.url.base}/en/about`,
        'ta': `${SITE_CONFIG.url.base}/ta/about`,
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
    other: (() => {
      const otherMeta: { [key: string]: string } = {}
      if (worksFor) otherMeta['profile:works_for'] = worksFor
      if (alumniOf) otherMeta['profile:alumni_of'] = alumniOf
      if (languages.length > 0) otherMeta['profile:languages'] = languages.join(', ')
      return Object.keys(otherMeta).length > 0 ? otherMeta : undefined
    })(),
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations('about')

  // Fetch CMS data - include SiteMetadata for fallbacks
  const [aboutData, siteMetadata] = await Promise.all([
    getAboutPage(),
    getSiteMetadata(locale as 'en').catch(() => null)
  ])
  
  const gearLimit = (aboutData as any)?.gearSection?.maxGearItems || 12
  const currentGear = await getCurrentGear(gearLimit)

  // If no CMS data exists, show fallback message
  if (!aboutData) {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto">
          <div className="lg:px-12 xl:px-16 mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
              About Page
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              The about page content is being set up in the CMS. Please add content through the PayloadCMS admin panel.
            </p>
            <div className="bg-card p-8 rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">
                To get started, add an About entry in the PayloadCMS admin panel with:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
                <li>• Hero section information</li>
                <li>• Photography philosophy</li>
                <li>• Favorite locations</li>
                <li>• Technical skills</li>
                <li>• Personal mission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Extract data from Page Header or Hero Section block
  const heroBlockData = aboutData && 'contentBlocks' in aboutData 
    ? aboutData.contentBlocks?.find((block: any) => block.blockType === 'heroSection')
    : null
  const pageHeader = aboutData && 'header' in aboutData ? aboutData.header : null
  
  // Use Page Header data first, then fall back to hero block
  const heroName = pageHeader?.title || (heroBlockData && heroBlockData.blockType === 'heroSection' ? heroBlockData.name : null) || null
  const heroTitle = pageHeader?.subtitle || (heroBlockData && heroBlockData.blockType === 'heroSection' ? heroBlockData.title : null) || null
  const heroLocation = heroBlockData && heroBlockData.blockType === 'heroSection' ? heroBlockData.location : null
  const heroIntroduction = heroBlockData && heroBlockData.blockType === 'heroSection' ? heroBlockData.introduction : null
  const heroImageUrl = pageHeader?.heroImage || (heroBlockData && heroBlockData.blockType === 'heroSection' 
    ? (typeof heroBlockData.profileImage === 'string' ? heroBlockData.profileImage : heroBlockData.profileImage?.imageUrls?.full)
    : null) || null

  // Generate structured data from CMS content
  const socialLinksBlock = aboutData && 'contentBlocks' in aboutData 
    ? aboutData.contentBlocks?.find((block: any) => block.blockType === 'socialLinks')
    : null
  const skillsBlocks = aboutData && 'contentBlocks' in aboutData 
    ? aboutData.contentBlocks?.filter((block: any) => block.blockType === 'skillsList') || []
    : []
  
  // Extract data for structured markup - prioritize About page > SiteMetadata > SITE_CONFIG
  const structuredName = heroName || pageHeader?.title || 
    siteMetadata?.personal?.name?.[locale as keyof typeof siteMetadata.personal.name] || 
    SITE_CONFIG.personal.name
  const structuredTitle = heroTitle || pageHeader?.subtitle || 
    siteMetadata?.personal?.title?.[locale as keyof typeof siteMetadata.personal.title] || 
    SITE_CONFIG.personal.title
  const structuredIntro = heroIntroduction || 
    (siteMetadata?.personal?.bio?.[locale as keyof typeof siteMetadata.personal.bio] ? 
     `Professional ${SITE_CONFIG.site.type} and visual storyteller` : 
     `Professional ${SITE_CONFIG.site.type} and visual storyteller`)
  const structuredLocation = heroLocation || 
    siteMetadata?.personal?.location?.[locale as keyof typeof siteMetadata.personal.location] || 
    SITE_CONFIG.personal.location
  
  const structuredData = (heroBlockData || pageHeader) ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": structuredName,
    "alternateName": structuredName,
    "jobTitle": structuredTitle.includes(' & ') ? structuredTitle.split(' & ') : [structuredTitle],
    "description": structuredIntro,
    "url": SITE_CONFIG.url.base,
    "sameAs": (socialLinksBlock && socialLinksBlock.blockType === 'socialLinks' ? socialLinksBlock.links?.map((link: any) => link.url) : null) || DERIVED_CONFIG.enabledSocialLinks.map(link => link.url),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": structuredLocation ? structuredLocation.split(',')[0]?.trim() : null,
      "addressRegion": structuredLocation ? structuredLocation.split(',')[1]?.trim() || "California" : "California",
      "addressCountry": "US"
    },
    "knowsAbout": skillsBlocks.flatMap((block: any) => 
      block.skills?.map((skill: any) => skill.name) || []
    ).concat([SITE_CONFIG.site.type.charAt(0).toUpperCase() + SITE_CONFIG.site.type.slice(1), 'Visual Storytelling']),
    "hasOccupation": {
      "@type": "Occupation",
      "name": structuredTitle
    }
  } : null

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      <div className="min-h-screen bg-background">
        {/* Hero Section - Show if page header or hero block exists */}
        {(pageHeader || heroBlockData) && (
          <section className="relative py-20 bg-gradient-to-br from-secondary/5 via-primary/5 to-accent/5 backdrop-blur-sm">
            <div className="absolute inset-0 bg-background/40"></div>
            <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto relative z-10">
              <div className="max-w-7xl mx-auto">
                <div className={`grid gap-16 items-center ${
                  heroBlockData && heroBlockData.blockType === 'heroSection' && heroBlockData.layout === 'image-left' ? 'lg:grid-cols-2' :
                  heroBlockData && heroBlockData.blockType === 'heroSection' && heroBlockData.layout === 'image-right' ? 'lg:grid-cols-2' :
                  heroBlockData && heroBlockData.blockType === 'heroSection' && heroBlockData.layout === 'centered' ? 'grid-cols-1 text-center' :
                  'lg:grid-cols-2'
                }`}>
                  
                  {/* Profile Content */}
                  <div className={`space-y-8 ${
                    heroBlockData && heroBlockData.blockType === 'heroSection' && heroBlockData.layout === 'image-left' ? 'lg:order-2' :
                    heroBlockData && heroBlockData.blockType === 'heroSection' && heroBlockData.layout === 'centered' ? 'max-w-4xl mx-auto text-center' :
                    'text-center'
                  }`}>
                    <div>
                      {heroName && (
                        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                          {heroName}
                        </h1>
                      )}
                      {heroTitle && (
                        <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                          {heroTitle}
                        </p>
                      )}
                      {heroLocation && (
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Based in {heroLocation}
                        </p>
                      )}
                    </div>
                    
                    {heroIntroduction && (
                      <div className="space-y-6">
                        <div className="text-lg text-foreground leading-relaxed">
                          <RichTextRenderer content={heroIntroduction} />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link
                        href={`/${locale}/galleries`}
                        className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        View My Work
                      </Link>
                      <Link
                        href={`/${locale}/journal`}
                        className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary/10 transition-colors"
                      >
                        Read My Stories
                      </Link>
                    </div>
                  </div>
                  
                  {/* Profile Image - only show if not centered layout */}
                  {!(heroBlockData && heroBlockData.blockType === 'heroSection' && heroBlockData.layout === 'centered') && (
                    <div className={`relative ${
                      heroBlockData && heroBlockData.blockType === 'heroSection' && heroBlockData.layout === 'image-left' ? 'lg:order-1' : ''
                    }`}>
                      <div className="aspect-[4/5] bg-muted rounded-2xl overflow-hidden border border-border shadow-xl">
                        {(heroBlockData && heroBlockData.blockType === 'heroSection' ? heroBlockData.profileImage : null) || heroImageUrl ? (
                          <img 
                            src={heroImageUrl || 
                              (heroBlockData && heroBlockData.blockType === 'heroSection' && heroBlockData.profileImage
                                ? (typeof heroBlockData.profileImage === 'string' 
                                  ? heroBlockData.profileImage 
                                  : (heroBlockData.profileImage as any)?.imageUrls?.full)
                                : '')}
                            alt={heroName || 'Profile'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <div className="w-24 h-24 mx-auto mb-4 opacity-40">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                              </div>
                              <p className="text-sm">Professional Portrait</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Flexible Content Blocks */}
        {aboutData && 'contentBlocks' in aboutData && aboutData.contentBlocks && aboutData.contentBlocks.length > 0 && (
          <section className="py-20">
            <div className="px-6 lg:px-12 xl:px-16 max-w-[1600px] mx-auto">
              <div className="max-w-7xl mx-auto space-y-16">
                {(() => {
                  const nonHeroBlocks = (aboutData && 'contentBlocks' in aboutData ? aboutData.contentBlocks : []).filter((block: any) => block.blockType !== 'heroSection')
                  const groupedBlocks: any[][] = []
                  let currentGroup: any[] = []
                  
                  // Group consecutive textParagraph blocks together
                  nonHeroBlocks.forEach((block: any) => {
                    if (block.blockType === 'textParagraph') {
                      currentGroup.push(block)
                    } else {
                      if (currentGroup.length > 0) {
                        groupedBlocks.push(currentGroup)
                        currentGroup = []
                      }
                      groupedBlocks.push([block])
                    }
                  })
                  
                  // Don't forget the last group
                  if (currentGroup.length > 0) {
                    groupedBlocks.push(currentGroup)
                  }
                  
                  return groupedBlocks.map((group: any[], groupIndex: number) => {
                    // Debug: log block types to console
                    if (typeof window !== 'undefined') {
                      console.log('Group', groupIndex, 'blocks:', group.map(b => b.blockType))
                    }
                    
                    if (group.length > 1 && group.every((block: any) => block.blockType === 'textParagraph')) {
                      // Multiple text paragraphs - render in one card
                      return (
                        <div key={groupIndex} className="bg-card rounded-2xl p-8 border border-border">
                          <div className="space-y-6">
                            {group.map((block: any, blockIndex: number) => (
                              <div key={blockIndex} className={`${block.style === 'centered' ? 'text-center' : ''} ${block.style === 'narrow' ? 'max-w-4xl mx-auto' : ''}`}>
                                {block.title && (
                                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    {getLocalizedValue(block.title, locale as 'en')}
                                  </h2>
                                )}
                                <div className={`text-foreground leading-relaxed ${block.style === 'large' ? 'text-lg md:text-xl' : ''} ${blockIndex < group.length - 1 ? 'mb-6' : ''}`}>
                                  <RichTextRenderer content={getLocalizedValue(block.content, locale as 'en')} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    } else {
                      // Single block - render normally
                      const block = group[0]
                      return (
                        <div key={groupIndex} className={block.blockType === 'spacer' ? '' : 'bg-card rounded-2xl p-8 border border-border'}>
                          {/* Text Paragraph Block */}
                          {block.blockType === 'textParagraph' && (
                            <div className={`space-y-6 ${block.style === 'centered' ? 'text-center' : ''} ${block.style === 'narrow' ? 'max-w-4xl mx-auto' : ''}`}>
                              {block.title && (
                                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                                  {getLocalizedValue(block.title, locale as 'en')}
                                </h2>
                              )}
                              <div className={`text-foreground leading-relaxed ${block.style === 'large' ? 'text-lg md:text-xl' : ''}`}>
                                <RichTextRenderer content={getLocalizedValue(block.content, locale as 'en')} />
                              </div>
                            </div>
                          )}
                      
                      {/* Quote Block */}
                      {block.blockType === 'quoteBlock' && (
                        <div className="text-center space-y-6">
                          <blockquote className={`italic border-l-4 border-primary pl-6 ${block.style === 'large' ? 'text-xl md:text-2xl' : 'text-lg'} text-muted-foreground`}>
                            "{getLocalizedValue(block.quote, locale as 'en')}"
                          </blockquote>
                          {block.author && (
                            <cite className="text-sm text-muted-foreground not-italic">
                              — {getLocalizedValue(block.author, locale as 'en')}
                            </cite>
                          )}
                        </div>
                      )}
                      
                      {/* Skills List Block */}
                      {block.blockType === 'skillsList' && (
                        <div className="space-y-6">
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                            {getLocalizedValue(block.title, locale as 'en')}
                          </h2>
                          {block.description && (
                            <p className="text-muted-foreground">
                              {getLocalizedValue(block.description, locale as 'en')}
                            </p>
                          )}
                          <div className={`${
                            block.layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
                            block.layout === 'list' ? 'space-y-3' :
                            block.layout === 'inline' ? 'flex flex-wrap gap-3' :
                            'flex flex-wrap gap-2'
                          }`}>
                            {block.skills?.map((skill: any, skillIndex: number) => (
                              <div key={skillIndex} className={`${
                                block.layout === 'tags' ? 'px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium' :
                                block.layout === 'grid' || block.layout === 'list' ? 'space-y-1' :
                                'px-3 py-1 bg-muted text-muted-foreground rounded-lg text-sm'
                              }`}>
                                <div className="font-semibold text-foreground">{skill.name}</div>
                                {skill.description && block.layout !== 'tags' && (
                                  <div className="text-sm text-muted-foreground">{skill.description}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                          {/* Image Block */}
                          {block.blockType === 'imageBlock' && (
                            <div className={`space-y-4 ${block.alignment === 'center' ? 'text-center' : block.alignment === 'right' ? 'text-right' : ''}`}>
                              {block.image ? (
                                <>
                                  <div className={`inline-block ${
                                    block.size === 'small' ? 'max-w-sm' :
                                    block.size === 'medium' ? 'max-w-md' :
                                    block.size === 'large' ? 'max-w-2xl' :
                                    'w-full'
                                  }`}>
                                    <img
                                      src={(block.image as any)?.imageUrls?.full || ''}
                                      alt={block.caption ? getLocalizedValue(block.caption, locale as 'en') : 'About image'}
                                      className="w-full h-auto rounded-lg"
                                    />
                                  </div>
                                  {block.caption && (
                                    <p className="text-sm text-muted-foreground italic">
                                      {getLocalizedValue(block.caption, locale as 'en')}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <div className="bg-muted rounded-lg p-8 text-center text-muted-foreground">
                                  <div className="w-16 h-16 mx-auto mb-4 opacity-40">
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3l2.5 3.5L15 8.5l3 4.5H6l3-4z"/>
                                    </svg>
                                  </div>
                                  <p>Image Block (No image selected)</p>
                                  {block.caption && (
                                    <p className="text-sm mt-2 italic">
                                      Caption: {getLocalizedValue(block.caption, locale as 'en')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                      
                      {/* Text + Image Block */}
                      {block.blockType === 'textImageBlock' && (
                        <div className={`grid gap-8 ${
                          block.layout === 'image-left' || block.layout === 'image-right' ? 'md:grid-cols-2' : 'grid-cols-1'
                        } items-center`}>
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
                              <img
                                src={(block.image as any)?.imageUrls?.full || ''}
                                alt={block.title ? getLocalizedValue(block.title, locale as 'en') : 'About image'}
                                className="w-full h-auto rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Gallery Showcase Block */}
                      {block.blockType === 'galleryShowcase' && block.gallery && (
                        <div className="space-y-8">
                          {block.title && (
                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground text-center">
                              {getLocalizedValue(block.title, locale as 'en')}
                            </h2>
                          )}
                          {block.description && (
                            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                              {getLocalizedValue(block.description, locale as 'en')}
                            </p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {block.gallery.images?.slice(0, block.maxImages || 6).map((image: any) => (
                              <Link key={image.id} href={`/${locale}/galleries/${block.gallery.slug}`}>
                                <div className="aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer">
                                  <img
                                    src={(image as any)?.imageUrls?.full || ''}
                                    alt={getLocalizedValue(image.title, locale as 'en') || 'Gallery image'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              </Link>
                            ))}
                          </div>
                          {block.showGalleryLink && (
                            <div className="text-center">
                              <Link
                                href={`/${locale}/galleries/${block.gallery.slug}`}
                                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                              >
                                View Full Gallery
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Social Links Block */}
                      {block.blockType === 'socialLinks' && block.links && block.links.length > 0 && (
                        <div className="text-center space-y-6">
                          {block.title && (
                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                              {getLocalizedValue(block.title, locale as 'en')}
                            </h2>
                          )}
                          {block.description && (
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                              {getLocalizedValue(block.description, locale as 'en')}
                            </p>
                          )}
                          <div className={`flex flex-wrap gap-3 justify-center ${
                            block.style === 'list' ? 'flex-col items-center' : ''
                          }`}>
                            {block.links.map((link: any, linkIndex: number) => (
                              <a
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                                  block.style === 'buttons' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
                                  block.style === 'list' ? 'text-primary hover:underline' :
                                  'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                              >
                                {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                {link.username && <span className="text-muted-foreground">@{link.username}</span>}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                          {/* Spacer Block */}
                          {block.blockType === 'spacer' && (
                            <div className={`${
                              block.size === 'small' ? 'py-4' :
                              block.size === 'medium' ? 'py-8' :
                              block.size === 'large' ? 'py-12' :
                              block.size === 'xl' ? 'py-16' :
                              'py-8'
                            } ${block.showDivider ? 'border-t border-border' : ''}`} />
                          )}
                        </div>
                      )
                    }
                  })
                })()}
              </div>
            </div>
        </section>
        )}

        {/* Current Gear Section */}
        {currentGear && currentGear.length > 0 && (aboutData as any)?.gearSection?.showGearSection !== false && (
          <section className="py-20 bg-gradient-to-br from-secondary/5 via-primary/5 to-accent/5">
            <div className="px-6 lg:px-12 xl:px-16 max-w-[1400px] mx-auto">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                    {getLocalizedValue((aboutData as any)?.gearSection?.gearTitle, locale as 'en') || 'My Photography Gear'}
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {getLocalizedValue((aboutData as any)?.gearSection?.gearDescription, locale as 'en') || 'The tools that help me capture and create the images I share with the world.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentGear.map((gear: any) => (
                    <div key={gear.id} className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                      <div className="mb-4">
                        <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                          {gear.category.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </div>
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                          {getLocalizedValue(gear.name, locale as 'en')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {gear.brand} {gear.model}
                        </p>
                      </div>
                      
                      {gear.description && (
                        <div className="text-foreground text-sm leading-relaxed mb-4">
                          <RichTextRenderer content={getLocalizedValue(gear.description, locale as 'en')} />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        {gear.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < gear.rating ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}