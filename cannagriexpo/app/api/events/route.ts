import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events - Get all events for public display
export async function GET() {
  try {
    const events = await prisma.event.findMany({
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
