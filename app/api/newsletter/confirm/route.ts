import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'
import { confirmSubscription } from '@/lib/newsletter'

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`newsletter-confirm:${getClientIP(request)}`, RATE_LIMIT_PRESETS.API)
  if (!limit.success) return NextResponse.json({ status: 'too_many_requests' }, { status: 429 })

  const body = await request.json().catch(() => null)
  const status = await confirmSubscription(body?.token)
  return NextResponse.json({ status }, { status: status === 'confirmed' ? 200 : 400 })
}
