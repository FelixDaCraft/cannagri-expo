/**
 * @jest-environment node
 *
 * Routes publiques (sans authentification) : aucune donnée personnelle ni interne ne doit sortir.
 * La base simulée renvoie des lignes complètes et applique le `select` comme le ferait Prisma :
 * si une route oublie sa liste blanche, ces tests échouent.
 */
import { NextRequest } from 'next/server'

// Champs qui ne doivent jamais apparaître dans une réponse publique
const SENSITIVE = [
  'contactName', 'contactEmail', 'contactPhone',
  'customerName', 'customerEmail', 'customerPhone',
  'email', 'phone', 'password', 'siret', 'companySiret',
  'vivaWalletRef', 'orderId', 'proId', 'notes', 'reservedAt', 'reservedUntil',
  'editionId', 'createdAt', 'updatedAt',
]

/** Applique un `select` Prisma (récursif) à une ligne complète */
function applySelect(row: Record<string, unknown>, select?: Record<string, unknown>): Record<string, unknown> {
  if (!select) return row
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(select)) {
    if (!value || !(key in row)) continue
    const nested = row[key]
    if (typeof value === 'object' && value !== null && 'select' in value && nested && typeof nested === 'object') {
      out[key] = applySelect(nested as Record<string, unknown>, (value as { select: Record<string, unknown> }).select)
    } else {
      out[key] = nested
    }
  }
  return out
}

function findSensitive(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => findSensitive(v, `${path}[${i}]`))
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => [
      ...(SENSITIVE.includes(k) ? [`${path}.${k}`] : []),
      ...findSensitive(v, `${path}.${k}`),
    ])
  }
  return []
}

const now = new Date('2026-11-03T10:00:00Z')
const fullSponsor = {
  id: 'sp1', editionId: 'ed', name: 'Sponsor', slug: 'sponsor', type: 'GOLD', logoUrl: '/images/logos/x.webp',
  description: 'Desc', websiteUrl: 'https://x.fr', articleTitle: null, articleBody: null, articleImage: null,
  articleTitleTranslations: null, articleBodyTranslations: null, descriptionTranslations: null,
  standId: 'st1', exhibitorDescription: null, exhibitorCategory: 'MATERIEL',
  contactName: 'Jean Contact', contactEmail: 'jean@sponsor.fr', contactPhone: '0600000000',
  exhibitorDescriptionTranslations: null, displayOrder: 0, isActive: true, createdAt: now, updatedAt: now,
}
const fullEvent = {
  id: 'ev1', editionId: 'ed', title: 'Conférence', slug: 'conf', description: null, type: 'CONFERENCE',
  startAt: now, endAt: now, location: 'Scène', speakers: [], speakerName: null, speakerTitle: null,
  speakerCompany: null, speakerPhoto: null, speakerBio: null, isPlatinumCBDCup: false, isHighlighted: false,
  displayOrder: 0, titleTranslations: null, descriptionTranslations: null, createdAt: now, updatedAt: now,
}
const fullStand = {
  id: 'st1', number: 12, code: '12', surfaceM2: 9, priceHT: 300, status: 'SOLD', size: 'SMALL',
  exhibitorName: 'Exposant', proId: 'user-1', hasFurniture: false, hasElectricity: false, furniturePrice: 0,
  electricityPrice: 0, x: 0, y: 0, width: 1, height: 1, row: 1, col: 1, orderId: 'order-1', reservedAt: now,
  reservedUntil: now, createdAt: now, updatedAt: now, exhibitorCategory: null, exhibitorDescription: null,
  exhibitorLogo: null, exhibitorWebsite: null, editionId: 'ed',
  order: { id: 'order-1', customerName: 'Client', customerEmail: 'client@x.fr', companyName: 'Société', status: 'PAID', vivaWalletRef: 'v1' },
  sponsor: { ...fullSponsor },
  pro: { id: 'user-1', email: 'pro@x.fr', phone: '06', companyName: 'Pro', companyDescription: null, companyDescriptionTranslations: null, companyLogo: null, companyWebsite: null, businessType: 'PRODUCTEURS', isApproved: true, siret: '123' },
}

const many = (row: Record<string, unknown>) => jest.fn((args: { select?: Record<string, unknown>; include?: Record<string, unknown> } = {}) =>
  Promise.resolve([args.select ? applySelect(row, args.select) : row]))

const mockPrisma = {
  sponsor: { findMany: many(fullSponsor), findFirst: jest.fn() },
  event: { findMany: many(fullEvent) },
  stand: { findMany: many(fullStand), updateMany: jest.fn() },
  order: { findUnique: jest.fn(() => Promise.resolve({ id: 'order-1', customerEmail: 'client@x.fr', customerName: 'Client' })) },
  pageView: { count: jest.fn(() => Promise.resolve(0)), groupBy: jest.fn(() => Promise.resolve([])), findMany: jest.fn(() => Promise.resolve([])) },
}
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
jest.mock('@/lib/editions', () => ({ getActiveEdition: jest.fn(() => Promise.resolve({ id: 'ed', year: 2027 })) }))
const mockAdmin = jest.fn(() => Promise.resolve(null))
jest.mock('@/lib/admin-auth', () => ({
  checkAdminAuth: () => mockAdmin(),
  unauthorizedResponse: () => new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 }),
}))
jest.mock('@/lib/vivawallet', () => ({ getVivaWalletOrder: jest.fn() }))

/* eslint-disable @typescript-eslint/no-require-imports */
const routes = {
  sponsors: () => require('@/app/api/sponsors/route').GET(),
  events: () => require('@/app/api/events/route').GET(),
  programme: () => require('@/app/api/programme/route').GET(),
  exposants: () => require('@/app/api/exposants/route').GET(),
  stands: () => require('@/app/api/stands/route').GET(new NextRequest('http://localhost/api/stands')),
}
/* eslint-enable @typescript-eslint/no-require-imports */

beforeEach(() => {
  mockAdmin.mockResolvedValue(null)
})

describe.each(Object.entries(routes))('GET /api/%s (public)', (_name, call) => {
  it('ne renvoie aucune donnée personnelle ni interne', async () => {
    const res = await call()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(findSensitive(body)).toEqual([])
    // Ni identifiant d'utilisateur ni identifiant de commande, quel que soit le nom du champ
    expect(JSON.stringify(body)).not.toMatch(/user-1|order-1|@x\.fr|@sponsor\.fr/)
  })
})

describe('routes réservées aux administrateurs', () => {
  it('GET /api/orders/[id] refuse un visiteur', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GET } = require('@/app/api/orders/[id]/route')
    const res = await GET(new NextRequest('http://localhost/api/orders/order-1'), { params: Promise.resolve({ id: 'order-1' }) })
    expect(res.status).toBe(401)
    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('GET /api/analytics refuse un visiteur', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GET } = require('@/app/api/analytics/route')
    const res = await GET(new NextRequest('http://localhost/api/analytics'))
    expect(res.status).toBe(401)
  })

  it('GET /api/stands garde le détail des commandes pour un administrateur', async () => {
    mockAdmin.mockResolvedValue({ user: { role: 'ADMIN' } } as never)
    const body = await (await routes.stands()).json()
    expect(body.data[0].order.customerName).toBe('Client')
  })
})
