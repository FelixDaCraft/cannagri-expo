import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyVivaWalletSignature, getVivaWalletOrder } from '@/lib/vivawallet'
import { generateQRCodeData } from '@/lib/utils'
import { generateTicketPDF } from '@/lib/pdf'
import { sendTicketEmail } from '@/lib/email'
import { generateQRCode } from '@/lib/qrcode'

interface VivaWalletWebhookPayload {
  EventTypeId: number
  EventData: {
    TransactionId: string
    OrderCode: string
    Amount: number
    StatusId: string
    FullName?: string
    Email?: string
    MerchantTrns?: string // Our order ID
  }
}

// Viva Wallet Event Types
const VIVA_EVENT_TYPES = {
  TRANSACTION_PAYMENT_CREATED: 1796,
  TRANSACTION_FAILED: 1798,
  TRANSACTION_REVERSED: 1797,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('x-viva-signature')

    // Verify webhook signature (in production)
    if (!verifyVivaWalletSignature(body, signature)) {
      console.error('Viva Wallet webhook signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const payload: VivaWalletWebhookPayload = JSON.parse(body)
    console.log('Viva Wallet webhook received:', payload.EventTypeId)

    switch (payload.EventTypeId) {
      case VIVA_EVENT_TYPES.TRANSACTION_PAYMENT_CREATED:
        await handlePaymentSuccess(payload.EventData)
        break

      case VIVA_EVENT_TYPES.TRANSACTION_FAILED:
        await handlePaymentFailed(payload.EventData)
        break

      case VIVA_EVENT_TYPES.TRANSACTION_REVERSED:
        await handlePaymentReversed(payload.EventData)
        break

      default:
        console.log(`Unhandled Viva Wallet event type: ${payload.EventTypeId}`)
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

async function handlePaymentSuccess(eventData: VivaWalletWebhookPayload['EventData']) {
  // Find order by Viva Wallet order code or our order ID in merchantTrns
  let order = await prisma.order.findFirst({
    where: {
      OR: [
        { vivaWalletRef: eventData.OrderCode.toString() },
        { id: eventData.MerchantTrns },
      ]
    },
    include: {
      stands: true,
    }
  })

  if (!order) {
    console.error('Order not found for Viva Wallet payment:', eventData.OrderCode)
    return
  }

  // Update order status
  order = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      vivaWalletRef: eventData.TransactionId,
    },
    include: {
      stands: true,
    }
  })

  // Fetch active sponsors with logos for ticket PDF
  const sponsors = await prisma.sponsor.findMany({
    where: {
      isActive: true,
      logoUrl: { not: null },
    },
    orderBy: [
      { type: 'asc' }, // PLATINE, OR, ARGENT, BRONZE
    ],
  })

  // Handle ticket orders
  if (order.type === 'VISITOR_TICKET') {
    // Parse ticket items from notes
    let items: Array<{ type: string; price: number; quantity: number; attendeeName?: string }> = []
    try {
      if (order.notes) {
        items = JSON.parse(order.notes)
      }
    } catch {
      console.error('Failed to parse ticket items from order notes')
    }

    // Collect all tickets for a single email
    const ticketAttachments: Array<{ attendeeName: string; ticketType: string; pdfBuffer: Buffer }> = []

    for (const item of items) {
      const quantity = item.quantity || 1
      const unitPrice = item.price
      // Use attendee name if provided (nominative tickets), fallback to order customer name
      const attendeeName = item.attendeeName || order.customerName

      // Determine ticket type for database (only STANDARD and FLEX are supported)
      const ticketType: 'STANDARD' | 'FLEX' = item.type === 'FLEX' ? 'FLEX' : 'STANDARD'

      for (let i = 0; i < quantity; i++) {
        const qrData = generateQRCodeData(order.id, Date.now().toString())
        const qrCodeImage = await generateQRCode(qrData)

        const ticket = await prisma.ticket.create({
          data: {
            customerName: attendeeName, // Use attendee name for nominative ticket
            customerEmail: order.customerEmail,
            ticketType,
            ticketPrice: unitPrice,
            qrCodeData: qrData,
            status: 'PAID',
            orderId: order.id,
          }
        })

        const pdfBuffer = await generateTicketPDF({
          ticketId: ticket.id,
          customerName: attendeeName, // Use attendee name on PDF
          ticketType: ticketType, // Use ticket type for display
          orderNumber: order.orderNumber,
          qrCodeImage,
          sponsors, // Pass sponsors for logo display on ticket
        })

        // Add to attachments array
        ticketAttachments.push({
          attendeeName,
          ticketType: ticketType,
          pdfBuffer,
        })
      }
    }

    // Send a single email with all tickets
    if (ticketAttachments.length > 0) {
      await sendTicketEmail({
        to: order.customerEmail,
        customerName: order.customerName, // Buyer's name for greeting
        orderNumber: order.orderNumber,
        tickets: ticketAttachments,
      })
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

    await sendTicketEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      isStandBooking: true,
      standCodes: order.stands.map(s => s.code),
    })
  }

  console.log(`Order ${order.id} marked as paid via Viva Wallet`)
}

async function handlePaymentFailed(eventData: VivaWalletWebhookPayload['EventData']) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { vivaWalletRef: eventData.OrderCode.toString() },
        { id: eventData.MerchantTrns },
      ]
    },
    include: { stands: true }
  })

  if (!order) return

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'FAILED',
      notes: order.notes ? `${order.notes}\nPayment failed` : 'Payment failed',
    }
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

  console.log(`Order ${order.id} marked as failed (Viva Wallet)`)
}

async function handlePaymentReversed(eventData: VivaWalletWebhookPayload['EventData']) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { vivaWalletRef: eventData.OrderCode.toString() },
        { id: eventData.MerchantTrns },
      ]
    },
    include: { stands: true }
  })

  if (!order) return

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'REFUNDED',
      notes: order.notes ? `${order.notes}\nPayment reversed/refunded` : 'Payment reversed/refunded',
    }
  })

  console.log(`Order ${order.id} marked as refunded (Viva Wallet)`)
}

// Handle GET requests for webhook verification (Viva Wallet sends a verification request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Try different parameter names that Viva Wallet might use
  const verificationKey = searchParams.get('Key') ||
                          searchParams.get('key') ||
                          searchParams.get('verificationKey') ||
                          searchParams.get('code')

  // Viva Wallet sends a verification request with a Key parameter
  // We need to return it back to confirm the webhook URL
  if (verificationKey) {
    return new NextResponse(verificationKey, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  // Return empty 200 OK for basic verification
  return new NextResponse('OK', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}
