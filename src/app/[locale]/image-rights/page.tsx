import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'
import { getSiteMetadata } from '@/lib/api/api-client'

interface ImageRightsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ImageRightsPageProps): Promise<Metadata> {
  const { locale } = await params
  
  return {
    title: DERIVED_CONFIG.getPageTitle('Image Rights & Licensing'),
    description: 'Image copyright, usage rights, and licensing information',
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${SITE_CONFIG.url.base}/${locale}/image-rights`,
      languages: {
        'en': `${SITE_CONFIG.url.base}/en/image-rights`,
        'ta': `${SITE_CONFIG.url.base}/ta/image-rights`,
      }
    }
  }
}

export default async function ImageRightsPage({ params }: ImageRightsPageProps) {
  const { locale } = await params
  const t = await getTranslations('legal')

  // Fetch site metadata for dynamic values
  const siteMetadata = await getSiteMetadata(locale)
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Image Rights & Licensing
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Understanding copyright, usage rights, and licensing for all photography
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Copyright Ownership
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All photographs displayed on this website and created during photography sessions are the exclusive intellectual property of {siteMetadata?.personal?.name?.[locale] || siteMetadata?.legal?.copyrightHolder || 'the website owner'}, protected under international copyright laws.
            </p>
            <div className="bg-secondary p-6 rounded-lg mb-4">
              <p className="text-foreground font-medium">
                © {new Date().getFullYear()} {siteMetadata?.personal?.name?.[locale] || siteMetadata?.legal?.copyrightHolder || 'Website Owner'}. All rights reserved.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Prohibited Uses
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The following uses are strictly prohibited without written permission:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Downloading or saving images from the website</li>
              <li>• Screenshot or screen recording of image galleries</li>
              <li>• Reproduction, distribution, or display of images</li>
              <li>• Editing, cropping, or modifying images</li>
              <li>• Using images for commercial purposes</li>
              <li>• Reverse image searching or using AI to recreate</li>
              <li>• Creating derivative works</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Permitted Uses
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Limited uses are permitted for:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Viewing images in your web browser</li>
              <li>• Sharing website links on social media</li>
              <li>• Referencing the photographer's work (with proper attribution)</li>
              <li>• Educational discussion about photography (fair use)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Licensing Options
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For legitimate use cases, the following licensing options are available:
            </p>
            
            <div className="space-y-6">
              <div className="border border-border p-6 rounded-lg">
                <h3 className="font-semibold text-foreground text-lg mb-2">Personal License</h3>
                <p className="text-muted-foreground mb-2">
                  For personal, non-commercial use such as home printing or personal social media.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Single-use license</li>
                  <li>• Print size limitations apply</li>
                  <li>• No commercial use</li>
                  <li>• Attribution required</li>
                </ul>
              </div>

              <div className="border border-border p-6 rounded-lg">
                <h3 className="font-semibold text-foreground text-lg mb-2">Commercial License</h3>
                <p className="text-muted-foreground mb-2">
                  For business use, marketing materials, publications, or commercial projects.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Specific usage rights defined</li>
                  <li>• Duration and territory limits</li>
                  <li>• Exclusivity options available</li>
                  <li>• Custom pricing based on usage</li>
                </ul>
              </div>

              <div className="border border-border p-6 rounded-lg">
                <h3 className="font-semibold text-foreground text-lg mb-2">Editorial License</h3>
                <p className="text-muted-foreground mb-2">
                  For newspapers, magazines, blogs, and journalistic purposes.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• News and editorial use only</li>
                  <li>• Time-sensitive pricing</li>
                  <li>• Attribution mandatory</li>
                  <li>• No commercial endorsement</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Image Watermarks and Protection
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Images displayed on this website may include:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Visible or invisible watermarks</li>
              <li>• Digital fingerprinting for tracking</li>
              <li>• Right-click protection</li>
              <li>• EXIF data for authenticity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Legal Enforcement
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Unauthorized use of images will result in:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• DMCA takedown notices</li>
              <li>• Legal action for copyright infringement</li>
              <li>• Statutory damages and legal fees</li>
              <li>• License fee enforcement (minimum 10x standard rate)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Request Licensing
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To request licensing for any image or discuss usage rights:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Contact us through the website form</li>
              <li>• Specify the intended use and duration</li>
              <li>• Include the specific image(s) of interest</li>
              <li>• Allow 48-72 hours for licensing quotes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              Client Photography Sessions
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For commissioned photography work, image rights and usage are defined in separate service agreements. Clients typically receive usage rights for personal use, while the photographer retains copyright and portfolio rights.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}