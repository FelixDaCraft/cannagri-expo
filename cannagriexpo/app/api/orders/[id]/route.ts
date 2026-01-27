import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        type: true,
        amount: true,
        amountHT: true,
        status: true,
        customerName: true,
        customerEmail: true,
        companyName: true,
        paidAt: true,
        createdAt: true,
        stands: {
          select: {
            code: true,
            surfaceM2: true,
          }
        },
        tickets: {
          select: {
            id: true,
            ticketType: true,
            ticketPrice: true,
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    )
  }
}
