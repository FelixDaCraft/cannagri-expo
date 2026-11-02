import type { Edition } from '@prisma/client'

export const MAX_TICKETS_PER_ORDER = 20
/** Plafond par formule dans le sélecteur de la billetterie. */
export const MAX_TICKETS_PER_TYPE = 10
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
export function buildTicketItems(
  raw: unknown,
  prices: TicketPrices,
  options: { requireAttendeeName?: boolean } = {}
): TicketItem[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new TicketItemsError('Aucun billet sélectionné')

  const items: TicketItem[] = []
  for (const entry of raw as Record<string, unknown>[]) {
    if (!entry || typeof entry !== 'object') throw new TicketItemsError('Billet invalide')
    const type = parseKind(entry?.ticketType ?? entry?.type)
    const quantity = entry?.quantity ?? 1
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      throw new TicketItemsError('Quantité de billets invalide')
    }
    const attendeeName =
      typeof entry?.attendeeName === 'string' ? entry.attendeeName.trim().slice(0, MAX_ATTENDEE_NAME_LENGTH) : ''
    if (options.requireAttendeeName && !attendeeName) {
      throw new TicketItemsError('Indiquez le nom de chaque participant')
    }
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

export interface TicketSelection {
  standard: number
  flex: number
}

type SelectionParams = URLSearchParams | Record<string, string | string[] | undefined>

function readQuantity(params: SelectionParams, key: keyof TicketSelection): number {
  const raw = params instanceof URLSearchParams ? params.get(key) : params[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  // Uniquement des chiffres : « 1.5 », « 1e1 », « -1 » ou « 0x3 » sont ignorés
  if (typeof value !== 'string' || !/^\d{1,4}$/.test(value)) return 0
  return Math.min(Number(value), MAX_TICKETS_PER_TYPE)
}

/** Quantités pré-remplies par l'adresse `/billetterie?standard=<n>&flex=<n>`, bornées. */
export function parseTicketSelection(params: SelectionParams): TicketSelection {
  const standard = readQuantity(params, 'standard')
  const flex = Math.min(readQuantity(params, 'flex'), MAX_TICKETS_PER_ORDER - standard)
  return { standard, flex }
}

/** « 15 € » pour un montant rond, « 12,50 € » sinon. */
export function formatTicketPrice(amount: number): string {
  const whole = Number.isInteger(amount)
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount)
}
