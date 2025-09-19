import { getSiteMetadata } from '@/lib/api/api-client'
import { SITE_CONFIG } from '@/config/site.config'

/**
 * Get personal data for SEO metadata - prioritizes SiteMetadata CMS over SITE_CONFIG
 */
export async function getSEOPersonalData(locale: 'en') {
  let siteMetadata
  try {
    siteMetadata = await getSiteMetadata(locale)
  } catch (error) {
    console.warn('Could not fetch site metadata for SEO, using config fallback')
    siteMetadata = null
  }

  return {
    name: siteMetadata?.personal?.name?.[locale] || SITE_CONFIG.personal.name,
    title: siteMetadata?.personal?.title?.[locale] || SITE_CONFIG.personal.title,
    location: siteMetadata?.personal?.location?.[locale] || SITE_CONFIG.personal.location,
    email: siteMetadata?.personal?.email || SITE_CONFIG.personal.email,
    bio: siteMetadata?.personal?.bio?.[locale] || null,
    avatar: siteMetadata?.personal?.avatar || null,
    // Legal defaults for copyright
    legal: {
      copyrightHolder: siteMetadata?.legal?.copyrightHolder?.[locale] || siteMetadata?.personal?.name?.[locale] || SITE_CONFIG.personal.name,
      copyrightYear: siteMetadata?.legal?.copyrightYear || new Date().getFullYear(),
      defaultLicense: siteMetadata?.legal?.defaultLicense || 'all-rights-reserved',
      defaultAttribution: siteMetadata?.legal?.defaultAttribution?.[locale] || null,
    }
  }
}

/**
 * Generate standardized author metadata for SEO
 */
export async function getSEOAuthor(locale: 'en') {
  const personalData = await getSEOPersonalData(locale)
  return {
    name: personalData.name,
    url: SITE_CONFIG.url.base,
  }
}

/**
 * Generate copyright text for images using SiteMetadata defaults
 */
export async function getDefaultCopyright(locale: 'en') {
  const personalData = await getSEOPersonalData(locale)
  const currentYear = new Date().getFullYear()
  return `© ${personalData.legal.copyrightYear !== currentYear ? `${personalData.legal.copyrightYear}-${currentYear}` : currentYear} ${personalData.legal.copyrightHolder}`
}