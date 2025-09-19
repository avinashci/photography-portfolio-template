'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/base/button'
import LanguageSwitcher from '../features/LanguageSwitcher'
import ThemeSwitcher from '../features/ThemeSwitcher'
import HeaderSearch from '../features/HeaderSearch'
import { cn } from '@/lib/utils'
import { getLocalizedValue } from '@/lib/utils/localization'

// Client-side settings fetcher to avoid PayloadCMS imports
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

export default function Header() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('navigation')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  
  // Check if we're on the homepage
  const isHomepage = pathname === `/${locale}` || pathname === '/'
  
  // Fetch settings
  useEffect(() => {
    const loadSettings = async () => {
      const settingsData = await fetchSettings(locale as 'en')
      setSettings(settingsData)
    }
    loadSettings()
  }, [locale])
  
  useEffect(() => {
    if (!isHomepage) return
    
    const handleScroll = () => {
      // Get the hero section height (assuming it's 100vh)
      const heroHeight = window.innerHeight
      const scrolled = window.scrollY > heroHeight * 0.8 // Start transition at 80% of hero
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial scroll position
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomepage])

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/galleries`, label: t('galleries') },
    { href: `/${locale}/journal`, label: t('journal') },
    { href: `/${locale}/about`, label: t('about') },
  ]

  // Dynamic nav background based on homepage and scroll position
  const getNavClassName = () => {
    if (!isHomepage) {
      // Non-homepage: static positioning with solid background
      return "relative bg-primary border-b border-white/10 transition-all duration-300"
    }
    if (isScrolled) {
      // Homepage scrolled past hero: fixed with solid background
      return "fixed top-0 left-0 right-0 z-50 bg-primary border-b border-white/10 transition-all duration-300"
    }
    // Homepage with hero visible: fixed and fully transparent
    return "fixed top-0 left-0 right-0 z-50 transition-all duration-300"
  }
  
  // Always use white text colors for navigation
  const getTextColorClass = () => {
    return "text-white" // Always white text
  }
  
  const getMutedTextColorClass = () => {
    return "text-white/70" // Always white muted text
  }
  
  const getHoverTextColorClass = () => {
    return "hover:text-white" // Always white hover
  }
  
  const getActiveTextColorClass = () => {
    return "text-white after:bg-white" // Always white active state
  }

  return (
    <nav className={getNavClassName()}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Branding */}
          <Link 
            href={`/${locale}`}
            className="px-3 transition-colors hover:bg-white/10 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-center gap-3">
              {/* Logo Image (if URL provided) */}
              {settings?.branding?.logoUrl ? (
                <img 
                  src={settings.branding.logoUrl}
                  alt={settings.branding.logoAlt || 'Logo'}
                  className="object-contain"
                  style={{ height: `${settings.branding.logoHeight || 40}px` }}
                />
              ) : (
                /* Text Fallback */
                <div className="text-right">
                  <div className={cn("font-serif text-lg font-bold transition-colors leading-tight", getTextColorClass(), getHoverTextColorClass())}>
                    {settings?.branding ? 
                      (getLocalizedValue(settings.branding.title, locale as 'en') || 'Portfolio') :
                      'Portfolio'
                    }
                  </div>
                  <div className={cn("font-serif text-sm font-medium transition-colors leading-tight", getMutedTextColorClass())}>
                    {settings?.branding ? 
                      (getLocalizedValue(settings.branding.subtitle, locale as 'en') || 'Photography') :
                      'Photography'
                    }
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:bg-white/10 rounded-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-3 py-2",
                  pathname === item.href
                    ? cn('after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5', getActiveTextColorClass())
                    : cn(getMutedTextColorClass(), getHoverTextColorClass())
                )}
              >
                {item.label}
              </Link>
            ))}
            <HeaderSearch />
            <ThemeSwitcher isDarkMode={true} />
            {/* <LanguageSwitcher isDarkMode={true} /> */}
          </div>

          {/* Mobile Navigation Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <HeaderSearch />
            <ThemeSwitcher isDarkMode={true} />
            {/* <LanguageSwitcher isDarkMode={true} /> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-current" />
              ) : (
                <Menu className="h-5 w-5 text-current" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  pathname === item.href 
                    ? cn(getActiveTextColorClass(), !isHomepage || isScrolled ? 'bg-white/10' : 'bg-primary/10')
                    : getMutedTextColorClass()
                )}
                asChild
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}