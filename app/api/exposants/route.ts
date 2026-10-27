import { NextResponse } from 'next/server'
import { getActiveEdition } from '@/lib/editions'
import { getEditionExhibitors } from '@/lib/editions/exhibitors'

// GET /api/exposants - Get all exhibitors (from sold stands with linked PRO accounts or Sponsors)
export async function GET() {
  try {
    const edition = await getActiveEdition()
    const exposants = await getEditionExhibitors(edition.id)

    // Get category counts
    const categoryCounts = exposants.reduce(
      (acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      success: true,
      data: exposants,
      categories: [
        { slug: 'all', name: 'Tous', count: exposants.length },
        { slug: 'PRODUCTEURS', name: 'Producteurs CBD', count: categoryCounts['PRODUCTEURS'] || 0 },
        { slug: 'MATERIEL', name: 'Matériel', count: categoryCounts['MATERIEL'] || 0 },
        { slug: 'LIFESTYLE', name: 'Lifestyle', count: categoryCounts['LIFESTYLE'] || 0 },
        { slug: 'SERVICE', name: 'Services', count: categoryCounts['SERVICE'] || 0 },
      ],
    })
  } catch (error) {
    console.error('Error fetching exposants:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des exposants' },
      { status: 500 }
    )
  }
}
