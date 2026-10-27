import type { BusinessType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

export interface Exhibitor {
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

const exhibitorStandSelect = {
  id: true,
  number: true,
  proId: true,
  exhibitorName: true,
  exhibitorDescription: true,
  exhibitorLogo: true,
  exhibitorWebsite: true,
  exhibitorCategory: true,
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
} as const

export interface ExhibitorStand {
  id: string
  number: number
  proId: string | null
  exhibitorName: string | null
  exhibitorDescription: string | null
  exhibitorLogo: string | null
  exhibitorWebsite: string | null
  exhibitorCategory: BusinessType | null
  pro: {
    id: string
    companyName: string | null
    companyDescription: string | null
    companyDescriptionTranslations: unknown
    companyLogo: string | null
    companyWebsite: string | null
    businessType: BusinessType | null
    isApproved: boolean
  } | null
  sponsor: {
    id: string
    name: string
    exhibitorDescription: string | null
    exhibitorDescriptionTranslations: unknown
    logoUrl: string | null
    websiteUrl: string | null
    exhibitorCategory: BusinessType | null
    isActive: boolean
  } | null
}

export function getCategoryLabel(businessType: string | null): string {
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

/** Fiches exposants à partir des stands occupés (compte pro, sponsor ou saisie directe de l'admin). */
export function toExhibitors(stands: ExhibitorStand[]): Exhibitor[] {
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
    // If stand has direct exhibitor info (admin-assigned, no PRO/Sponsor)
    else if (stand.exhibitorName && !stand.proId && !stand.sponsor) {
      exposants.push({
        id: stand.id,
        name: stand.exhibitorName,
        description: stand.exhibitorDescription,
        descriptionTranslations: null,
        logoUrl: stand.exhibitorLogo,
        websiteUrl: stand.exhibitorWebsite,
        standNumber: stand.number.toString(),
        category: stand.exhibitorCategory || 'SERVICE',
        categoryLabel: getCategoryLabel(stand.exhibitorCategory),
      })
    }
  }
  return exposants
}

/** Exposants d'une édition (stands vendus ou réservés), triés par numéro de stand. */
export async function getEditionExhibitors(editionId: string): Promise<Exhibitor[]> {
  const stands = await prisma.stand.findMany({
    where: { editionId, status: { in: ['SOLD', 'RESERVED'] } },
    select: exhibitorStandSelect,
    orderBy: { number: 'asc' },
  })
  return toExhibitors(stands)
}
