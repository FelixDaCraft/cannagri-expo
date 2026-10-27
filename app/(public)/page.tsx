import type { Metadata } from 'next'
import {
  HeroSection,
  TicketSection,
  PillarsSection,
  ProgramHighlight,
  SponsorsArticles,
  SponsorsArticlesPlaceholder,
  PartnersGrid,
} from '@/components/home'
import { prisma } from '@/lib/prisma'
import { getActiveEdition, formatEditionDate } from '@/lib/editions'
import { getEditionSponsors } from '@/lib/editions/content'

async function getSponsors(editionId: string) {
  try {
    return await getEditionSponsors(editionId)
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return []
  }
}

async function getStats(editionId: string) {
  try {
    // Count conferences
    const conferenceCount = await prisma.event.count({
      where: { editionId, type: 'CONFERENCE' },
    })

    // Get all events to count speakers
    const events = await prisma.event.findMany({
      where: { editionId },
      select: {
        speakers: true,
        speakerName: true,
      },
    })

    // Count total speakers
    let speakerCount = 0
    events.forEach((event) => {
      // Count speakers from JSON array
      if (event.speakers && Array.isArray(event.speakers)) {
        speakerCount += (event.speakers as any[]).length
      }
      // Count legacy single speaker if no speakers array
      else if (event.speakerName) {
        speakerCount += 1
      }
    })

    // Count total stands
    const standCount = await prisma.stand.count({ where: { editionId } })

    return {
      conferenceCount,
      speakerCount,
      standCount,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      conferenceCount: 0,
      speakerCount: 0,
      standCount: 0,
    }
  }
}

// Titre et description de l'édition en ligne
export async function generateMetadata(): Promise<Metadata> {
  const edition = await getActiveEdition()
  const title = `Cann'Agri Expo ${edition.year} | Salon Professionnel du Chanvre CBD`
  const when = [formatEditionDate(edition.startAt), [edition.venueName, edition.city].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' - ')
  const description = `Le rendez-vous incontournable des professionnels du chanvre CBD. ${when}. Exposants, conférences, Platinum CBD Cup.`
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}

export default async function HomePage() {
  const edition = await getActiveEdition()
  const [sponsors, stats] = await Promise.all([getSponsors(edition.id), getStats(edition.id)])

  return (
    <>
      <HeroSection />
      {sponsors.length > 0 ? (
        <SponsorsArticles sponsors={sponsors} />
      ) : (
        <SponsorsArticlesPlaceholder />
      )}
      <TicketSection />
      <PillarsSection stats={stats} />
      <ProgramHighlight stats={stats} />
      <PartnersGrid sponsors={sponsors} />
    </>
  )
}
