import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sponsors - Get all active sponsors grouped by type
export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: sponsors,
    })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sponsors' },
      { status: 500 }
    )
  }
}
