import { defaultLocale, locales, type Locale } from '@/i18n/config'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}

/**
 * Langue du navigateur (en-tête Accept-Language) : la première langue proposée par le site,
 * dans l'ordre des préférences. Sans en-tête ou sans langue proposée : français (constat n°33).
 */
export function pickLocaleFromHeader(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale

  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';')
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
      const q = qParam ? Number(qParam.slice(2)) : 1
      return { code: tag.split('-')[0].toLowerCase(), q: Number.isFinite(q) ? q : 0, index }
    })
    .filter((lang) => lang.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)

  return ranked.find((lang) => isLocale(lang.code))?.code as Locale | undefined ?? defaultLocale
}

/** Choix explicite du visiteur (cookie du sélecteur de langue), sinon langue du navigateur */
export function resolveLocale(cookieValue: string | null | undefined, acceptLanguage: string | null | undefined): Locale {
  return isLocale(cookieValue) ? cookieValue : pickLocaleFromHeader(acceptLanguage)
}
