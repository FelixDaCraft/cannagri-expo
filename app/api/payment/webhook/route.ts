import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { constructWebhookEvent, stripe } from '@/lib/stripe'
import { generateQRCodeData } from '@/lib/utils'
import { generateTicketPDF } from '@/lib/pdf'
import { sendTicketEmail } from '@/lib/email'
import { generateQRCode } from '@/lib/qrcode'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    // If no Stripe signature, it might be a legacy Viva Wallet webhook
    if (!signature) {
      return handleLegacyWebhook(request, body)
    }

    let event: Stripe.Event

    try {
      event = constructWebhookEvent(body, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle Stripe events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleStripeCheckoutCompleted(session)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleStripeCheckoutExpired(session)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleStripePaymentFailed(paymentIntent)
        break
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Handle Stripe checkout completed
async function handleStripeCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.client_reference_id || session.metadata?.orderId

  if (!orderId) {
    console.error('No orderId found in checkout session')
    return
  }

  // Update order status
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      vivaWalletRef: session.payment_intent as string, // Store Stripe payment intent ID
    },
    include: {
      stands: true,
    }
  })

  // Handle ticket orders
  if (order.type === 'VISITOR_TICKET' && stripe) {
    // Retrieve line items to create tickets
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    for (const item of lineItems.data) {
      const quantity = item.quantity || 1
      const unitPrice = (item.amount_total || 0) / 100 / quantity

      // Determine ticket type from product name
      let ticketType: 'VISITEUR' | 'PASS_PRO' | 'VIP' = 'VISITEUR'
      if (item.description?.includes('Pro')) ticketType = 'PASS_PRO'
      if (item.description?.includes('VIP')) ticketType = 'VIP'

      for (let i = 0; i < quantity; i++) {
        // Generate unique QR code data
        const qrData = generateQRCodeData(order.id, Date.now().toString())
        const qrCodeImage = await generateQRCode(qrData)

        const ticket = await prisma.ticket.create({
          data: {
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            ticketType,
            ticketPrice: unitPrice,
            qrCodeData: qrData,
            status: 'PAID',
            orderId: order.id,
          }
        })

        // Generate PDF
        const pdfBuffer = await generateTicketPDF({
          ticketId: ticket.id,
          customerName: order.customerName,
          ticketType: ticket.ticketType,
          orderNumber: order.orderNumber,
          qrCodeImage,
        })

        // Send email with PDF
        await sendTicketEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          pdfBuffer,
        })
      }
    }
  }

  // Handle stand bookings
  if (order.type === 'STAND_BOOKING' && order.stands.length > 0) {
    for (const stand of order.stands) {
      await prisma.stand.update({
        where: { id: stand.id },
        data: {
          status: 'SOLD',
          exhibitorName: order.companyName || order.customerName,
          reservedAt: null,
          reservedUntil: null,
        }
      })
    }

    // Send confirmation email
    await sendTicketEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      isStandBooking: true,
      standCodes: order.stands.map(s => s.code),
    })
  }

  console.log(`Order ${orderId} marked as paid via Stripe`)
}

// Handle Stripe checkout expired
async function handleStripeCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.client_reference_id || session.metadata?.orderId

  if (!orderId) return

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
    include: { stands: true }
  })

  // Release reserved stands
  if (order.type === 'STAND_BOOKING' && order.stands.length > 0) {
    for (const stand of order.stands) {
      await prisma.stand.update({
        where: { id: stand.id },
        data: {
          status: 'FREE',
          reservedAt: null,
          reservedUntil: null,
          orderId: null,
        }
      })
    }
  }

  console.log(`Order ${orderId} cancelled (Stripe checkout expired)`)
}

// Handle Stripe payment failed
async function handleStripePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId) return

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'FAILED',
      notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
    },
    include: { stands: true }
  })

  // Release reserved stands
  if (order.type === 'STAND_BOOKING' && order.stands.length > 0) {
    for (const stand of order.stands) {
      await prisma.stand.update({
        where: { id: stand.id },
        data: {
          status: 'FREE',
          reservedAt: null,
          reservedUntil: null,
          orderId: null,
        }
      })
    }
  }

  console.log(`Order ${orderId} marked as failed`)
}

// Legacy Viva Wallet webhook handler (for backwards compatibility)
async function handleLegacyWebhook(request: NextRequest, bodyText: string) {
  const VIVA_STATUS = {
    PENDING: 'E',
    SUCCESS: 'F',
    FAILED: 'X',
  }

  try {
    const body = JSON.parse(bodyText)
    const { OrderCode, StatusId, MerchantTrns } = body

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { vivaWalletRef: OrderCode },
          { id: MerchantTrns },
        ]
      },
      include: { stands: true }
    })

    if (!order) {
      console.error('Webhook: Order not found', { OrderCode, MerchantTrns })
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (StatusId === VIVA_STATUS.SUCCESS) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() }
      })

      if (order.type === 'VISITOR_TICKET') {
        const qrData = generateQRCodeData(order.id, Date.now().toString())
        const qrCodeImage = await generateQRCode(qrData)

        const ticket = await prisma.ticket.create({
          data: {
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            ticketType: 'PASS_PRO',
            ticketPrice: order.amount,
            qrCodeData: qrData,
            status: 'PAID',
            orderId: order.id,
          }
        })

        const pdfBuffer = await generateTicketPDF({
          ticketId: ticket.id,
          customerName: order.customerName,
          ticketType: ticket.ticketType,
          orderNumber: order.orderNumber,
          qrCodeImage,
        })

        await sendTicketEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          pdfBuffer,
        })

      } else if (order.type === 'STAND_BOOKING') {
        await prisma.stand.updateMany({
          where: { orderId: order.id },
          data: { status: 'SOLD', reservedAt: null, reservedUntil: null }
        })

        await sendTicketEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          isStandBooking: true,
          standCodes: order.stands.map(s => s.code),
        })
      }

    } else if (StatusId === VIVA_STATUS.FAILED) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' }
      })

      if (order.type === 'STAND_BOOKING') {
        await prisma.stand.updateMany({
          where: { orderId: order.id },
          data: { status: 'FREE', orderId: null, reservedAt: null, reservedUntil: null }
        })
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Legacy webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
