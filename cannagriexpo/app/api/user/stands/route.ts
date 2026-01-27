import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/stands - Get current user's stand reservations
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Only PRO users can have stand reservations
    if (session.user.role !== 'PRO') {
      return NextResponse.json(
        { error: 'Accès réservé aux comptes professionnels' },
        { status: 403 }
      )
    }

    // Get user's stands through their orders (by email) - only PAID orders
    const stands = await prisma.stand.findMany({
      where: {
        order: {
          customerEmail: session.user.email,
          type: 'STAND_BOOKING',
          status: 'PAID',
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            amount: true,
            amountHT: true,
            paidAt: true,
            customerName: true,
            companyName: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        number: 'asc',
      },
    })

    return NextResponse.json({ stands })

  } catch (error) {
    console.error('Error fetching user stands:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des stands' },
      { status: 500 }
    )
  }
}
