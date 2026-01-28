import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { generateQRCodeData } from '@/lib/utils'
import { generateQRCode } from '@/lib/qrcode'
import { generateTicketPDF } from '@/lib/pdf'
import { sendTicketEmail } from '@/lib/email'

// GET /api/admin/invitations - List all complimentary tickets
export async function GET() {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    const tickets = await prisma.ticket.findMany({
      where: { isComplimentary: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: tickets })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des invitations' },
      { status: 500 }
    )
  }
}

// POST /api/admin/invitations - Create complimentary ticket and send email
export async function POST(request: NextRequest) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    const body = await request.json()
    const { customerName, customerEmail, ticketType } = body

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Nom et email requis' },
        { status: 400 }
      )
    }

    const validType: 'STANDARD' | 'FLEX' = ticketType === 'FLEX' ? 'FLEX' : 'STANDARD'

    // Generate QR code
    const qrData = generateQRCodeData('INVITE', Date.now().toString())
    const qrCodeImage = await generateQRCode(qrData)

    // Create ticket in database
    const ticket = await prisma.ticket.create({
      data: {
        customerName,
        customerEmail,
        ticketType: validType,
        ticketPrice: 0,
        qrCodeData: qrData,
        status: 'PAID',
        isComplimentary: true,
        invitedBy: session.user.id,
      },
    })

    // Fetch sponsors for PDF
    const sponsors = await prisma.sponsor.findMany({
      where: { isActive: true, logoUrl: { not: null } },
      orderBy: [{ type: 'asc' }],
    })

    // Generate PDF
    const pdfBuffer = await generateTicketPDF({
      ticketId: ticket.id,
      customerName,
      ticketType: validType,
      orderNumber: 'INVITATION',
      qrCodeImage,
      sponsors,
    })

    // Send email
    await sendTicketEmail({
      to: customerEmail,
      customerName,
      orderNumber: 'INVITATION',
      tickets: [{ attendeeName: customerName, ticketType: validType, pdfBuffer }],
    })

    return NextResponse.json({ success: true, data: ticket }, { status: 201 })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'invitation' },
      { status: 500 }
    )
  }
}
