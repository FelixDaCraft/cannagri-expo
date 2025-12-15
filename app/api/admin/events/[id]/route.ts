import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/admin/events/[id] - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'événement' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/events/[id] - Update an event
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      description,
      type,
      startAt,
      endAt,
      location,
      speakers,
      isPlatinumCBDCup,
      isHighlighted,
      displayOrder,
    } = body

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    // Check if new slug conflicts with another event
    if (slug && slug !== existingEvent.slug) {
      const slugConflict = await prisma.event.findUnique({
        where: { slug },
      })
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Ce slug existe déjà' },
          { status: 400 }
        )
      }
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(type !== undefined && { type }),
        ...(startAt !== undefined && { startAt: new Date(startAt) }),
        ...(endAt !== undefined && { endAt: new Date(endAt) }),
        ...(location !== undefined && { location: location || null }),
        ...(speakers !== undefined && { speakers }),
        ...(isPlatinumCBDCup !== undefined && { isPlatinumCBDCup }),
        ...(isHighlighted !== undefined && { isHighlighted }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    })

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'événement' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Événement supprimé' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'événement' },
      { status: 500 }
    )
  }
}
