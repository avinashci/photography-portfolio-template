import { SITE_CONFIG } from '@/config/site.config'

// Generate dynamic locale config from site config
export const locales = ['en'] as const // Fallback for type safety (Tamil removed for now)
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = SITE_CONFIG.i18n.defaultLocale as Locale

// Dynamic generation at runtime
export const localeNames: Record<string, string> = Object.fromEntries(
  SITE_CONFIG.i18n.locales.map(locale => [locale.code, locale.name])
)

export const localeFlags: Record<string, string> = Object.fromEntries(
  SITE_CONFIG.i18n.locales.map(locale => [locale.code, locale.flag])
)

// Get actual enabled locales
export function getEnabledLocales(): string[] {
  return SITE_CONFIG.i18n.locales.map(locale => locale.code)
}