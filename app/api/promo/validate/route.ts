import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(`promo:${clientIP}`, RATE_LIMIT_PRESETS.PAYMENT)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const { code, standPriceHT } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      )
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    })

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Code promo invalide' },
        { status: 404 }
      )
    }

    if (!promoCode.isActive) {
      return NextResponse.json(
        { error: 'Ce code promo n\'est plus actif' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      return NextResponse.json(
        { error: 'Ce code promo a expiré ou n\'est pas encore valide' },
        { status: 400 }
      )
    }

    if (promoCode.maxUses !== null && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { error: 'Ce code promo a atteint sa limite d\'utilisation' },
        { status: 400 }
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (standPriceHT && typeof standPriceHT === 'number') {
      if (promoCode.type === 'PERCENTAGE') {
        discountAmount = Math.round((standPriceHT * promoCode.value / 100) * 100) / 100
      } else {
        discountAmount = Math.min(promoCode.value, standPriceHT)
      }
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      discountAmount,
    })
  } catch (error) {
    console.error('Promo validation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation du code promo' },
      { status: 500 }
    )
  }
}
