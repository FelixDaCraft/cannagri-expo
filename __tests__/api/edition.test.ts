/**
 * @jest-environment node
 */
import { editionNumber } from '@/lib/editions/number'

const edition = {
  id: 'ed-2027', year: 2027, status: 'ACTIVE',
  startAt: new Date('2027-04-03T08:00:00Z'), endAt: new Date('2027-04-03T17:30:00Z'),
  venueName: "L'Agronaute", address: '2 Rue du Sénégal, 44200 Nantes', city: 'Nantes',
  standardTicketPrice: 15, flexTicketPrice: 25,
  ticketingOpenAt: new Date('2026-11-15T09:00:00Z'), ticketingCloseAt: null,
  posterUrl: '/images/affiche-2027.png',
  accessTransport: 'interne', accessParking: 'interne', accessInfo: null, ticketInfo: null, archiveSummary: 'x',
  createdAt: new Date(), updatedAt: new Date(),
}
jest.mock('@/lib/editions', () => ({ getActiveEdition: jest.fn(() => Promise.resolve(edition)) }))

const mockPrisma = {
  sponsor: { findMany: jest.fn(() => Promise.resolve([])) },
  event: { findMany: jest.fn(() => Promise.resolve([])) },
  stand: { findMany: jest.fn(() => Promise.resolve([])) },
}
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

/* eslint-disable @typescript-eslint/no-require-imports */
const getEdition = () => require('@/app/api/edition/route').GET()
const others = {
  exposants: () => require('@/app/api/exposants/route').GET(),
  programme: () => require('@/app/api/programme/route').GET(),
  sponsors: () => require('@/app/api/sponsors/route').GET(),
}
/* eslint-enable @typescript-eslint/no-require-imports */

describe('editionNumber', () => {
  it('compte les éditions depuis 2023 (5e édition en 2027)', () => {
    expect(editionNumber(2023)).toBe(1)
    expect(editionNumber(2026)).toBe(4)
    expect(editionNumber(2027)).toBe(5)
  })
})

describe('GET /api/edition', () => {
  it("renvoie l'édition en ligne avec les seuls champs publics attendus", async () => {
    const res = await getEdition()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      year: 2027,
      number: 5,
      startAt: '2027-04-03T08:00:00.000Z',
      endAt: '2027-04-03T17:30:00.000Z',
      venueName: "L'Agronaute",
      address: '2 Rue du Sénégal, 44200 Nantes',
      city: 'Nantes',
      standardTicketPrice: 15,
      flexTicketPrice: 25,
      ticketingOpenAt: '2026-11-15T09:00:00.000Z',
      ticketingCloseAt: null,
      posterUrl: '/images/affiche-2027.png',
    })
  })
})

describe.each(Object.entries(others))('GET /api/%s', (_name, call) => {
  it("indique l'année de l'édition", async () => {
    const body = await (await call()).json()
    expect(body.edition).toEqual({ year: 2027 })
  })
})
