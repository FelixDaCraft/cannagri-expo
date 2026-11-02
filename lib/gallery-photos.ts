import { prisma } from '@/lib/prisma'
import type { GalleryPhoto } from '@/components/gallery/PhotoGallery'

interface MediaRow {
  id: string
  imageUrl: string
  thumbnailUrl: string | null
  caption: string | null
  altText: string | null
}

/** Photo prête pour la galerie : texte alternatif, sinon légende, sinon libellé de repli */
export function toGalleryPhoto(row: MediaRow, fallbackAlt: string): GalleryPhoto {
  return {
    id: row.id,
    src: row.imageUrl,
    thumb: row.thumbnailUrl,
    alt: row.altText?.trim() || row.caption?.trim() || fallbackAlt,
    caption: row.caption?.trim() || null,
  }
}

/** Photos des éditions publiées (en ligne ou archivées), regroupées par année, la plus récente d'abord */
export async function getPublishedPhotosByYear(): Promise<{ year: number; rows: MediaRow[] }[]> {
  const rows = await prisma.media.findMany({
    where: { edition: { status: { in: ['ACTIVE', 'ARCHIVED'] } } },
    orderBy: [{ edition: { year: 'desc' } }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, imageUrl: true, thumbnailUrl: true, caption: true, altText: true, edition: { select: { year: true } } },
  })
  const byYear = new Map<number, MediaRow[]>()
  for (const { edition, ...row } of rows) {
    byYear.set(edition.year, [...(byYear.get(edition.year) ?? []), row])
  }
  return Array.from(byYear, ([year, photos]) => ({ year, rows: photos }))
}
