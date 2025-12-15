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

async function getSponsors() {
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
    return sponsors
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return []
  }
}

async function getStats() {
  try {
    // Count conferences
    const conferenceCount = await prisma.event.count({
      where: { type: 'CONFERENCE' },
    })

    // Get all events to count speakers
    const events = await prisma.event.findMany({
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
    const standCount = await prisma.stand.count()

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

export default async function HomePage() {
  const [sponsors, stats] = await Promise.all([getSponsors(), getStats()])

  return (
    <>
      <HeroSection />
      {sponsors.length > 0 ? (
        <SponsorsArticles sponsors={sponsors} />
      ) : (
        <SponsorsArticlesPlaceholder />
      )}
      <TicketSection />
      <PillarsSection />
      <ProgramHighlight stats={stats} />
      <PartnersGrid sponsors={sponsors} />
    </>
  )
}
