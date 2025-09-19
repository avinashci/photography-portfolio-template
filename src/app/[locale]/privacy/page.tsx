import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { DERIVED_CONFIG, SITE_CONFIG } from '@/config/site.config'

interface PrivacyPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params
  
  return {
    title: DERIVED_CONFIG.getPageTitle('Privacy Policy'),
    description: 'Privacy policy and data protection information',
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${SITE_CONFIG.url.base}/${locale}/privacy`,
      languages: {
        'en': `${SITE_CONFIG.url.base}/en/privacy`,
        'ta': `${SITE_CONFIG.url.base}/ta/privacy`,
      }
    }
  }
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params
  const t = await getTranslations('legal')
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Last updated: {new Date().toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-US')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly and automatically through your use of our website:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Contact form submissions (name, email, message)</li>
              <li>• Newsletter subscriptions (email address)</li>
              <li>• Website usage data via Google Analytics</li>
              <li>• Cookies for site functionality and preferences</li>
              <li>• IP addresses for security and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your information is used for:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Responding to inquiries and booking requests</li>
              <li>• Sending newsletters (with your consent)</li>
              <li>• Improving website performance and user experience</li>
              <li>• Analytics and understanding visitor behavior</li>
              <li>• Security and fraud prevention</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              3. Cookies and Tracking
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar technologies:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Essential cookies for website functionality</li>
              <li>• Google Analytics for usage statistics</li>
              <li>• Language and theme preferences</li>
              <li>• Session management</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can disable cookies in your browser settings, but this may affect site functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              4. Data Sharing and Third Parties
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell or share your personal information, except:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Google Analytics (anonymized usage data)</li>
              <li>• Email service provider for newsletters</li>
              <li>• When required by law or legal process</li>
              <li>• To protect our rights or safety</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              5. Data Security and Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• SSL encryption for data transmission</li>
              <li>• Secure hosting infrastructure</li>
              <li>• Regular security updates</li>
              <li>• Limited access to personal data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Data is retained only as long as necessary for the purposes outlined above.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              6. Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="text-muted-foreground space-y-2 ml-6">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate information</li>
              <li>• Delete your data (subject to legal requirements)</li>
              <li>• Unsubscribe from communications</li>
              <li>• Object to data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              7. Photography Sessions and Image Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For photography services, additional privacy considerations apply regarding image usage, model releases, and portfolio rights. These are covered in separate service agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
              8. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about this privacy policy or to exercise your rights, please contact us through the website contact form.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}