import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTicketPDF } from '@/lib/pdf'
import { generateQRCode } from '@/lib/qrcode'

// GET /api/user/tickets/[id] - Download a specific ticket PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Only USER and PRO roles can download their tickets
    if (!['USER', 'PRO'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Get the ticket and verify ownership
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerEmail: true,
          },
        },
      },
    })

    if (!ticket || !ticket.order) {
      return NextResponse.json(
        { error: 'Billet introuvable' },
        { status: 404 }
      )
    }

    // Verify the ticket belongs to the current user
    if (ticket.order.customerEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce billet' },
        { status: 403 }
      )
    }

    // Get active sponsors for the PDF
    const sponsors = await prisma.sponsor.findMany({
      where: {
        isActive: true,
        logoUrl: { not: null },
      },
      orderBy: [
        { type: 'asc' },
      ],
    })

    // Generate QR code image with raw code
    const qrCodeImage = await generateQRCode(ticket.qrCodeData)

    // Generate the PDF
    const pdfBuffer = await generateTicketPDF({
      ticketId: ticket.id,
      customerName: ticket.customerName,
      ticketType: ticket.ticketType,
      orderNumber: ticket.order.orderNumber,
      qrCodeImage,
      sponsors,
    })

    // Return the PDF as a downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="billet-${ticket.order.orderNumber}-${ticket.customerName.replace(/\s+/g, '-')}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error downloading ticket:', error)
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du billet' },
      { status: 500 }
    )
  }
}
