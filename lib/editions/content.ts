import { prisma } from '@/lib/prisma'
import type { Translations } from '@/lib/translation'

export interface Speaker {
  id: string
  name: string
  title: string
  company: string
  photo: string
  bio: string
}

/** Programme d'une édition, prêt pour ProgrammeClient. */
export async function getEditionEvents(editionId: string) {
  const events = await prisma.event.findMany({
    where: { editionId },
    orderBy: [{ startAt: 'asc' }, { displayOrder: 'asc' }],
  })
  // Transform Prisma JsonValue speakers to typed Speaker[]
  return events.map((event) => ({
    ...event,
    speakers: Array.isArray(event.speakers) ? (event.speakers as unknown as Speaker[]) : [],
    titleTranslations: event.titleTranslations as Translations | null,
    descriptionTranslations: event.descriptionTranslations as Translations | null,
  }))
}

/** Sponsors visibles d'une édition. */
export function getEditionSponsors(editionId: string) {
  return prisma.sponsor.findMany({
    where: { editionId, isActive: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  })
}

/** Photos d'une édition pour la médiathèque. */
export function getEditionMedia(editionId: string) {
  return prisma.media.findMany({
    where: { editionId },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, imageUrl: true, caption: true, category: true, altText: true },
  })
}

/** Noms des exposants d'une édition (stands vendus), pour la page d'archive. */
export async function getEditionExhibitorNames(editionId: string): Promise<string[]> {
  const stands = await prisma.stand.findMany({
    where: { editionId, status: 'SOLD' },
    select: {
      exhibitorName: true,
      pro: { select: { companyName: true } },
      sponsor: { select: { name: true } },
    },
  })
  const names = stands
    .map((s) => s.sponsor?.name || s.exhibitorName || s.pro?.companyName)
    .filter((name): name is string => Boolean(name))
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, 'fr'))
}
