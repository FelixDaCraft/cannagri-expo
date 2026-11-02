import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAllowedOrigins, isAllowedOrigin } from '@/lib/allowed-origin'

// Security headers for all responses
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Allowed origins for CSRF protection (comparaison exacte, voir lib/allowed-origin)
const ALLOWED_ORIGINS = getAllowedOrigins()

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
  return isAllowedOrigin(request.headers.get('origin'), request.headers.get('referer'), ALLOWED_ORIGINS)
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

  // La langue est résolue à chaque requête (i18n/request.ts) : pas de cookie posé ici,
  // le cookie NEXT_LOCALE ne traduit que le choix explicite du visiteur

  return response
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
}
