import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// GET /api/stands - List all stands
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status: status as any } : {}

    const stands = await prisma.stand.findMany({
      where,
      orderBy: [
        { row: 'asc' },
        { col: 'asc' },
      ],
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            companyName: true,
            status: true,
          }
        },
        sponsor: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      }
    })

    // Release expired reservations + orphaned reservations (no reservedUntil and no order)
    const now = new Date()
    const expiredStands = stands.filter(
      (s) => s.status === 'RESERVED' && (
        (s.reservedUntil && s.reservedUntil < now) ||
        (!s.reservedUntil && !s.orderId)
      )
    )

    if (expiredStands.length > 0) {
      await prisma.stand.updateMany({
        where: {
          id: { in: expiredStands.map((s) => s.id) },
          status: 'RESERVED',
        },
        data: {
          status: 'FREE',
          orderId: null,
          reservedAt: null,
          reservedUntil: null,
        }
      })

      // Update the returned data
      expiredStands.forEach((s) => {
        const stand = stands.find((st) => st.id === s.id)
        if (stand) {
          stand.status = 'FREE'
          stand.orderId = null
          stand.reservedAt = null
          stand.reservedUntil = null
        }
      })
    }

    return NextResponse.json({ data: stands })

  } catch (error) {
    console.error('Error fetching stands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stands' },
      { status: 500 }
    )
  }
}

// PATCH /api/stands/:id - Update a stand (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { id, status, priceHT, hasFurniture, hasElectricity } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Stand ID required' },
        { status: 400 }
      )
    }

    const stand = await prisma.stand.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priceHT !== undefined && { priceHT }),
        ...(hasFurniture !== undefined && { hasFurniture }),
        ...(hasElectricity !== undefined && { hasElectricity }),
      }
    })

    return NextResponse.json({ data: stand })

  } catch (error) {
    console.error('Error updating stand:', error)
    return NextResponse.json(
      { error: 'Failed to update stand' },
      { status: 500 }
    )
  }
}
