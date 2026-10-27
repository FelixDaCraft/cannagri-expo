import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveEdition } from '@/lib/editions'

// GET /api/events - Get all events for public display
export async function GET() {
  try {
    const edition = await getActiveEdition()
    const events = await prisma.event.findMany({
      where: { editionId: edition.id },
      orderBy: [
        { startAt: 'asc' },
        { displayOrder: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: events,
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    )
  }
}
