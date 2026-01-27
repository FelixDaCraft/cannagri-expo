import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import ProgrammeClient from './ProgrammeClient'
import { Translations } from '@/lib/translation'

interface Speaker {
  id: string
  name: string
  title: string
  company: string
  photo: string
  bio: string
}

async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: [
        { startAt: 'asc' },
        { displayOrder: 'asc' },
      ],
    })
    // Transform Prisma JsonValue speakers to typed Speaker[]
    return events.map(event => ({
      ...event,
      speakers: Array.isArray(event.speakers) ? (event.speakers as unknown as Speaker[]) : [],
      titleTranslations: event.titleTranslations as Translations | null,
      descriptionTranslations: event.descriptionTranslations as Translations | null,
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export default async function ProgrammePage() {
  const events = await getEvents()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr'
  return <ProgrammeClient events={events} locale={locale} />
}
