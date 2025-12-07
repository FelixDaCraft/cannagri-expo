import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import {
  createTicketCheckoutSession,
  createStandCheckoutSession,
  isStripeEnabled,
} from '@/lib/stripe'

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

      // Reserve the stand temporarily (30 minutes for Stripe checkout)
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
      }
    })

    // If it's a stand booking, link the stand to the order
    if (type === 'STAND_BOOKING' && items?.standId) {
      await prisma.stand.update({
        where: { id: items.standId },
        data: { orderId: order.id }
      })
    }

    // Create Stripe checkout session
    let checkoutUrl: string
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!isStripeEnabled) {
      // Demo mode - redirect to success simulation page
      checkoutUrl = `/billetterie/confirmation?orderId=${order.id}&demo=true`
    } else {
      try {
        if (type === 'VISITOR_TICKET') {
          const session = await createTicketCheckoutSession({
            items,
            customerEmail: customer.email,
            customerName: customer.name,
            orderId: order.id,
            successUrl: `${baseUrl}/billetterie/confirmation?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/billetterie?cancelled=true`,
          })
          checkoutUrl = session.url!
        } else {
          // Stand booking
          const session = await createStandCheckoutSession({
            standCode: stand!.code,
            standSurface: stand!.surfaceM2,
            priceHT: amountHT,
            priceTTC: amount,
            customerEmail: customer.email,
            customerName: customer.name,
            companyName: customer.companyName,
            orderId: order.id,
            successUrl: `${baseUrl}/pro/confirmation?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/pro/stands?cancelled=true`,
          })
          checkoutUrl = session.url!
        }

        // Update order with Stripe session URL
        await prisma.order.update({
          where: { id: order.id },
          data: {
            vivaPaymentUrl: checkoutUrl, // Reusing field for payment URL
          }
        })
      } catch (stripeError) {
        console.error('Stripe error:', stripeError)
        // Fallback to demo mode if Stripe fails
        checkoutUrl = `/billetterie/confirmation?orderId=${order.id}&demo=true`
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
