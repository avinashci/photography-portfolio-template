import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import { SITE_CONFIG, DERIVED_CONFIG } from '@/config/site.config'
import Header from '@/components/frontend/layout/Header'
import Footer from '@/components/frontend/layout/Footer'
import AnalyticsProvider from '@/components/providers/AnalyticsProvider'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import ConsentManager from '@/components/analytics/ConsentManager'
import PerformanceMonitor from '@/components/analytics/PerformanceMonitor'
import BrowserCompatibilityWarning from '@/components/ui/base/BrowserCompatibilityWarning'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    title: DERIVED_CONFIG.fullSiteTitle,
    description: SITE_CONFIG.site.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `/${loc}`])
      ),
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider messages={messages}>
      <AnalyticsProvider>
        {/* 🎓 LEARNING: Analytics Integration */}
        {SITE_CONFIG.analytics.ga4.enabled && SITE_CONFIG.analytics.ga4.measurementId && (
          <GoogleAnalytics measurementId={SITE_CONFIG.analytics.ga4.measurementId} />
        )}
        <PerformanceMonitor />
        <ConsentManager />
        <BrowserCompatibilityWarning />

        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </AnalyticsProvider>
    </NextIntlClientProvider>
  )
}