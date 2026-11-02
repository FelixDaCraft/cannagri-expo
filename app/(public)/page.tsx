import type { Metadata } from 'next'
import {
  HeroSection,
  TicketSection,
  MenuSection,
  PillarsSection,
  ProgramHighlight,
  GalleryPreview,
  ProSection,
  SponsorsArticles,
  PartnersGrid,
  type GalleryPreviewPhoto,
} from '@/components/home'
import { prisma } from '@/lib/prisma'
import { getActiveEdition, formatEditionDate } from '@/lib/editions'
import { getEditionSponsors } from '@/lib/editions/content'
import { pickGalleryPreview } from '@/lib/home/gallery-preview'

async function getSponsors(editionId: string) {
  try {
    return await getEditionSponsors(editionId)
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return []
  }
}

/** Cinq photos variées des éditions publiées, pour l'aperçu de la galerie */
async function getGalleryPreview(): Promise<GalleryPreviewPhoto[]> {
  try {
    const rows = await prisma.media.findMany({
      where: { edition: { status: { in: ['ACTIVE', 'ARCHIVED'] } } },
      orderBy: [{ edition: { year: 'desc' } }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: 60,
      select: {
        id: true,
        imageUrl: true,
        thumbnailUrl: true,
        caption: true,
        altText: true,
        category: true,
        edition: { select: { year: true } },
      },
    })
    const photos = rows.map((row) => ({
      id: row.id,
      src: row.thumbnailUrl ?? row.imageUrl,
      alt: row.altText ?? row.caption ?? `Cann'Agri Expo ${row.edition.year}`,
      caption: row.caption,
      category: row.category,
      year: row.edition.year,
    }))
    return pickGalleryPreview(photos, 5)
  } catch (error) {
    console.error('Error fetching gallery preview:', error)
    return []
  }
}

// Titre et description de l'édition en ligne
export async function generateMetadata(): Promise<Metadata> {
  const edition = await getActiveEdition()
  const title = `Cann'Agri Expo ${edition.year} | Salon professionnel du cannabis CBD`
  const when = [formatEditionDate(edition.startAt), [edition.venueName, edition.city].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' - ')
  const description = `Le salon professionnel du cannabis CBD fête ses 5 ans. ${when}. Producteurs, matériel de culture, conférences et remise des prix de la Platinum CBD Cup.`
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}

export default async function HomePage() {
  const edition = await getActiveEdition()
  const [sponsors, galleryPhotos] = await Promise.all([getSponsors(edition.id), getGalleryPreview()])

  return (
    <>
      <HeroSection />
      {/* « À la une » n'apparaît que si un article partenaire est publié pour l'édition */}
      <SponsorsArticles sponsors={sponsors} />
      <TicketSection />
      <MenuSection />
      <PillarsSection />
      <ProgramHighlight />
      <GalleryPreview photos={galleryPhotos} />
      {/* « Nos partenaires » n'apparaît que si des partenaires sont publiés */}
      <PartnersGrid sponsors={sponsors} />
      <ProSection />
    </>
  )
}
