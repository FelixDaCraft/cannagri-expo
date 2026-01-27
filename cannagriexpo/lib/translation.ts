// Service de traduction automatique
// Utilise l'API Google Translate gratuite (non officielle) via translate.googleapis.com

const SUPPORTED_LOCALES = ['en', 'de', 'es', 'it'] as const
type TranslationLocale = typeof SUPPORTED_LOCALES[number]

export interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

/**
 * Traduit un texte du français vers une langue cible
 */
async function translateText(text: string, targetLang: TranslationLocale): Promise<string> {
  if (!text || text.trim() === '') {
    return ''
  }

  try {
    // Utiliser l'API gratuite de Google Translate
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.error(`Translation API error: ${response.status}`)
      return text // Retourner le texte original en cas d'erreur
    }

    const data = await response.json()

    // L'API retourne un tableau de tableaux, on reconstruit le texte
    if (data && data[0]) {
      const translatedParts = data[0]
        .filter((part: any) => part && part[0])
        .map((part: any) => part[0])

      return translatedParts.join('')
    }

    return text
  } catch (error) {
    console.error(`Translation error for ${targetLang}:`, error)
    return text // Retourner le texte original en cas d'erreur
  }
}

/**
 * Traduit un texte français vers toutes les langues supportées
 */
export async function translateToAllLanguages(frenchText: string): Promise<Translations> {
  if (!frenchText || frenchText.trim() === '') {
    return {}
  }

  const translations: Translations = {}

  // Traduire en parallèle vers toutes les langues
  const results = await Promise.allSettled(
    SUPPORTED_LOCALES.map(async (locale) => {
      const translated = await translateText(frenchText, locale)
      return { locale, translated }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { locale, translated } = result.value
      translations[locale] = translated
    }
  }

  return translations
}

/**
 * Obtient le texte traduit pour une locale donnée
 * Retourne le texte français si la traduction n'existe pas
 */
export function getTranslatedText(
  frenchText: string | null | undefined,
  translations: Translations | null | undefined,
  locale: string
): string {
  if (!frenchText) return ''

  // Si c'est du français, retourner le texte original
  if (locale === 'fr') {
    return frenchText
  }

  // Si des traductions existent et que la locale demandée est disponible
  if (translations && locale in translations) {
    const translated = translations[locale as TranslationLocale]
    if (translated && translated.trim() !== '') {
      return translated
    }
  }

  // Fallback vers le texte français
  return frenchText
}

/**
 * Met à jour une traduction spécifique
 */
export function updateTranslation(
  currentTranslations: Translations | null | undefined,
  locale: TranslationLocale,
  newText: string
): Translations {
  return {
    ...(currentTranslations || {}),
    [locale]: newText
  }
}
