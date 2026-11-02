import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'
import { unsubscribe } from '@/lib/newsletter'

/**
 * Désinscription en un clic. Le jeton vient du corps JSON (page /newsletter/desinscription)
 * ou de l'adresse (en-têtes List-Unsubscribe / List-Unsubscribe-Post des messageries, RFC 8058).
 */
export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`newsletter-unsubscribe:${getClientIP(request)}`, RATE_LIMIT_PRESETS.API)
  if (!limit.success) return NextResponse.json({ status: 'too_many_requests' }, { status: 429 })

  const fromQuery = request.nextUrl.searchParams.get('token')
  const body = fromQuery ? null : await request.json().catch(() => null)
  const status = await unsubscribe(fromQuery ?? body?.token)
  return NextResponse.json({ status }, { status: status === 'unsubscribed' ? 200 : 400 })
}
