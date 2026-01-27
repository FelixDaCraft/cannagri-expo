import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers for all responses
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Allowed origins for CSRF protection
const ALLOWED_ORIGINS = [
  'https://cannagri-expo.eu',
  'https://www.cannagri-expo.eu',
  'https://dev.cannagri-expo.eu',
  'http://localhost:3000',
]

// API routes that should verify origin (POST/PUT/DELETE requests)
// Exclude webhook endpoints that receive external requests
const PROTECTED_API_ROUTES = [
  '/api/auth/',
  '/api/payment/checkout',
  '/api/payment/verify',
  '/api/admin/',
  '/api/contact',
  '/api/newsletter',
]

// Routes that receive external webhooks (exempt from origin check)
const WEBHOOK_ROUTES = [
  '/api/payment/webhook',
]

/**
 * Verify that the request origin is allowed (CSRF protection)
 */
function verifyOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Allow requests without origin (same-origin requests, curl, etc.)
  if (!origin && !referer) {
    return true
  }

  // Check if origin is in allowed list
  if (origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    return true
  }

  // Check referer if origin is not set
  if (!origin && referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))) {
    return true
  }

  return false
}

/**
 * Check if route needs CSRF protection
 */
function needsCsrfProtection(request: NextRequest): boolean {
  // Only check mutating methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return false
  }

  const pathname = request.nextUrl.pathname

  // Exclude webhook routes
  if (WEBHOOK_ROUTES.some(route => pathname.startsWith(route))) {
    return false
  }

  // Check if it's a protected API route
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))
}

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

// Middleware with security headers, CSRF protection, and locale handling
export function middleware(request: NextRequest) {
  // CSRF Protection: Check origin for protected API routes
  if (needsCsrfProtection(request)) {
    if (!verifyOrigin(request)) {
      console.warn(`[CSRF] Blocked request from unauthorized origin: ${request.headers.get('origin') || request.headers.get('referer')}`)
      return NextResponse.json(
        { error: 'Forbidden - Invalid origin' },
        { status: 403 }
      )
    }
  }

  const response = NextResponse.next()

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add HSTS header for HTTPS connections
  if (request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

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
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
}
