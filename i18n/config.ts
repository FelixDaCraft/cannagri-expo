export const locales = ['fr', 'en', 'it', 'de', 'es'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  it: 'Italiano',
  de: 'Deutsch',
  es: 'Español',
}

// Using country codes for flag CDN
export const localeFlagCodes: Record<Locale, string> = {
  fr: 'fr',
  en: 'gb',
  it: 'it',
  de: 'de',
  es: 'es',
}
