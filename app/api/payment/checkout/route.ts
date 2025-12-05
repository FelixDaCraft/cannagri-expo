import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createVivaWalletOrder } from '@/lib/vivawallet'
import { generateOrderNumber } from '@/lib/utils'

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

      const stand = await prisma.stand.findUnique({
        where: { id: items.standId }
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

      // Calculate total with options
      amountHT = stand.priceHT
      if (items.hasFurniture) amountHT += stand.furniturePrice
      if (items.hasElectricity) amountHT += stand.electricityPrice
      amount = amountHT * 1.2 // TVA 20%

      // Reserve the stand temporarily (15 minutes)
      const reservedUntil = new Date(Date.now() + 15 * 60 * 1000)
      await prisma.stand.update({
        where: { id: stand.id },
        data: {
          status: 'RESERVED',
          reservedAt: new Date(),
          reservedUntil,
          hasFurniture: items.hasFurniture || false,
          hasElectricity: items.hasElectricity || false,
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

    // Create Viva Wallet order
    let checkoutUrl: string

    if (process.env.VIVA_WALLET_DEMO_MODE === 'true') {
      // In demo mode, redirect to a success simulation page
      checkoutUrl = `/billetterie/confirmation?orderId=${order.id}&demo=true`
    } else {
      const vivaOrder = await createVivaWalletOrder({
        amount: Math.round(amount * 100), // In cents
        customerEmail: customer.email,
        customerFullName: customer.name,
        customerPhone: customer.phone,
        merchantTrns: order.id,
      })

      // Update order with Viva Wallet reference
      await prisma.order.update({
        where: { id: order.id },
        data: {
          vivaWalletRef: vivaOrder.orderCode,
          vivaPaymentUrl: vivaOrder.checkoutUrl,
        }
      })

      checkoutUrl = vivaOrder.checkoutUrl
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
