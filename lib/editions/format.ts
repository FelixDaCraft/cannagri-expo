import type { Edition, EditionStatus } from '@prisma/client'

// Le salon a lieu en France : toutes les dates s'affichent à l'heure de Paris,
// quel que soit le fuseau du serveur.
const EVENT_TIME_ZONE = 'Europe/Paris'

type DateInput = Date | string | null | undefined

function toDate(value: DateInput): Date | null {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

/** "28 mars 2026" (fr) / "March 28, 2026" (en) */
export function formatEditionDate(startAt: DateInput, locale = 'fr'): string | null {
  const date = toDate(startAt)
  if (!date) return null
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: EVENT_TIME_ZONE,
  }).format(date)
}

function formatHour(date: Date): string {
  const parts = new Intl.DateTimeFormat('fr', {
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: EVENT_TIME_ZONE,
  }).formatToParts(date)
  const hour = parts.find((p) => p.type === 'hour')?.value ?? ''
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  return `${Number(hour)}h${minute}`
}

/** "9h30" (heure de Paris) */
export function formatEventTime(value: Date | string): string {
  return formatHour(toDate(value)!)
}

/** "9h00 - 19h00" */
export function formatEditionHours(startAt: DateInput, endAt: DateInput): string | null {
  const start = toDate(startAt)
  if (!start) return null
  const end = toDate(endAt)
  return end ? `${formatHour(start)} - ${formatHour(end)}` : formatHour(start)
}

/** Horodatage iCalendar en UTC : 20260328T080000Z */
export function toIcsDateTime(value: Date | string): string {
  return toDate(value)!.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function isTicketingOpen(
  edition: { ticketingOpenAt: DateInput; ticketingCloseAt: DateInput },
  now: Date = new Date()
): boolean {
  const openAt = toDate(edition.ticketingOpenAt)
  const closeAt = toDate(edition.ticketingCloseAt)
  if (openAt && now < openAt) return false
  if (closeAt && now > closeAt) return false
  return true
}

/**
 * Représentation sérialisable d'une édition, transmise aux composants client.
 * Les libellés sont pré-calculés côté serveur pour éviter les écarts d'hydratation.
 */
export interface EditionView {
  id: string
  year: number
  status: EditionStatus
  startAt: string | null
  endAt: string | null
  venueName: string | null
  address: string | null
  city: string | null
  posterUrl: string | null
  ticketingOpenAt: string | null
  ticketingCloseAt: string | null
  standardTicketPrice: number
  flexTicketPrice: number
  accessTransport: string | null
  accessParking: string | null
  accessInfo: string | null
  ticketInfo: string | null
  archiveSummary: string | null
  dateLabel: string | null
  hoursLabel: string | null
}

const iso = (d: Date | null) => (d ? d.toISOString() : null)

export function toEditionView(edition: Edition): EditionView {
  return {
    id: edition.id,
    year: edition.year,
    status: edition.status,
    startAt: iso(edition.startAt),
    endAt: iso(edition.endAt),
    venueName: edition.venueName,
    address: edition.address,
    city: edition.city,
    posterUrl: edition.posterUrl,
    ticketingOpenAt: iso(edition.ticketingOpenAt),
    ticketingCloseAt: iso(edition.ticketingCloseAt),
    standardTicketPrice: edition.standardTicketPrice,
    flexTicketPrice: edition.flexTicketPrice,
    accessTransport: edition.accessTransport,
    accessParking: edition.accessParking,
    accessInfo: edition.accessInfo,
    ticketInfo: edition.ticketInfo,
    archiveSummary: edition.archiveSummary,
    dateLabel: formatEditionDate(edition.startAt),
    hoursLabel: formatEditionHours(edition.startAt, edition.endAt),
  }
}

/** Informations d'édition imprimées sur un billet ou rappelées dans un e-mail. */
export type EditionSummary = Pick<EditionView, 'year' | 'dateLabel' | 'venueName' | 'city'>

export function toEditionSummary(edition: Edition): EditionSummary {
  return {
    year: edition.year,
    dateLabel: formatEditionDate(edition.startAt),
    venueName: edition.venueName,
    city: edition.city,
  }
}
