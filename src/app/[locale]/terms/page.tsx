import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
import { getSiteMetadata } from '@/lib/api/api-client'

interface TermsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params
  
  return {
    title: DERIVED_CONFIG.getPageTitle('Terms of Use'),
    description: 'Terms of use for website and photography services',
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${SITE_CONFIG.url.base}/${locale}/terms`,
      languages: {
        'en': `${SITE_CONFIG.url.base}/en/terms`,
        'ta': `${SITE_CONFIG.url.base}/ta/terms`,
      }
    }
  }
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params
  const t = await getTranslations('legal')

  // Fetch site metadata for dynamic values
  const siteMetadata = await getSiteMetadata(locale)
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Terms of Use
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Last updated: {new Date().toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-US')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              1. Image Copyright and Usage Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All photographs displayed on this website are the exclusive property of {siteMetadata?.personal?.name?.[locale] || siteMetadata?.legal?.copyrightHolder || 'the website owner'} and are protected by copyright laws. Unauthorized downloading, copying, reproduction, or distribution of any images is strictly prohibited.
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Personal use of images requires written permission</li>
              <li>• Commercial use requires a licensing agreement</li>
              <li>• Screenshots for social sharing are permitted with proper attribution</li>
              <li>• Images may not be edited or modified without consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              2. Photography Services
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Terms for photography services and bookings:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• 50% deposit required to secure booking</li>
              <li>• 48-hour cancellation policy applies</li>
              <li>• Weather-related rescheduling available</li>
              <li>• Delivery timeline: 2-4 weeks for edited images</li>
              <li>• Usage rights transferred upon full payment</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              3. Website Usage
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By using this website, you agree to:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Not attempt to scrape or download images in bulk</li>
              <li>• Respect intellectual property rights</li>
              <li>• Use the contact form for legitimate inquiries only</li>
              <li>• Not use the site for any unlawful purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              4. Liability and Disclaimers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              While every effort is made to ensure accuracy, the photographer is not liable for any damages resulting from the use of information or images on this website. Photography services are subject to separate contract terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              5. Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For licensing inquiries, usage permissions, or questions about these terms, please contact us through the website contact form.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}