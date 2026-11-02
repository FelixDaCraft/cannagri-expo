import { buildTicketingHref, clampTicketQuantity, MAX_TICKETS_PER_TYPE } from '@/lib/home/tickets'

describe('clampTicketQuantity', () => {
  it('garde les entiers entre 0 et le maximum', () => {
    expect(clampTicketQuantity(3)).toBe(3)
    expect(clampTicketQuantity(-1)).toBe(0)
    expect(clampTicketQuantity(MAX_TICKETS_PER_TYPE + 5)).toBe(MAX_TICKETS_PER_TYPE)
  })

  it('arrondit vers le bas et ignore les valeurs non numériques', () => {
    expect(clampTicketQuantity(2.7)).toBe(2)
    expect(clampTicketQuantity(Number.NaN)).toBe(0)
  })
})

describe('buildTicketingHref', () => {
  it('mène à la billetterie sans paramètre quand rien n’est choisi', () => {
    expect(buildTicketingHref({ standard: 0, flex: 0 })).toBe('/billetterie')
  })

  it('transmet les deux quantités (contrat avec la billetterie)', () => {
    expect(buildTicketingHref({ standard: 2, flex: 0 })).toBe('/billetterie?standard=2&flex=0')
    expect(buildTicketingHref({ standard: 1, flex: 3 })).toBe('/billetterie?standard=1&flex=3')
  })

  it('borne les quantités transmises', () => {
    expect(buildTicketingHref({ standard: 99, flex: -2 })).toBe(
      `/billetterie?standard=${MAX_TICKETS_PER_TYPE}&flex=0`
    )
  })
})
