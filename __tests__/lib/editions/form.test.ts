import { parseParisDateTime, toParisDateTimeInput, parseEditionForm } from '@/lib/editions/form'

describe('parseParisDateTime', () => {
  it("convertit une heure de Paris en hiver (UTC+1)", () => {
    expect(parseParisDateTime('2026-03-28T09:00')?.toISOString()).toBe('2026-03-28T08:00:00.000Z')
  })

  it("convertit une heure de Paris en été (UTC+2)", () => {
    expect(parseParisDateTime('2027-04-10T09:00')?.toISOString()).toBe('2027-04-10T07:00:00.000Z')
  })

  it('accepte une date seule (minuit à Paris)', () => {
    expect(parseParisDateTime('2027-01-15')?.toISOString()).toBe('2027-01-14T23:00:00.000Z')
  })

  it('renvoie null pour une saisie vide et lève une erreur pour une saisie invalide', () => {
    expect(parseParisDateTime('')).toBeNull()
    expect(parseParisDateTime(null)).toBeNull()
    expect(() => parseParisDateTime('pas une date')).toThrow('Date invalide')
  })
})

describe('toParisDateTimeInput', () => {
  it("restitue la valeur d'un champ datetime-local à l'heure de Paris", () => {
    expect(toParisDateTimeInput('2027-04-10T07:00:00.000Z')).toBe('2027-04-10T09:00')
    expect(toParisDateTimeInput(null)).toBe('')
  })

  it('fait un aller-retour sans dérive', () => {
    const value = '2026-10-25T02:30' // nuit du passage à l'heure d'hiver
    expect(toParisDateTimeInput(parseParisDateTime(value)!)).toBe(value)
  })
})

describe('parseEditionForm', () => {
  it('normalise les champs du formulaire', () => {
    expect(
      parseEditionForm({
        year: '2027',
        startAt: '2027-04-10T09:00',
        endAt: '2027-04-10T19:00',
        venueName: '  Parc des Expositions  ',
        city: '',
        standardTicketPrice: '18',
        flexTicketPrice: 30,
        accessParking: 'Parking P1',
        status: 'ACTIVE',
        injected: 'ignored',
      })
    ).toEqual({
      year: 2027,
      startAt: new Date('2027-04-10T07:00:00.000Z'),
      endAt: new Date('2027-04-10T17:00:00.000Z'),
      venueName: 'Parc des Expositions',
      city: null,
      standardTicketPrice: 18,
      flexTicketPrice: 30,
      accessParking: 'Parking P1',
    })
  })

  it("n'inclut que les champs présents (mise à jour partielle)", () => {
    expect(parseEditionForm({ city: 'Rennes' })).toEqual({ city: 'Rennes' })
  })

  it('refuse un prix non numérique', () => {
    expect(() => parseEditionForm({ standardTicketPrice: 'gratuit' })).toThrow('Prix invalide')
  })
})
