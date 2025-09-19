import Link from 'next/link'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Card } from '@/components/ui/layout/card'
import { getTranslations } from 'next-intl/server'
import { getBlogPosts, getLocalizedValue } from '@/lib/api/api-client'
import { getSEOPersonalData } from '@/lib/utils/seo-helpers'
import type { PayloadBlogPost } from '@/lib/api/api-client'
import JournalClient from './JournalClient'
import type { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
interface JournalPageProps {
  params: Promise<{ locale: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: JournalPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('journal')
  
  // Get personal data from SiteMetadata
  const personalData = await getSEOPersonalData(locale as 'en')
  
  return {
    title: DERIVED_CONFIG.getPageTitle(t('title')),
    description: t('description', { name: personalData.name }),
    keywords: `photography blog, photography journal, ${personalData.name.toLowerCase()} journal, photography storytelling, travel photography stories`,
    authors: [{ name: personalData.name }],
    category: SITE_CONFIG.site.type.charAt(0).toUpperCase() + SITE_CONFIG.site.type.slice(1),
    publisher: SITE_CONFIG.site.name,
    openGraph: {
      title: DERIVED_CONFIG.getPageTitle(t('title')),
      description: t('description', { name: personalData.name }),
      type: 'website',
      siteName: SITE_CONFIG.site.name,
      images: [
        {
          url: `${SITE_CONFIG.url.base}/og-journal.jpg`,
          width: 1200,
          height: 630,
          alt: t('title'),
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: DERIVED_CONFIG.getPageTitle(t('title')),
      description: t('description', { name: personalData.name }),
      creator: SITE_CONFIG.social.twitter ? `@${SITE_CONFIG.social.twitter.split('/').pop()}` : undefined,
      images: [`${SITE_CONFIG.url.base}/og-journal.jpg`],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url.base}/${locale}/journal`,
      languages: {
        'en': `${SITE_CONFIG.url.base}/en/journal`,
        'ta': `${SITE_CONFIG.url.base}/ta/journal`,
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

export default async function JournalPage({ params }: JournalPageProps) {
  const { locale } = await params
  const t = await getTranslations('journal')

  // Get personal data for name placeholder
  const personalData = await getSEOPersonalData(locale as 'en')

  // Fetch blog posts from PayloadCMS
  const blogPosts = await getBlogPosts(20)
  
  // Extract unique categories from blog posts
  const allCategories = Array.from(
    new Set(blogPosts.flatMap(post => getLocalizedValue(post.tags, locale as 'en') || []))
  )
  const categories = ['All', ...allCategories.sort()]
  
  // Transform PayloadCMS data to match existing component structure
  const transformedBlogPosts = blogPosts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: getLocalizedValue(post.title, locale as 'en'),
    excerpt: getLocalizedValue(post.excerpt, locale as 'en'),
    coverImage: (post.featuredImage && typeof post.featuredImage === 'object' && 'imageUrls' in post.featuredImage) ? post.featuredImage.imageUrls?.medium || post.featuredImage.imageUrls?.full || '' : '',
    publishDate: (post as any).publishDate || post.createdAt,
    readTime: calculateReadTime((post as any).content?.[locale as 'en'] || ''),
    category: getLocalizedValue(post.tags, locale as 'en')?.[0] || 'General',
    tags: getLocalizedValue(post.tags, locale as 'en') || [],
    featured: false // We can add this field to PayloadCMS later if needed
  }))

// Simple reading time calculation
function calculateReadTime(content: any): string {
  if (!content) return '1 min read'
  
  // Convert Lexical content to plain text for word counting
  const textContent = typeof content === 'string' ? content : JSON.stringify(content)
  const wordCount = textContent.split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200)) // Average reading speed: 200 words/minute
  
  return `${readTime} min read`
}

  return (
    <div className="min-h-screen">
      {/* Full-width immersive header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-muted/30"></div>
        
        <div className="relative py-16 lg:py-20">
          <div className="px-6 lg:px-12 xl:px-16 max-w-[1600px] mx-auto">
            <div className="text-center mb-20">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 tracking-tight">
                {t('title')}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
                {t('description', { name: personalData.name })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journal Content Section */}
      <section className="relative">
        <div className="px-6 lg:px-12 xl:px-16 max-w-[1600px] mx-auto pt-12 lg:pt-16 pb-24">
          <JournalClient blogPosts={transformedBlogPosts} categories={categories} />
        </div>
      </section>

    </div>
  )
}