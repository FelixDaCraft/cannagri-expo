import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getVivaWalletOrder } from '@/lib/vivawallet'
import { generateQRCodeData } from '@/lib/utils'
import { generateTicketPDF } from '@/lib/pdf'
import { sendTicketEmail } from '@/lib/email'
import { generateQRCode } from '@/lib/qrcode'

/**
 * POST /api/payment/verify
 * Verify payment status via Viva Wallet API (polling method)
 * Called by the success page after redirect from Viva Wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, vivaOrderCode } = body

    if (!orderId && !vivaOrderCode) {
      return NextResponse.json(
        { error: 'orderId ou vivaOrderCode requis' },
        { status: 400 }
      )
    }

    // Find the order
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ id: orderId }] : []),
          ...(vivaOrderCode ? [{ vivaWalletRef: vivaOrderCode.toString() }] : []),
        ]
      },
      include: {
        stands: true,
        tickets: true,
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    // If already processed, return current status
    if (order.status === 'PAID') {
      return NextResponse.json({
        success: true,
        status: 'PAID',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          type: order.type,
          amount: order.amount,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
        }
      })
    }

    // Local simulation mode only (completely bypasses Viva Wallet)
    // This is for local testing without any Viva Wallet interaction
    if (process.env.VIVA_WALLET_LOCAL_SIMULATION === 'true') {
      await processSuccessfulPayment(order.id)

      order = await prisma.order.findUnique({
        where: { id: order.id },
        include: { stands: true, tickets: true }
      })

      return NextResponse.json({
        success: true,
        status: 'PAID',
        demo: true,
        order: {
          id: order!.id,
          orderNumber: order!.orderNumber,
          type: order!.type,
          amount: order!.amount,
          customerName: order!.customerName,
          customerEmail: order!.customerEmail,
        }
      })
    }

    // Query Viva Wallet API for payment status (works for both demo and production)
    const vivaRef = vivaOrderCode || order.vivaWalletRef
    if (!vivaRef) {
      return NextResponse.json({
        success: false,
        status: 'PENDING',
        message: 'En attente de confirmation de paiement'
      })
    }

    try {
      const vivaOrder = await getVivaWalletOrder(vivaRef)

      // Check Viva Wallet order state
      // StateId: 0 = Pending, 1 = Expired, 2 = Canceled, 3 = Paid, 4 = Awaiting, 5 = Refunded
      // For Smart Checkout: StateId 'F' or 'E' means completed
      const stateId = vivaOrder.StateId
      console.log(`[Verify] Viva Wallet StateId: ${stateId}, Type: ${typeof stateId}`)

      // Check for paid status (StateId 3 or 'F' for completed transactions)
      const isPaid = stateId === 3 || stateId === '3' || stateId === 'F' || stateId === 'E'

      if (isPaid) {
        // Payment successful
        await processSuccessfulPayment(order.id, vivaRef)

        order = await prisma.order.findUnique({
          where: { id: order.id },
          include: { stands: true, tickets: true }
        })

        return NextResponse.json({
          success: true,
          status: 'PAID',
          order: {
            id: order!.id,
            orderNumber: order!.orderNumber,
            type: order!.type,
            amount: order!.amount,
            customerName: order!.customerName,
            customerEmail: order!.customerEmail,
          }
        })
      } else if (stateId === 0 || stateId === '0' || stateId === 4 || stateId === '4') {
        // Pending or Awaiting
        return NextResponse.json({
          success: false,
          status: 'PENDING',
          message: 'Paiement en cours de traitement'
        })
      } else {
        // Failed, cancelled, expired, or refunded (1, 2, 5)
        console.log(`[Verify] Payment not successful. StateId: ${stateId}`)
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' }
        })

        return NextResponse.json({
          success: false,
          status: 'FAILED',
          message: 'Le paiement a échoué ou a été annulé'
        })
      }
    } catch (vivaError) {
      console.error('Viva Wallet API error:', vivaError)
      return NextResponse.json({
        success: false,
        status: 'PENDING',
        message: 'Impossible de vérifier le statut du paiement'
      })
    }

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du paiement' },
      { status: 500 }
    )
  }
}

/**
 * Process a successful payment - create tickets, update stands, send emails
 */
async function processSuccessfulPayment(orderId: string, transactionId?: string) {
  let order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { stands: true }
  })

  if (!order || order.status === 'PAID') return

  // Update order status
  order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      ...(transactionId ? { vivaWalletRef: transactionId } : {}),
    },
    include: { stands: true }
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

      // Only STANDARD and FLEX ticket types are supported
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
            qrCodeData: qrData, // Store raw data for database lookup
            status: 'PAID',
            orderId: order.id,
          }
        })

        const pdfBuffer = await generateTicketPDF({
          ticketId: ticket.id,
          customerName: attendeeName, // Use attendee name on PDF
          ticketType: ticket.ticketType,
          orderNumber: order.orderNumber,
          qrCodeImage,
          sponsors, // Pass sponsors for logo display on ticket
        })

        // Add to attachments array
        ticketAttachments.push({
          attendeeName,
          ticketType,
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

  console.log(`Order ${order.id} processed successfully via polling verification`)
}
