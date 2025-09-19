/**
 * Site Configuration
 * 
 * This file contains all site-specific configuration that should be
 * customized when using this template for different users.
 * 
 * TEMPLATE USERS: Update this file with your personal information
 */

// Personal Information
export const SITE_CONFIG = {
  // Personal Details - DEPRECATED: Use CMS Site Metadata instead
  // These are kept only for backward compatibility and technical fallbacks
  personal: {
    name: process.env.NEXT_PUBLIC_SITE_OWNER_NAME || '',
    fullName: process.env.NEXT_PUBLIC_SITE_OWNER_FULL_NAME || '',
    title: process.env.NEXT_PUBLIC_SITE_OWNER_TITLE || '',
    location: process.env.NEXT_PUBLIC_SITE_OWNER_LOCATION || '',
    email: process.env.NEXT_PUBLIC_SITE_OWNER_EMAIL || '',
  },

  // Site Metadata - DEPRECATED: Use CMS Site Metadata instead
  // These are kept only for backward compatibility and technical fallbacks
  site: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || '',
    title: process.env.NEXT_PUBLIC_SITE_TITLE || '',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
    shortDescription: process.env.NEXT_PUBLIC_SITE_SHORT_DESCRIPTION || '',
    keywords: process.env.NEXT_PUBLIC_SITE_KEYWORDS || '',
    type: process.env.NEXT_PUBLIC_SITE_TYPE || 'photography', // photography, portfolio, creative, business
  },

  // URLs and Domains
  url: {
    base: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    admin: process.env.NEXT_PUBLIC_ADMIN_URL || '/admin',
    api: process.env.NEXT_PUBLIC_API_URL || '/api',
  },

  // Database Configuration
  database: {
    name: process.env.DATABASE_NAME || 'portfolio-template',
    fallbackUri: process.env.DATABASE_FALLBACK_URI || 'mongodb://localhost:27017/portfolio-template',
  },

  // Internationalization
  i18n: {
    defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as 'en') || 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        enabled: process.env.NEXT_PUBLIC_ENABLE_ENGLISH !== 'false',
      },
      // Secondary locale removed for simplicity
      // Can be easily re-added by users if needed
    ].filter(locale => locale.enabled),
  },

  // Social Media - DEPRECATED: Use CMS Site Metadata instead
  // These are kept only for backward compatibility and technical fallbacks
  social: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
  },

  // Content Settings
  content: {
    // Show/hide sections
    showAboutPage: process.env.NEXT_PUBLIC_SHOW_ABOUT_PAGE !== 'false',
    showJournalSection: process.env.NEXT_PUBLIC_SHOW_JOURNAL !== 'false',
    showGearSection: process.env.NEXT_PUBLIC_SHOW_GEAR !== 'false',
    showContactSection: process.env.NEXT_PUBLIC_SHOW_CONTACT !== 'false',
    
    // Content limits
    maxImagesPerGallery: parseInt(process.env.NEXT_PUBLIC_MAX_IMAGES_PER_GALLERY || '50'),
    maxGalleriesOnHome: parseInt(process.env.NEXT_PUBLIC_MAX_GALLERIES_HOME || '6'),
    maxBlogPostsOnHome: parseInt(process.env.NEXT_PUBLIC_MAX_BLOG_POSTS_HOME || '3'),
  },

  // Theme and Styling
  theme: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || 'slate',
    fontSans: process.env.NEXT_PUBLIC_FONT_SANS || 'Inter',
    fontSerif: process.env.NEXT_PUBLIC_FONT_SERIF || 'Playfair Display',
    defaultTheme: (process.env.NEXT_PUBLIC_DEFAULT_THEME as 'light' | 'dark' | 'system') || 'system',
  },

  // Analytics Configuration
  analytics: {
    // Google Analytics 4
    ga4: {
      measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '',
      enabled: process.env.NEXT_PUBLIC_ENABLE_GA4 === 'true',
    },
    // Google Tag Manager (optional)
    gtm: {
      containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || '',
      enabled: process.env.NEXT_PUBLIC_ENABLE_GTM === 'true',
    },
    // Privacy settings
    privacy: {
      requireConsent: process.env.NEXT_PUBLIC_ANALYTICS_REQUIRE_CONSENT !== 'false',
      anonymizeIp: process.env.NEXT_PUBLIC_ANALYTICS_ANONYMIZE_IP !== 'false',
      cookieExpiryDays: parseInt(process.env.NEXT_PUBLIC_ANALYTICS_COOKIE_EXPIRY || '365'),
    },
    // Custom events configuration
    events: {
      trackPageViews: process.env.NEXT_PUBLIC_TRACK_PAGE_VIEWS !== 'false',
      trackPhotoViews: process.env.NEXT_PUBLIC_TRACK_PHOTO_VIEWS !== 'false',
      trackGalleryViews: process.env.NEXT_PUBLIC_TRACK_GALLERY_VIEWS !== 'false',
      trackFormSubmissions: process.env.NEXT_PUBLIC_TRACK_FORM_SUBMISSIONS !== 'false',
      trackSocialShares: process.env.NEXT_PUBLIC_TRACK_SOCIAL_SHARES !== 'false',
    },
  },

  // Features
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableSEO: process.env.NEXT_PUBLIC_ENABLE_SEO !== 'false',
    enableImageOptimization: process.env.NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION !== 'false',
    enablePreview: process.env.NEXT_PUBLIC_ENABLE_PREVIEW === 'true',
    enableHealthCheck: process.env.NEXT_PUBLIC_ENABLE_HEALTH_CHECK !== 'false',
  },

  // Legal Pages
  legal: {
    showPrivacyPolicy: process.env.NEXT_PUBLIC_SHOW_PRIVACY_POLICY !== 'false',
    showTermsOfService: process.env.NEXT_PUBLIC_SHOW_TERMS !== 'false',
    showImageRights: process.env.NEXT_PUBLIC_SHOW_IMAGE_RIGHTS !== 'false',
    copyrightYear: new Date().getFullYear(),
    // DEPRECATED: Use CMS Site Metadata legal.copyrightHolder instead
    copyrightHolder: process.env.NEXT_PUBLIC_COPYRIGHT_HOLDER || '',
  },
} as const

// Derived configurations - DEPRECATED: Use CMS data via getSiteMetadata() instead
// These functions are kept for backward compatibility and technical fallbacks only
export const DERIVED_CONFIG = {
  // Full site title with name - DEPRECATED
  get fullSiteTitle() {
    // Use empty values as CMS should be the primary source
    const name = SITE_CONFIG.personal.name || 'Portfolio'
    const title = SITE_CONFIG.site.title || 'Photography'
    return name && title ? `${name} - ${title}` : 'Photography Portfolio'
  },
  
  // Meta title for pages - DEPRECATED: Use generateMetadata with CMS data instead
  getPageTitle: (pageTitle?: string) => {
    const name = SITE_CONFIG.personal.name || 'Portfolio'
    const siteTitle = SITE_CONFIG.site.title || 'Photography'
    
    if (pageTitle && name && siteTitle) {
      const brandSuffix = SITE_CONFIG.personal.title 
        ? `${name} ${SITE_CONFIG.personal.title}`
        : `${name} ${siteTitle}`
      
      return `${pageTitle} | ${brandSuffix}`
    }
    
    // Fallback for empty config
    if (pageTitle) {
      return `${pageTitle} | Photography Portfolio`
    }
    
    return name && siteTitle ? `${name} - ${siteTitle}` : 'Photography Portfolio'
  },

  // Meta description with fallback - DEPRECATED
  getPageDescription: (description?: string) => 
    description || SITE_CONFIG.site.description || 'Professional photography portfolio',

  // Enabled locales only
  get enabledLocales() {
    return SITE_CONFIG.i18n.locales.filter(locale => locale.enabled)
  },

  // Social links (non-empty only) - DEPRECATED: Use CMS Site Metadata instead
  get enabledSocialLinks() {
    return Object.entries(SITE_CONFIG.social)
      .filter(([, url]) => url.trim() !== '')
      .map(([platform, url]) => ({ platform, url }))
  },
}

// Type exports for strict typing
export type Locale = (typeof SITE_CONFIG.i18n.locales)[0]['code']
export type Theme = typeof SITE_CONFIG.theme.defaultTheme
export type SiteType = typeof SITE_CONFIG.site.type

// Validation helper - Updated for CMS-first approach
export function validateSiteConfig() {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Personal data should now be empty (moved to CMS)
  if (SITE_CONFIG.personal.name && SITE_CONFIG.personal.name !== '') {
    warnings.push('NEXT_PUBLIC_SITE_OWNER_NAME is set but should be managed in CMS Site Metadata instead')
  }
  
  if (SITE_CONFIG.site.name && SITE_CONFIG.site.name !== '') {
    warnings.push('NEXT_PUBLIC_SITE_NAME is set but should be managed in CMS Site Metadata instead')
  }
  
  if (!SITE_CONFIG.url.base || SITE_CONFIG.url.base === 'http://localhost:3000') {
    warnings.push('Using default base URL. Set NEXT_PUBLIC_SERVER_URL for production.')
  }
  
  if (DERIVED_CONFIG.enabledLocales.length === 0) {
    errors.push('At least one locale must be enabled')
  }
  
  // Log warnings to console
  if (warnings.length > 0) {
    console.info('Site Configuration Warnings:', warnings)
  }
  
  return { errors, warnings }
}