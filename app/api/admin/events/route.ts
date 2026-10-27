import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getAdminEdition } from '@/lib/editions/admin'

// GET /api/admin/events - Get all events (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const edition = await getAdminEdition()
    const events = await prisma.event.findMany({
      where: { editionId: edition.id },
      orderBy: [
        { startAt: 'asc' },
        { displayOrder: 'asc' },
      ],
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    )
  }
}

// POST /api/admin/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR'].includes(session.user.role)) {
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

    // Validate required fields
    if (!title || !slug || !type || !startAt || !endAt) {
      return NextResponse.json(
        { error: 'Titre, slug, type, heure de début et heure de fin sont requis' },
        { status: 400 }
      )
    }

    // Check if slug already exists in this edition
    const edition = await getAdminEdition()
    const existingEvent = await prisma.event.findFirst({
      where: { editionId: edition.id, slug },
    })

    if (existingEvent) {
      return NextResponse.json(
        { error: 'Ce slug existe déjà' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        editionId: edition.id,
        title,
        slug,
        description: description || null,
        type,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        location: location || null,
        speakers: speakers || [],
        isPlatinumCBDCup: isPlatinumCBDCup || false,
        isHighlighted: isHighlighted || false,
        displayOrder: displayOrder || 0,
      },
    })

    return NextResponse.json({ success: true, data: event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    )
  }
}
