import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseQRCodeData, extractQRCodeFromUrl } from '@/lib/qrcode'

/**
 * POST /api/tickets/scan
 * Verify and validate a ticket by scanning its QR code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrData, markAsUsed = true } = body

    if (!qrData) {
      return NextResponse.json(
        { valid: false, error: 'Code QR manquant' },
        { status: 400 }
      )
    }

    // Parse QR code data (handles both raw codes and URLs)
    const parsed = parseQRCodeData(qrData)

    if (!parsed) {
      return NextResponse.json({
        valid: false,
        error: 'Code QR invalide',
        message: 'Ce code QR n\'est pas un billet valide pour Cann\'Agri Expo'
      })
    }

    // Use the raw code for database lookup (extracted from URL if needed)
    const rawCode = parsed.rawCode

    // Find ticket by QR code data
    const ticket = await prisma.ticket.findUnique({
      where: { qrCodeData: rawCode },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            paidAt: true,
            status: true,
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        error: 'Billet introuvable',
        message: 'Ce billet n\'existe pas dans notre systeme'
      })
    }

    // Check ticket status
    if (ticket.status === 'USED') {
      return NextResponse.json({
        valid: false,
        error: 'Billet deja utilise',
        message: `Ce billet a deja ete scanne le ${ticket.scannedAt?.toLocaleDateString('fr-FR')} a ${ticket.scannedAt?.toLocaleTimeString('fr-FR')}`,
        ticket: {
          id: ticket.id,
          customerName: ticket.customerName,
          ticketType: ticket.ticketType,
          scannedAt: ticket.scannedAt,
          scannedBy: ticket.scannedBy,
        }
      })
    }

    if (ticket.status === 'CANCELLED') {
      return NextResponse.json({
        valid: false,
        error: 'Billet annule',
        message: 'Ce billet a ete annule et n\'est plus valide'
      })
    }

    if (ticket.status === 'EXPIRED') {
      return NextResponse.json({
        valid: false,
        error: 'Billet expire',
        message: 'Ce billet a expire et n\'est plus valide'
      })
    }

    if (ticket.status !== 'PAID') {
      return NextResponse.json({
        valid: false,
        error: 'Billet non paye',
        message: 'Ce billet n\'a pas ete paye'
      })
    }

    // Check order status
    if (ticket.order?.status !== 'PAID') {
      return NextResponse.json({
        valid: false,
        error: 'Commande non validee',
        message: 'La commande associee a ce billet n\'est pas validee'
      })
    }

    // Mark as used if requested
    if (markAsUsed) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'USED',
          scannedAt: new Date(),
          scannedBy: 'Controle entree', // Could be enhanced with agent ID
        }
      })
    }

    // Return success
    return NextResponse.json({
      valid: true,
      message: markAsUsed ? 'Billet valide - Entree autorisee' : 'Billet valide',
      ticket: {
        id: ticket.id,
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        ticketType: ticket.ticketType,
        ticketTypeLabel: getTicketTypeLabel(ticket.ticketType),
        orderNumber: ticket.order?.orderNumber,
        paidAt: ticket.order?.paidAt,
      }
    })

  } catch (error) {
    console.error('Ticket scan error:', error)
    return NextResponse.json(
      { valid: false, error: 'Erreur lors de la verification' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/tickets/scan?code=xxx
 * Verify a ticket without marking it as used (preview mode)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { valid: false, error: 'Code QR manquant' },
      { status: 400 }
    )
  }

  // Parse QR code data (handles both raw codes and URLs)
  const parsed = parseQRCodeData(code)

  if (!parsed) {
    return NextResponse.json({
      valid: false,
      error: 'Code QR invalide'
    })
  }

  // Use the raw code for database lookup (extracted from URL if needed)
  const rawCode = parsed.rawCode

  const ticket = await prisma.ticket.findUnique({
    where: { qrCodeData: rawCode },
    include: {
      order: {
        select: {
          orderNumber: true,
          customerName: true,
          status: true,
        }
      }
    }
  })

  if (!ticket) {
    return NextResponse.json({ valid: false, error: 'Billet introuvable' })
  }

  return NextResponse.json({
    valid: ticket.status === 'PAID' && ticket.order?.status === 'PAID',
    status: ticket.status,
    ticket: {
      id: ticket.id,
      customerName: ticket.customerName,
      ticketType: ticket.ticketType,
      ticketTypeLabel: getTicketTypeLabel(ticket.ticketType),
      status: ticket.status,
      scannedAt: ticket.scannedAt,
    }
  })
}

function getTicketTypeLabel(type: string): string {
  switch (type) {
    case 'STANDARD': return 'Billet Standard'
    case 'FLEX': return 'Billet Flex'
    default: return type
  }
}
