import {
  buildTicketItems,
  parseTicketSelection,
  TicketItemsError,
  MAX_TICKETS_PER_ORDER,
  MAX_TICKETS_PER_TYPE,
} from '@/lib/editions/tickets'

const edition = { standardTicketPrice: 18, flexTicketPrice: 30 }

describe('buildTicketItems', () => {
  it("applique les tarifs de l'édition, jamais le prix envoyé par le client", () => {
    const items = buildTicketItems(
      [
        { ticketType: 'STANDARD', price: 0.01, quantity: 1, attendeeName: 'Alice' },
        { ticketType: 'FLEX', price: 1, quantity: 1, attendeeName: 'Bob' },
      ],
      edition
    )
    expect(items).toEqual([
      { type: 'STANDARD', price: 18, quantity: 1, attendeeName: 'Alice' },
      { type: 'FLEX', price: 30, quantity: 1, attendeeName: 'Bob' },
    ])
  })

  it('accepte aussi le champ historique "type"', () => {
    expect(buildTicketItems([{ type: 'flex', attendeeName: 'Bob' }], edition)[0].type).toBe('FLEX')
  })

  it('éclate les quantités en billets nominatifs unitaires', () => {
    const items = buildTicketItems([{ ticketType: 'STANDARD', quantity: 3, attendeeName: 'Alice' }], edition)
    expect(items).toHaveLength(3)
    expect(items.every((i) => i.quantity === 1 && i.attendeeName === 'Alice')).toBe(true)
  })

  it('nettoie et tronque le nom du détenteur', () => {
    const [item] = buildTicketItems([{ ticketType: 'STANDARD', attendeeName: `  ${'a'.repeat(200)}  ` }], edition)
    expect(item.attendeeName).toHaveLength(100)
  })

  it('refuse un type de billet inconnu', () => {
    expect(() => buildTicketItems([{ ticketType: 'VIP', attendeeName: 'Eve' }], edition)).toThrow(TicketItemsError)
  })

  it('refuse une quantité invalide', () => {
    for (const quantity of [0, -1, 1.5, 'deux']) {
      expect(() => buildTicketItems([{ ticketType: 'STANDARD', quantity, attendeeName: 'Eve' }], edition)).toThrow(
        TicketItemsError
      )
    }
  })

  it('refuse une commande vide ou qui dépasse le plafond', () => {
    expect(() => buildTicketItems([], edition)).toThrow(TicketItemsError)
    expect(() => buildTicketItems('nope', edition)).toThrow(TicketItemsError)
    expect(() =>
      buildTicketItems([{ ticketType: 'STANDARD', quantity: MAX_TICKETS_PER_ORDER + 1, attendeeName: 'Eve' }], edition)
    ).toThrow(TicketItemsError)
  })

  it('exige le nom de chaque participant quand les billets sont nominatifs', () => {
    expect(() =>
      buildTicketItems([{ ticketType: 'STANDARD', attendeeName: '   ' }], edition, { requireAttendeeName: true })
    ).toThrow(TicketItemsError)
    expect(
      buildTicketItems([{ ticketType: 'STANDARD', attendeeName: 'Alice' }], edition, { requireAttendeeName: true })
    ).toHaveLength(1)
  })

  it('refuse une entrée qui n’est pas un objet', () => {
    expect(() => buildTicketItems([null], edition)).toThrow(TicketItemsError)
  })
})

describe('parseTicketSelection', () => {
  const params = (query: string) => new URLSearchParams(query)

  it("reprend les quantités passées dans l'adresse", () => {
    expect(parseTicketSelection(params('standard=2&flex=1'))).toEqual({ standard: 2, flex: 1 })
  })

  it('accepte aussi un objet de paramètres (page serveur)', () => {
    expect(parseTicketSelection({ standard: '3', flex: ['1', '4'] })).toEqual({ standard: 3, flex: 1 })
  })

  it('met à zéro ce qui est absent ou invalide', () => {
    expect(parseTicketSelection(params(''))).toEqual({ standard: 0, flex: 0 })
    for (const value of ['-1', '1.5', 'deux', '', '0x3', '1e1', ' 2']) {
      expect(parseTicketSelection(params(`standard=${encodeURIComponent(value)}`)).standard).toBe(0)
    }
  })

  it('borne chaque formule et le total de la commande', () => {
    expect(parseTicketSelection(params('standard=999')).standard).toBe(MAX_TICKETS_PER_TYPE)
    const both = parseTicketSelection(params(`standard=${MAX_TICKETS_PER_TYPE}&flex=${MAX_TICKETS_PER_TYPE}`))
    expect(both.standard + both.flex).toBeLessThanOrEqual(MAX_TICKETS_PER_ORDER)
  })
})
