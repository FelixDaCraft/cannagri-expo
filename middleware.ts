import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Langues supportées par le site
const supportedLocales = ['fr', 'en', 'it', 'de', 'es']
const defaultLocale = 'en' // Fallback si la langue n'est pas supportée

// Fonction pour détecter la langue du navigateur
function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language')

  if (!acceptLanguage) {
    return defaultLocale
  }

  // Parser l'en-tête Accept-Language (ex: "fr-FR,fr;q=0.9,en;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=')
      return {
        code: code.split('-')[0].toLowerCase(), // Prendre juste le code langue (fr de fr-FR)
        q: qValue ? parseFloat(qValue) : 1.0
      }
    })
    .sort((a, b) => b.q - a.q) // Trier par préférence

  // Trouver la première langue supportée
  for (const lang of languages) {
    if (supportedLocales.includes(lang.code)) {
      return lang.code
    }
  }

  // Si aucune langue n'est supportée, utiliser l'anglais
  return defaultLocale
}

// Simple middleware that sets locale cookie without path rewriting
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get locale from cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value

  if (!localeCookie) {
    // Détecter la langue du navigateur
    const detectedLocale = getPreferredLocale(request)

    // Set detected locale cookie
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }

  return response
}

export const config = {
  matcher: [
    // Only match specific paths, not api or static files
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
}
