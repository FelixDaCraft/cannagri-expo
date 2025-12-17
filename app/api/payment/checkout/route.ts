import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import { createVivaWalletOrder } from '@/lib/vivawallet'

// Check if Viva Wallet is configured
const isVivaWalletEnabled = !!(
  process.env.VIVA_WALLET_MERCHANT_ID &&
  process.env.VIVA_WALLET_API_KEY
)


// Force demo mode for local development
const isDemoMode = process.env.VIVA_WALLET_DEMO_MODE === 'true' ||
  process.env.NEXTAUTH_URL?.includes('localhost') ||
  !process.env.NEXTAUTH_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, items, customer } = body

    // Validate required fields
    if (!type || !customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    let amount = 0
    let amountHT = 0
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
      if (!items?.standId) {
        return NextResponse.json(
          { error: 'Aucun stand sélectionné' },
          { status: 400 }
        )
      }

      stand = await prisma.stand.findUnique({
        where: { id: items.standId },
        select: { id: true, code: true, surfaceM2: true, priceHT: true, status: true }
      })

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
      amountHT = stand.priceHT
      amount = amountHT * 1.2 // TVA 20%

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

    // Create order in database
    const order = await prisma.order.create({
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
        // Store ticket details for webhook processing
        notes: type === 'VISITOR_TICKET' ? JSON.stringify(items) : null,
      }
    })

    // If it's a stand booking, link the stand to the order
    if (type === 'STAND_BOOKING' && items?.standId) {
      await prisma.stand.update({
        where: { id: items.standId },
        data: { orderId: order.id }
      })
    }

    // Create payment checkout URL
    let checkoutUrl: string
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/paiement/succes?orderId=${order.id}`
    const failureUrl = `${baseUrl}/paiement/echec?orderId=${order.id}`

    if (!isVivaWalletEnabled || isDemoMode) {
      // Demo mode - redirect to payment simulation page
      const amountCents = Math.round(amount * 100)
      checkoutUrl = `${baseUrl}/paiement/demo?orderId=${order.id}&amount=${amountCents}`
    } else {
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

        // Viva Wallet checkout URL with success/failure redirects
        checkoutUrl = `${vivaOrder.checkoutUrl}&color=2E4A33&successUrl=${encodeURIComponent(successUrl)}&failUrl=${encodeURIComponent(failureUrl)}`

        // Update order with Viva Wallet order code
        await prisma.order.update({
          where: { id: order.id },
          data: {
            vivaWalletRef: vivaOrder.orderCode,
            vivaPaymentUrl: checkoutUrl,
          }
        })
      } catch (vivaError) {
        console.error('Viva Wallet error:', vivaError)
        // Fallback to demo mode if Viva Wallet fails
        const amountCents = Math.round(amount * 100)
        checkoutUrl = `${baseUrl}/paiement/demo?orderId=${order.id}&amount=${amountCents}`
      }
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
