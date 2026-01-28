import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import { createVivaWalletOrder } from '@/lib/vivawallet'
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'

// Check if Viva Wallet is configured
const isVivaWalletEnabled = !!(
  process.env.VIVA_WALLET_MERCHANT_ID &&
  process.env.VIVA_WALLET_API_KEY
)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 10 checkout attempts per minute per IP
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(`checkout:${clientIP}`, RATE_LIMIT_PRESETS.PAYMENT)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    const body = await request.json()
    const { type, items, customer, promoCode: promoCodeInput } = body

    // Validate required fields
    if (!type || !customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    let amount = 0
    let amountHT = 0
    let discountAmount = 0
    let promoCodeId: string | null = null
    let stand: { id: string; code: string; surfaceM2: number; priceHT: number; status: string } | null = null

    if (type === 'VISITOR_TICKET') {
      // Calculate ticket total
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: 'Aucun billet sélectionné' },
          { status: 400 }
        )
      }

      amount = items.reduce((sum: number, item: { price: number; quantity: number }) => {
        return sum + item.price * item.quantity
      }, 0)
      amountHT = amount / 1.2 // TVA 20%

    } else if (type === 'STAND_BOOKING') {
      // STAND_BOOKING requires authenticated PRO user with approved status
      const session = await getServerSession(authOptions)

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Vous devez être connecté pour réserver un stand' },
          { status: 401 }
        )
      }

      // Check if user is PRO and approved
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isApproved: true }
      })

      if (!user || user.role !== 'PRO') {
        return NextResponse.json(
          { error: 'Seuls les comptes professionnels peuvent réserver un stand' },
          { status: 403 }
        )
      }

      if (!user.isApproved) {
        return NextResponse.json(
          { error: 'Votre compte professionnel est en attente de validation' },
          { status: 403 }
        )
      }

      // Find the stand and calculate price
      if (!items?.standId && !items?.standCode) {
        return NextResponse.json(
          { error: 'Aucun stand sélectionné' },
          { status: 400 }
        )
      }

      // Try to find stand by ID first, then by code
      stand = await prisma.stand.findUnique({
        where: { id: items.standId },
        select: { id: true, code: true, surfaceM2: true, priceHT: true, status: true }
      })

      // If not found by ID, try by code (for interactive plan which uses stand numbers)
      if (!stand && items?.standCode) {
        // Extract number from "Stand X" format
        const standNumber = items.standCode.replace(/\D/g, '')
        stand = await prisma.stand.findFirst({
          where: { code: standNumber },
          select: { id: true, code: true, surfaceM2: true, priceHT: true, status: true }
        })
      }

      if (!stand) {
        return NextResponse.json(
          { error: 'Stand introuvable' },
          { status: 404 }
        )
      }

      if (stand.status !== 'FREE') {
        return NextResponse.json(
          { error: 'Ce stand n\'est plus disponible' },
          { status: 400 }
        )
      }

      // Calculate total (simple price without options)
      // Association loi 1901 non assujettie à la TVA - pas de majoration
      amountHT = stand.priceHT

      // Apply promo code if provided
      if (promoCodeInput && typeof promoCodeInput === 'string') {
        const promoCode = await prisma.promoCode.findUnique({
          where: { code: promoCodeInput.trim().toUpperCase() },
        })

        if (!promoCode || !promoCode.isActive) {
          return NextResponse.json(
            { error: 'Code promo invalide ou inactif' },
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
        if (promoCode.type === 'PERCENTAGE') {
          discountAmount = Math.round((amountHT * promoCode.value / 100) * 100) / 100
        } else {
          discountAmount = Math.min(promoCode.value, amountHT)
        }

        promoCodeId = promoCode.id
        amountHT = Math.max(0, amountHT - discountAmount)
      }

      amount = amountHT

      // Reserve the stand temporarily (30 minutes for checkout)
      const reservedUntil = new Date(Date.now() + 30 * 60 * 1000)
      await prisma.stand.update({
        where: { id: stand.id },
        data: {
          status: 'RESERVED',
          reservedAt: new Date(),
          reservedUntil,
        }
      })

    } else {
      return NextResponse.json(
        { error: 'Type de commande invalide' },
        { status: 400 }
      )
    }

    // Create order in database (with promo code increment in transaction if applicable)
    const order = await prisma.$transaction(async (tx) => {
      // Increment promo code usage if applicable
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { currentUses: { increment: 1 } },
        })
      }

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          type,
          amount,
          amountHT,
          status: 'PENDING',
          customerEmail: customer.email,
          customerName: customer.name,
          customerPhone: customer.phone || null,
          companyName: customer.companyName || null,
          companySiret: customer.siret || null,
          companyAddress: customer.address || null,
          promoCodeId,
          discountAmount,
          // Store ticket details for webhook processing
          notes: type === 'VISITOR_TICKET' ? JSON.stringify(items) : null,
        }
      })
    })

    // If it's a stand booking, link the stand to the order
    if (type === 'STAND_BOOKING' && stand) {
      await prisma.stand.update({
        where: { id: stand.id },
        data: { orderId: order.id }
      })
    }

    // Create payment checkout URL via Viva Wallet
    if (!isVivaWalletEnabled) {
      // Revert stand reservation if Viva Wallet is not configured
      if (type === 'STAND_BOOKING' && stand) {
        await prisma.stand.update({
          where: { id: stand.id },
          data: { status: 'FREE', orderId: null, reservedAt: null, reservedUntil: null }
        })
      }
      return NextResponse.json(
        { error: 'Le système de paiement n\'est pas configuré. Veuillez contacter l\'administrateur.' },
        { status: 503 }
      )
    }

    let checkoutUrl: string

    try {
      // Create Viva Wallet payment order
      // Amount must be in cents (e.g., 25.00€ = 2500)
      const vivaOrder = await createVivaWalletOrder({
        amount: Math.round(amount * 100),
        customerEmail: customer.email,
        customerFullName: customer.name,
        customerPhone: customer.phone || '',
        merchantTrns: order.id, // Store our order ID for webhook
      })

      // Update order with Viva Wallet order code
      await prisma.order.update({
        where: { id: order.id },
        data: {
          vivaWalletRef: vivaOrder.orderCode,
          vivaPaymentUrl: vivaOrder.checkoutUrl,
        }
      })

      checkoutUrl = vivaOrder.checkoutUrl

      console.log('Viva Wallet order created:', {
        orderCode: vivaOrder.orderCode,
        orderId: order.id,
        checkoutUrl,
      })
    } catch (vivaError) {
      console.error('Viva Wallet error:', vivaError)

      // Revert stand reservation on Viva Wallet error
      if (type === 'STAND_BOOKING' && stand) {
        await prisma.stand.update({
          where: { id: stand.id },
          data: { status: 'FREE', orderId: null, reservedAt: null, reservedUntil: null }
        })
      }

      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' }
      })

      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      checkoutUrl,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la commande' },
      { status: 500 }
    )
  }
}
