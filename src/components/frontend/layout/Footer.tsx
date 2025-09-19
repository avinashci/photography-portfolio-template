'use client'

import Link from 'next/link'
import { useLocale, useTranslations, useFormatter } from 'next-intl'
import { useState, useEffect } from 'react'
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Camera, Palette, Globe } from 'lucide-react'
import { getLocalizedValue } from '@/lib/utils/localization'

// Client-side data fetchers
async function fetchSettings(locale: 'en') {
  try {
    const response = await fetch(`/api/globals/settings?locale=${locale}&depth=2`)
    if (!response.ok) throw new Error('Failed to fetch settings')
    return response.json()
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return null
  }
}

async function fetchSiteMetadata(locale: 'en') {
  try {
    const response = await fetch(`/api/globals/site-metadata?locale=${locale}&depth=2`)
    if (!response.ok) throw new Error('Failed to fetch site metadata')
    return response.json()
  } catch (error) {
    console.error('Failed to fetch site metadata:', error)
    return null
  }
}

export default function Footer() {
  const locale = useLocale()
  const t = useTranslations('navigation')
  const tFooter = useTranslations('footer')
  const format = useFormatter()
  const [settings, setSettings] = useState<any>(null)
  const [siteMetadata, setSiteMetadata] = useState<any>(null)

  // Fetch settings and site metadata
  useEffect(() => {
    const loadData = async () => {
      const [settingsData, metadataData] = await Promise.all([
        fetchSettings(locale as 'en'),
        fetchSiteMetadata(locale as 'en')
      ])
      setSettings(settingsData)
      setSiteMetadata(metadataData)
    }
    loadData()
  }, [locale])
  
  const currentYear = format.dateTime(new Date(), { year: 'numeric' })
  const copyrightText = settings?.footer?.copyrightStatement
    ? getLocalizedValue(settings.footer.copyrightStatement, locale as 'en')?.replace('{year}', currentYear)
    : tFooter('copyright', {
        year: currentYear,
        name: getLocalizedValue(siteMetadata?.personal?.name, locale as 'en') || 'Website Owner'
      })
  
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4" />
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'facebook': return <Facebook className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      case 'youtube': return <Youtube className="w-4 h-4" />
      case 'tiktok': return <Globe className="w-4 h-4" />
      case 'pinterest': return <Palette className="w-4 h-4" />
      case 'flickr': case 'behance': case 'fivehundredpx': case '500px': return <Camera className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }
  
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4">
        <div className="py-8">
          
          {/* Main Footer Content */}
          <div className="flex flex-col lg:flex-row justify-between items-start space-y-8 lg:space-y-0 mb-8">
            
            {/* Navigation Links */}
            <div className="flex flex-col space-y-4">
              <h3 className="font-serif text-lg font-semibold text-white mb-2">Navigation</h3>
              <div className="flex flex-col space-y-2">
                <Link href={`/${locale}/about`} className="text-white/70 hover:text-white transition-colors">{t('about')}</Link>
                <Link href={`/${locale}/galleries`} className="text-white/70 hover:text-white transition-colors">{t('galleries')}</Link>
                <Link href={`/${locale}/journal`} className="text-white/70 hover:text-white transition-colors">{t('journal')}</Link>
              </div>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-col space-y-4">
              <h3 className="font-serif text-lg font-semibold text-white mb-2">Legal</h3>
              <div className="flex flex-col space-y-2">
                {(!settings?.footer?.legalPages || settings.footer.legalPages.showTerms !== false) && (
                  <Link href={`/${locale}/terms`} className="text-white/70 hover:text-white transition-colors">Terms of Use</Link>
                )}
                {(!settings?.footer?.legalPages || settings.footer.legalPages.showPrivacy !== false) && (
                  <Link href={`/${locale}/privacy`} className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
                )}
                {(!settings?.footer?.legalPages || settings.footer.legalPages.showImageRights !== false) && (
                  <Link href={`/${locale}/image-rights`} className="text-white/70 hover:text-white transition-colors">Image Rights</Link>
                )}
              </div>
            </div>
            
            {/* Social Media */}
            {(!settings?.footer || settings.footer.showSocialMedia !== false) && settings?.social && (
              <div className="flex flex-col space-y-4">
                <h3 className="font-serif text-lg font-semibold text-white mb-2">Follow</h3>
                <div className="flex flex-col space-y-2">
                  {Object.entries(settings.social).map(([platform, url]: [string, any]) => {
                    // Skip empty URLs
                    if (!url) return null
                    
                    const icon = getSocialIcon(platform)
                    const displayName = platform === 'fiveHundredPx' ? '500px' : 
                                       platform.charAt(0).toUpperCase() + platform.slice(1)
                    
                    return (
                      <a 
                        key={platform}
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                      >
                        {icon}
                        <span>{displayName}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
            
          </div>
          
          {/* Copyright and Image Rights Notice */}
          <div className="border-t border-white/20 pt-6 space-y-3">
            <p className="text-white/70 text-sm text-center">
              {copyrightText}
            </p>
            {settings?.footer?.imageRightsNotice && (
              <p className="text-white/60 text-xs text-center max-w-2xl mx-auto">
                {getLocalizedValue(settings.footer.imageRightsNotice, locale as 'en')}
              </p>
            )}
          </div>
          
        </div>
      </div>
    </footer>
  )
}