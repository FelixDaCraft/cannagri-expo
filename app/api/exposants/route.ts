import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/exposants - Get all exhibitors (from sold stands with linked PRO accounts)
export async function GET() {
  try {
    // Fetch all sold/reserved stands with linked PRO accounts
    const stands = await prisma.stand.findMany({
      where: {
        status: {
          in: ['SOLD', 'RESERVED'],
        },
        proId: {
          not: null,
        },
      },
      include: {
        pro: {
          select: {
            id: true,
            companyName: true,
            companyDescription: true,
            companyLogo: true,
            companyWebsite: true,
            businessType: true,
            isApproved: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    })

    // Filter only approved PRO accounts and transform data
    const exposants = stands
      .filter((stand) => stand.pro?.isApproved)
      .map((stand) => ({
        id: stand.pro!.id,
        name: stand.exhibitorName || stand.pro!.companyName || 'Exposant',
        description: stand.pro!.companyDescription,
        logoUrl: stand.pro!.companyLogo,
        websiteUrl: stand.pro!.companyWebsite,
        standNumber: stand.number.toString(),
        category: stand.pro!.businessType || 'SERVICE',
        categoryLabel: getCategoryLabel(stand.pro!.businessType),
      }))

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

function getCategoryLabel(businessType: string | null): string {
  switch (businessType) {
    case 'PRODUCTEURS':
      return 'Producteurs CBD'
    case 'MATERIEL':
      return 'Matériel de Culture'
    case 'LIFESTYLE':
      return 'Lifestyle & Food'
    case 'SERVICE':
      return 'Services'
    default:
      return 'Autre'
  }
}
