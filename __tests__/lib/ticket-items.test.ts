import { buildTicketItems, TicketItemsError, MAX_TICKETS_PER_ORDER } from '@/lib/ticket-items'

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
})
