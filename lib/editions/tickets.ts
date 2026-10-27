import type { Edition } from '@prisma/client'

export const MAX_TICKETS_PER_ORDER = 20
const MAX_ATTENDEE_NAME_LENGTH = 100

export type TicketKind = 'STANDARD' | 'FLEX'

/** Ligne de billet canonique, stockée dans Order.notes puis relue par le webhook de paiement. */
export interface TicketItem {
  type: TicketKind
  price: number
  quantity: 1
  attendeeName: string
}

export class TicketItemsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TicketItemsError'
  }
}

type TicketPrices = Pick<Edition, 'standardTicketPrice' | 'flexTicketPrice'>

function parseKind(value: unknown): TicketKind {
  const kind = typeof value === 'string' ? value.toUpperCase() : ''
  if (kind === 'STANDARD' || kind === 'FLEX') return kind
  throw new TicketItemsError('Type de billet invalide')
}

/**
 * Reconstruit les billets d'une commande à partir de la saisie du client.
 * Le prix vient toujours de l'édition : le montant envoyé par le navigateur est ignoré.
 */
export function buildTicketItems(raw: unknown, prices: TicketPrices): TicketItem[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new TicketItemsError('Aucun billet sélectionné')

  const items: TicketItem[] = []
  for (const entry of raw as Record<string, unknown>[]) {
    const type = parseKind(entry?.ticketType ?? entry?.type)
    const quantity = entry?.quantity ?? 1
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      throw new TicketItemsError('Quantité de billets invalide')
    }
    const attendeeName =
      typeof entry?.attendeeName === 'string' ? entry.attendeeName.trim().slice(0, MAX_ATTENDEE_NAME_LENGTH) : ''
    const price = type === 'FLEX' ? prices.flexTicketPrice : prices.standardTicketPrice

    for (let i = 0; i < quantity; i++) {
      items.push({ type, price, quantity: 1, attendeeName })
      if (items.length > MAX_TICKETS_PER_ORDER) {
        throw new TicketItemsError(`Maximum ${MAX_TICKETS_PER_ORDER} billets par commande`)
      }
    }
  }
  return items
}
