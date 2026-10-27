import { EditionValidationError, type EditionInput } from './service'

const TIME_ZONE = 'Europe/Paris'

/** Décalage (en ms) entre l'heure de Paris et UTC à un instant donné. */
function parisOffsetMs(instant: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(instant))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return asUtc - instant
}

/**
 * Interprète la valeur d'un champ date / datetime-local comme une heure de Paris.
 * "2027-04-10T09:00" -> 2027-04-10T07:00Z (heure d'été).
 */
export function parseParisDateTime(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value)
  if (!match) throw new EditionValidationError([`Date invalide : ${String(value)}`])

  const [, y, mo, d, h = '0', mi = '0'] = match
  const wallClock = Date.UTC(+y, +mo - 1, +d, +h, +mi)
  // Deux passes : le décalage dépend de l'instant (changement d'heure)
  let instant = wallClock - parisOffsetMs(wallClock)
  instant = wallClock - parisOffsetMs(instant)
  return new Date(instant)
}

/** Valeur à placer dans un champ datetime-local, à l'heure de Paris. */
export function toParisDateTimeInput(value: Date | string | null | undefined): string {
  if (!value) return ''
  const instant = new Date(value).getTime()
  return new Date(instant + parisOffsetMs(instant)).toISOString().slice(0, 16)
}

const TEXT_FIELDS = [
  'venueName', 'address', 'city', 'posterUrl',
  'accessTransport', 'accessParking', 'accessInfo', 'ticketInfo', 'archiveSummary',
] as const
const DATE_FIELDS = ['startAt', 'endAt', 'ticketingOpenAt', 'ticketingCloseAt'] as const
const PRICE_FIELDS = ['standardTicketPrice', 'flexTicketPrice'] as const

/**
 * Convertit le corps JSON du formulaire d'édition en saisie typée.
 * Seuls les champs connus et présents sont repris (liste blanche).
 */
export function parseEditionForm(body: Record<string, unknown>): Partial<EditionInput> {
  const input: Partial<EditionInput> = {}

  if (body.year !== undefined) input.year = Number(body.year)

  for (const field of DATE_FIELDS) {
    if (body[field] !== undefined) input[field] = parseParisDateTime(body[field])
  }
  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined) {
      const text = typeof body[field] === 'string' ? (body[field] as string).trim() : ''
      input[field] = text || null
    }
  }
  for (const field of PRICE_FIELDS) {
    if (body[field] !== undefined) {
      const price = Number(body[field])
      if (body[field] === '' || !Number.isFinite(price)) {
        throw new EditionValidationError([`Prix invalide : ${String(body[field])}`])
      }
      input[field] = price
    }
  }
  return input
}
