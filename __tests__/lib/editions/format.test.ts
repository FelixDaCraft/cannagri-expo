import {
  formatEditionDate,
  formatEditionHours,
  formatEventTime,
  toIcsDateTime,
  isTicketingOpen,
  toEditionView,
} from '@/lib/editions/format'

// 2026-03-28 9h00 -> 19h00 heure de Paris (UTC+1 en mars avant le changement d'heure)
const START = new Date('2026-03-28T08:00:00Z')
const END = new Date('2026-03-28T18:00:00Z')

describe('formatEditionDate', () => {
  it('formate la date en français, fuseau Europe/Paris', () => {
    expect(formatEditionDate(START)).toBe('28 mars 2026')
  })

  it('respecte la locale demandée', () => {
    expect(formatEditionDate(START, 'en')).toBe('March 28, 2026')
  })

  it('accepte une date ISO (données sérialisées pour le client)', () => {
    expect(formatEditionDate(START.toISOString())).toBe('28 mars 2026')
  })

  it("utilise le fuseau de Paris, pas celui du serveur, près de minuit", () => {
    // 23h30 UTC le 27 = 00h30 le 28 à Paris
    expect(formatEditionDate(new Date('2026-03-27T23:30:00Z'))).toBe('28 mars 2026')
  })

  it('renvoie null si la date est inconnue (édition historique)', () => {
    expect(formatEditionDate(null)).toBeNull()
  })
})

describe('formatEditionHours', () => {
  it('formate la plage horaire à la française', () => {
    expect(formatEditionHours(START, END)).toBe('9h00 - 19h00')
  })

  it("renvoie seulement l'heure d'ouverture sans heure de fin", () => {
    expect(formatEditionHours(START, null)).toBe('9h00')
  })

  it('renvoie null sans heure de début', () => {
    expect(formatEditionHours(null, END)).toBeNull()
  })
})

describe('toIcsDateTime', () => {
  it('produit un horodatage iCalendar UTC', () => {
    expect(toIcsDateTime(START)).toBe('20260328T080000Z')
  })
})

describe('isTicketingOpen', () => {
  const edition = {
    ticketingOpenAt: new Date('2026-01-15T00:00:00Z'),
    ticketingCloseAt: new Date('2026-03-27T23:00:00Z'),
  }

  it("est fermée avant l'ouverture", () => {
    expect(isTicketingOpen(edition, new Date('2026-01-14T12:00:00Z'))).toBe(false)
  })

  it('est ouverte pendant la période de vente', () => {
    expect(isTicketingOpen(edition, new Date('2026-02-01T12:00:00Z'))).toBe(true)
  })

  it('est fermée après la clôture', () => {
    expect(isTicketingOpen(edition, new Date('2026-03-28T08:00:00Z'))).toBe(false)
  })

  it("est ouverte quand aucune borne n'est définie", () => {
    expect(isTicketingOpen({ ticketingOpenAt: null, ticketingCloseAt: null }, new Date())).toBe(true)
  })
})

describe('toEditionView', () => {
  it('sérialise les dates en ISO pour les composants client', () => {
    const view = toEditionView({
      id: 'e1',
      year: 2026,
      status: 'ACTIVE',
      startAt: START,
      endAt: END,
      venueName: "L'Agronaute",
      address: '2 Rue du Sénégal, 44200 Nantes',
      city: 'Nantes',
      posterUrl: '/images/affiche-2026.png',
      ticketingOpenAt: null,
      ticketingCloseAt: null,
      standardTicketPrice: 15,
      flexTicketPrice: 25,
      accessTransport: null,
      accessParking: null,
      accessInfo: null,
      ticketInfo: null,
      archiveSummary: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    expect(view.startAt).toBe('2026-03-28T08:00:00.000Z')
    expect(view.ticketingOpenAt).toBeNull()
    expect(view.dateLabel).toBe('28 mars 2026')
    expect(view.hoursLabel).toBe('9h00 - 19h00')
    expect(view).not.toHaveProperty('createdAt')
    expect(() => JSON.stringify(view)).not.toThrow()
  })
})

describe('formatEventTime', () => {
  it("affiche l'heure de Paris d'un créneau du programme", () => {
    expect(formatEventTime(new Date('2026-03-28T09:30:00Z'))).toBe('10h30')
  })
})
