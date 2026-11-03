import { NextResponse } from 'next/server'
import { getActiveEdition } from '@/lib/editions'
import { editionNumber } from '@/lib/editions/number'

const iso = (d: Date | null) => (d ? d.toISOString() : null)

// GET /api/edition : l'édition en ligne (utilisée par InstaPlanner). Champs publics uniquement.
export async function GET() {
  try {
    const edition = await getActiveEdition()
    return NextResponse.json({
      year: edition.year,
      number: editionNumber(edition.year),
      startAt: iso(edition.startAt),
      endAt: iso(edition.endAt),
      venueName: edition.venueName,
      address: edition.address,
      city: edition.city,
      standardTicketPrice: edition.standardTicketPrice,
      flexTicketPrice: edition.flexTicketPrice,
      ticketingOpenAt: iso(edition.ticketingOpenAt),
      ticketingCloseAt: iso(edition.ticketingCloseAt),
      posterUrl: edition.posterUrl,
    })
  } catch (error) {
    console.error('Error fetching edition:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération de l’édition' }, { status: 500 })
  }
}
