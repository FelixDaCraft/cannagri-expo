import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { HONEYPOT_FIELD } from '@/lib/checkout'
import { parseNewsletterEmail, parseSource, requestSubscription } from '@/lib/newsletter'
import { locales } from '@/i18n/config'

// 5 demandes par IP toutes les 10 minutes, 3 par adresse e-mail et par heure
const PER_IP = { limit: 5, windowSeconds: 10 * 60 }
const PER_EMAIL = { limit: 3, windowSeconds: 60 * 60 }

// Même réponse que l'adresse soit nouvelle, en attente ou déjà inscrite (aucune fuite d'information)
const NEUTRAL = { success: true }

function tooMany(resetAt: number) {
  return NextResponse.json(
    { error: 'too_many_requests' },
    { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))) } }
  )
}

export async function POST(request: NextRequest) {
  const ipLimit = checkRateLimit(`newsletter:${getClientIP(request)}`, PER_IP)
  if (!ipLimit.success) return tooMany(ipLimit.resetAt)

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'invalid_request' }, { status: 400 })

  // Robot : réponse normale, rien n'est enregistré
  const honeypot = body[HONEYPOT_FIELD]
  if (typeof honeypot === 'string' ? honeypot.trim() !== '' : honeypot != null) return NextResponse.json(NEUTRAL)

  if (body.consent !== true) return NextResponse.json({ error: 'consent_required' }, { status: 400 })
  const email = parseNewsletterEmail(body.email)
  if (!email) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })

  const emailLimit = checkRateLimit(`newsletter-email:${email}`, PER_EMAIL)
  if (!emailLimit.success) return tooMany(emailLimit.resetAt)

  const locale = (locales as readonly string[]).includes(body.locale) ? body.locale : null
  try {
    await requestSubscription({ email, source: parseSource(body.source), locale })
  } catch (error) {
    console.error('Newsletter : inscription impossible', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
  return NextResponse.json(NEUTRAL)
}
