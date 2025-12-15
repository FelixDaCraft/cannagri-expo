import { prisma } from '@/lib/prisma'
import ProgrammeClient from './ProgrammeClient'

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
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export default async function ProgrammePage() {
  const events = await getEvents()
  return <ProgrammeClient events={events} />
}
