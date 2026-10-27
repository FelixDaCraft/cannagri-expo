import { getActiveEdition } from '@/lib/editions'
import { getEditionEvents } from '@/lib/editions/content'
import { cookies } from 'next/headers'
import ProgrammeClient from './ProgrammeClient'

async function getEvents(editionId: string) {
  try {
    return await getEditionEvents(editionId)
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export default async function ProgrammePage() {
  const edition = await getActiveEdition()
  const events = await getEvents(edition.id)
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr'
  return <ProgrammeClient events={events} locale={locale} />
}
