import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAdminEdition } from '@/lib/editions/admin'

/**
 * GET /api/admin/tickets/stats
 * Get ticket statistics for the admin dashboard
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'CONTRIBUTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Billets valides de l'édition (un billet scanné passe au statut USED)
    const edition = await getAdminEdition()
    const tickets = await prisma.ticket.findMany({
      where: {
        editionId: edition.id,
        status: { in: ['PAID', 'USED'] },
      },
      select: {
        id: true,
        ticketType: true,
        scannedAt: true,
      },
    })

    // Calculate statistics
    const total = tickets.length
    const scanned = tickets.filter(t => t.scannedAt !== null).length
    const pending = total - scanned

    const standardTickets = tickets.filter(t => t.ticketType === 'STANDARD')
    const flexTickets = tickets.filter(t => t.ticketType === 'FLEX')

    const stats = {
      total,
      scanned,
      pending,
      byType: {
        STANDARD: {
          total: standardTickets.length,
          scanned: standardTickets.filter(t => t.scannedAt !== null).length,
        },
        FLEX: {
          total: flexTickets.length,
          scanned: flexTickets.filter(t => t.scannedAt !== null).length,
        },
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching ticket stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
