import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
import { getSEOPersonalData } from '@/lib/utils/seo-helpers'

const SearchClient = dynamic(() => import('./SearchClient'), {
  loading: () => (
    <div className="container mx-auto px-4 py-12">
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-muted rounded-lg w-full max-w-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params
  
  // Fetch personal data for SEO
  const personalData = await getSEOPersonalData(locale as 'en')
  
  const title = locale === 'ta' ? 'தேடல்' : 'Search'
  const description = locale === 'ta' ? 
    'எனது ஃபோட்டோகிராஃபி போர்ட்போலியோவில் கேலரிகள், படங்கள் மற்றும் பதிவுகளைத் தேடுங்கள்' :
    'Search through my photography portfolio for galleries, images, and journal entries'

  return {
    title: DERIVED_CONFIG.getPageTitle(title),
    description,
    keywords: `search, ${SITE_CONFIG.site.type}, portfolio, galleries, photography, ${personalData.title.toLowerCase()}`,
    authors: [{ name: personalData.name }],
    category: SITE_CONFIG.site.type.charAt(0).toUpperCase() + SITE_CONFIG.site.type.slice(1),
    publisher: SITE_CONFIG.site.name,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: SITE_CONFIG.site.name,
    },
    twitter: {
      card: 'summary',
      title: `${title} - ${SITE_CONFIG.site.name}`,
      description,
      creator: SITE_CONFIG.social.twitter ? `@${SITE_CONFIG.social.twitter.split('/').pop()}` : undefined,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url.base}/${locale}/search`,
      languages: {
        'en': `${SITE_CONFIG.url.base}/en/search`,
        'ta': `${SITE_CONFIG.url.base}/ta/search`,
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

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const t = await getTranslations('search')
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {locale === 'ta' ? 'தேடல்' : 'Search'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ta' ? 
              'எனது ஃபோட்டோகிராஃபி போர்ட்போலியோவில் கேலரிகள், படங்கள் மற்றும் பதிவுகளைத் தேடுங்கள்' :
              'Search through my photography portfolio for galleries, images, and journal entries'
            }
          </p>
        </div>

        {/* Search Component */}
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        }>
          <SearchClient 
            locale={locale as 'en'} 
            initialQuery={typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : ''}
          />
        </Suspense>
      </div>
    </div>
  )
}