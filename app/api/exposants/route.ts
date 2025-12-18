import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

interface Exhibitor {
  id: string
  name: string
  description: string | null
  descriptionTranslations: Translations | null
  logoUrl: string | null
  websiteUrl: string | null
  standNumber: string
  category: string
  categoryLabel: string
}

// GET /api/exposants - Get all exhibitors (from sold stands with linked PRO accounts or Sponsors)
export async function GET() {
  try {
    // Fetch all sold/reserved stands with linked PRO accounts or Sponsors
    const stands = await prisma.stand.findMany({
      where: {
        status: {
          in: ['SOLD', 'RESERVED'],
        },
      },
      include: {
        pro: {
          select: {
            id: true,
            companyName: true,
            companyDescription: true,
            companyDescriptionTranslations: true,
            companyLogo: true,
            companyWebsite: true,
            businessType: true,
            isApproved: true,
          },
        },
        sponsor: {
          select: {
            id: true,
            name: true,
            exhibitorDescription: true,
            exhibitorDescriptionTranslations: true,
            logoUrl: true,
            websiteUrl: true,
            exhibitorCategory: true,
            isActive: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    })

    const exposants: Exhibitor[] = []

    for (const stand of stands) {
      // If stand has an approved PRO account
      if (stand.pro?.isApproved) {
        exposants.push({
          id: stand.pro.id,
          name: stand.exhibitorName || stand.pro.companyName || 'Exposant',
          description: stand.pro.companyDescription,
          descriptionTranslations: stand.pro.companyDescriptionTranslations as Translations | null,
          logoUrl: stand.pro.companyLogo,
          websiteUrl: stand.pro.companyWebsite,
          standNumber: stand.number.toString(),
          category: stand.pro.businessType || 'SERVICE',
          categoryLabel: getCategoryLabel(stand.pro.businessType),
        })
      }
      // If stand has an active Sponsor (and no PRO to avoid duplicates)
      else if (stand.sponsor?.isActive && !stand.proId) {
        exposants.push({
          id: stand.sponsor.id,
          name: stand.exhibitorName || stand.sponsor.name,
          description: stand.sponsor.exhibitorDescription,
          descriptionTranslations: stand.sponsor.exhibitorDescriptionTranslations as Translations | null,
          logoUrl: stand.sponsor.logoUrl,
          websiteUrl: stand.sponsor.websiteUrl,
          standNumber: stand.number.toString(),
          category: stand.sponsor.exhibitorCategory || 'SERVICE',
          categoryLabel: getCategoryLabel(stand.sponsor.exhibitorCategory),
        })
      }
    }

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
