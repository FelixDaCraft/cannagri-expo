/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockPrisma = { newsletterSubscriber: { findMany: jest.fn(), count: jest.fn() } }
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockCheckFullAdminAuth = jest.fn()
jest.mock('@/lib/admin-auth', () => ({
  checkFullAdminAuth: () => mockCheckFullAdminAuth(),
  unauthorizedResponse: () => new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 }),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/admin/newsletter/route') as typeof import('@/app/api/admin/newsletter/route')

const get = (query = '') => GET(new NextRequest(`http://localhost:3078/api/admin/newsletter${query}`))

beforeEach(() => {
  jest.clearAllMocks()
  mockPrisma.newsletterSubscriber.findMany.mockResolvedValue([
    { id: 's1', email: 'a@b.fr', name: null, source: 'footer', locale: 'fr', subscribedAt: new Date('2026-11-03T10:00:00Z'), confirmedAt: new Date('2026-11-03T10:05:00Z') },
  ])
  mockPrisma.newsletterSubscriber.count.mockResolvedValue(2)
})

describe('GET /api/admin/newsletter', () => {
  it('refuse sans droits d’administration (contributeur ou visiteur)', async () => {
    mockCheckFullAdminAuth.mockResolvedValue(null)
    expect((await get()).status).toBe(401)
    expect((await get('?format=csv')).status).toBe(401)
    expect(mockPrisma.newsletterSubscriber.findMany).not.toHaveBeenCalled()
  })

  it('liste seulement les abonnés actifs, sans les jetons', async () => {
    mockCheckFullAdminAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
    const res = await get()
    expect(res.status).toBe(200)
    const call = mockPrisma.newsletterSubscriber.findMany.mock.calls[0][0]
    expect(call.where).toEqual({ isActive: true })
    expect(call.select.confirmToken).toBeUndefined()
    expect(call.select.unsubscribeToken).toBeUndefined()
    expect(await res.json()).toMatchObject({ pending: 2, data: [{ email: 'a@b.fr' }] })
  })

  it('exporte un CSV téléchargeable', async () => {
    mockCheckFullAdminAuth.mockResolvedValue({ user: { role: 'SUPER_ADMIN' } })
    const res = await get('?format=csv')
    expect(res.headers.get('content-type')).toContain('text/csv')
    expect(res.headers.get('content-disposition')).toMatch(/attachment; filename="abonnes-newsletter-\d{4}-\d{2}-\d{2}\.csv"/)
    const text = await res.text()
    expect(text).toContain('email;nom;origine;langue;inscrit le;confirmé le')
    expect(text).toContain('a@b.fr;;footer;fr;2026-11-03T10:00:00.000Z;2026-11-03T10:05:00.000Z')
  })
})
