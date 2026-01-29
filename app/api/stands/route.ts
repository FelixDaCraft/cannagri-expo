import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { getVivaWalletOrder } from '@/lib/vivawallet'

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
            vivaWalletRef: true,
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

    // Collect stands to release
    const standsToRelease: string[] = []

    // 1. Release orphaned reservations (no reservedUntil and no order)
    const now = new Date()
    for (const s of stands) {
      if (s.status !== 'RESERVED') continue

      // Orphan: no order, no expiry
      if (!s.reservedUntil && !s.orderId) {
        standsToRelease.push(s.id)
        continue
      }

      // Expired reservation
      if (s.reservedUntil && s.reservedUntil < now) {
        standsToRelease.push(s.id)
        continue
      }

      // 2. Stand has a PENDING order with Viva Wallet ref → check payment status
      if (s.order && s.order.status === 'PENDING' && s.order.vivaWalletRef) {
        try {
          const vivaOrder = await getVivaWalletOrder(s.order.vivaWalletRef)
          const stateId = vivaOrder.StateId
          // StateId: 0=Pending, 1=Expired, 2=Canceled, 3=Paid, 4=Awaiting, 5=Refunded
          const isFailed = stateId === 1 || stateId === '1' ||
                          stateId === 2 || stateId === '2' ||
                          stateId === 5 || stateId === '5'

          if (isFailed) {
            console.log(`[Stands] Viva Wallet order ${s.order.vivaWalletRef} is failed/expired/cancelled (StateId: ${stateId}). Releasing stand ${s.code}`)
            standsToRelease.push(s.id)
            // Also update the order status
            await prisma.order.update({
              where: { id: s.order.id },
              data: { status: 'FAILED' }
            })
          }
        } catch (err) {
          console.error(`[Stands] Error checking Viva Wallet status for stand ${s.code}:`, err)
        }
      }
    }

    if (standsToRelease.length > 0) {
      await prisma.stand.updateMany({
        where: {
          id: { in: standsToRelease },
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
      for (const id of standsToRelease) {
        const stand = stands.find((st) => st.id === id)
        if (stand) {
          stand.status = 'FREE'
          stand.orderId = null
          stand.reservedAt = null
          stand.reservedUntil = null
        }
      }
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
