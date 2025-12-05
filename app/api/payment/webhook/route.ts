import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateQRCodeData } from '@/lib/utils'
import { generateTicketPDF } from '@/lib/pdf'
import { sendTicketEmail } from '@/lib/email'
import { generateQRCode } from '@/lib/qrcode'

// Viva Wallet webhook status codes
const VIVA_STATUS = {
  PENDING: 'E',
  SUCCESS: 'F',
  FAILED: 'X',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-viva-signature')
    // if (!verifyVivaWalletSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const { OrderCode, StatusId, MerchantTrns, Amount } = body

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { vivaWalletRef: OrderCode },
          { id: MerchantTrns },
        ]
      },
      include: {
        stands: true,
      }
    })

    if (!order) {
      console.error('Webhook: Order not found', { OrderCode, MerchantTrns })
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Handle different statuses
    if (StatusId === VIVA_STATUS.SUCCESS) {
      // Payment successful
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        }
      })

      if (order.type === 'VISITOR_TICKET') {
        // Generate ticket(s)
        const qrData = generateQRCodeData(order.id, Date.now().toString())
        const qrCodeImage = await generateQRCode(qrData)

        const ticket = await prisma.ticket.create({
          data: {
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            ticketType: 'PASS_PRO', // You might want to get this from the order items
            ticketPrice: order.amount,
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

      } else if (order.type === 'STAND_BOOKING') {
        // Mark stand(s) as sold
        await prisma.stand.updateMany({
          where: { orderId: order.id },
          data: {
            status: 'SOLD',
            reservedAt: null,
            reservedUntil: null,
          }
        })

        // Send confirmation email
        await sendTicketEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          isStandBooking: true,
          standCodes: order.stands.map(s => s.code),
        })
      }

    } else if (StatusId === VIVA_STATUS.FAILED) {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' }
      })

      // Release reserved stands
      if (order.type === 'STAND_BOOKING') {
        await prisma.stand.updateMany({
          where: { orderId: order.id },
          data: {
            status: 'FREE',
            orderId: null,
            reservedAt: null,
            reservedUntil: null,
          }
        })
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  // Viva Wallet sends a GET request to verify the webhook URL
  return NextResponse.json({ status: 'ok' })
}
