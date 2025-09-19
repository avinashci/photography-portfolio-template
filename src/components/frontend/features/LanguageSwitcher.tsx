'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Languages, Check, Globe } from 'lucide-react'
import { Button } from '@/components/ui/base/button'
import { Badge } from '@/components/ui/base/badge'
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  // Keep for API compatibility
  isDarkMode?: boolean
}

export default function LanguageSwitcher({ isDarkMode }: LanguageSwitcherProps) {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocaleChange = (newLocale: Locale) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    
    router.push(newPath)
    setIsOpen(false)
  }

  // Get locale from useLocale hook, fallback to extracting from pathname
  let currentLocale = locale as Locale
  
  // Extract expected locale from pathname to compare
  const pathSegments = pathname.split('/')
  const expectedLocaleFromPath = pathSegments[1] as Locale
  
  // If useLocale() doesn't match the URL path, use the path locale instead
  if (expectedLocaleFromPath && locales.includes(expectedLocaleFromPath) && currentLocale !== expectedLocaleFromPath) {
    currentLocale = expectedLocaleFromPath
  }

  return (
    <div className="relative">
      {/* Current Language Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 px-3 transition-colors text-white/80 hover:text-white hover:bg-white/10"
        aria-label={t('switchLanguage')}
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
        <span className="text-sm font-medium">
          {localeNames[currentLocale]}
        </span>
      </Button>

      {/* Language Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[160px] bg-card border border-border rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
                {t('switchLanguage')}
              </div>
              
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    currentLocale === loc && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="text-base">{localeFlags[loc]}</span>
                  <span className="font-medium flex-1 text-left">
                    {localeNames[loc]}
                  </span>
                  {currentLocale === loc && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Footer with info */}
            <div className="border-t border-border p-2">
              <div className="text-xs text-muted-foreground px-2 py-1">
                {/* Tamil support temporarily disabled */}
                English only (Tamil support will be added later)
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Simple inline language switcher for mobile/compact spaces
export function CompactLanguageSwitcher({ isDarkMode }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = () => {
    const segments = pathname.split('/')
    const newLocale = locale === 'en' ? 'ta' : 'en'
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  // Get locale from useLocale hook, fallback to extracting from pathname
  let currentLocale = locale as Locale
  
  // Extract expected locale from pathname to compare
  const pathSegments = pathname.split('/')
  const expectedLocaleFromPath = pathSegments[1] as Locale
  
  // If useLocale() doesn't match the URL path, use the path locale instead
  if (expectedLocaleFromPath && locales.includes(expectedLocaleFromPath) && currentLocale !== expectedLocaleFromPath) {
    currentLocale = expectedLocaleFromPath
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLocaleChange}
      className="gap-1 px-2 transition-colors text-white/80 hover:text-white hover:bg-white/10"
      aria-label="Switch language"
    >
      <span className="text-base">{localeFlags[currentLocale]}</span>
      <span className="text-xs">
        {currentLocale.toUpperCase()}
      </span>
    </Button>
  )
}