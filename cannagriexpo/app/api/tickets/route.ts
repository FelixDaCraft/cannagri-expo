import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tickets - List all tickets (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = status ? { status: status as any } : {}

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              orderNumber: true,
              status: true,
            }
          }
        }
      }),
      prisma.ticket.count({ where }),
    ])

    return NextResponse.json({
      data: tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

// POST /api/tickets/validate - Validate a ticket (scan QR code)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrCodeData, scannedBy } = body

    if (!qrCodeData) {
      return NextResponse.json(
        { error: 'QR code data required' },
        { status: 400 }
      )
    }

    const ticket = await prisma.ticket.findUnique({
      where: { qrCodeData },
      include: {
        order: true,
      }
    })

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        error: 'Billet invalide ou inconnu',
      })
    }

    if (ticket.status === 'USED') {
      return NextResponse.json({
        valid: false,
        error: 'Ce billet a déjà été utilisé',
        usedAt: ticket.scannedAt,
      })
    }

    if (ticket.status !== 'PAID') {
      return NextResponse.json({
        valid: false,
        error: 'Ce billet n\'est pas valide',
        status: ticket.status,
      })
    }

    // Mark ticket as used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'USED',
        scannedAt: new Date(),
        scannedBy: scannedBy || 'Scanner',
      }
    })

    return NextResponse.json({
      valid: true,
      ticket: {
        id: updatedTicket.id,
        customerName: updatedTicket.customerName,
        ticketType: updatedTicket.ticketType,
        scannedAt: updatedTicket.scannedAt,
      }
    })

  } catch (error) {
    console.error('Error validating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to validate ticket' },
      { status: 500 }
    )
  }
}
