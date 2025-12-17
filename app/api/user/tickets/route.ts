import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/tickets - Get current user's tickets
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Only USER and PRO roles can access their tickets
    if (!['USER', 'PRO'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Get user's tickets through their orders (by email)
    const tickets = await prisma.ticket.findMany({
      where: {
        order: {
          customerEmail: session.user.email,
        },
        status: {
          in: ['PAID', 'USED'],
        },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            paidAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ tickets })

  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des billets' },
      { status: 500 }
    )
  }
}
