/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockPrisma = { sponsorRequest: { findUnique: jest.fn(), update: jest.fn() } }
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

jest.mock('@/lib/admin-auth', () => ({
  checkAdminAuth: () => Promise.resolve({ user: { role: 'ADMIN' } }),
  unauthorizedResponse: () => new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 }),
}))

const mockSend = jest.fn()
jest.mock('@/lib/email', () => ({ sendSponsorBrochure: (...a: unknown[]) => mockSend(...a) }))

const mockExists = jest.fn()
jest.mock('fs', () => ({ ...jest.requireActual('fs'), existsSync: (p: string) => mockExists(p) }))

/* eslint-disable @typescript-eslint/no-require-imports */
const { POST } = require('@/app/api/admin/sponsor-requests/[id]/send/route') as typeof import('@/app/api/admin/sponsor-requests/[id]/send/route')
/* eslint-enable @typescript-eslint/no-require-imports */

const send = () =>
  POST(new NextRequest('http://localhost/api/admin/sponsor-requests/r1/send', {
    method: 'POST',
    body: JSON.stringify({ subject: 'Plaquettes', emailBody: 'Bonjour' }),
    headers: { 'Content-Type': 'application/json' },
  }), { params: Promise.resolve({ id: 'r1' }) })

beforeEach(() => {
  jest.clearAllMocks()
  mockPrisma.sponsorRequest.findUnique.mockResolvedValue({
    id: 'r1', status: 'PENDING', email: 'a@b.fr', contactName: 'Jérémy', companyName: 'GROS.G CBD',
  })
  mockPrisma.sponsorRequest.update.mockImplementation(({ data }) => Promise.resolve({ id: 'r1', ...data }))
  mockExists.mockReturnValue(true)
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

describe('POST /api/admin/sponsor-requests/[id]/send', () => {
  it('joint les deux plaquettes (salon et Platinum CBD Cup) puis marque la demande envoyée', async () => {
    mockSend.mockResolvedValue(undefined)
    const res = await send()
    expect(res.status).toBe(200)
    const pj = mockSend.mock.calls[0][0].attachments
    expect(pj).toHaveLength(2)
    expect(pj.map((a: { filename: string }) => a.filename).join(' ')).toMatch(/cannagri.*platinum/i)
    expect(mockPrisma.sponsorRequest.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'SENT' }) }))
  })

  it("renvoie une erreur et laisse la demande à envoyer si l'e-mail ne part pas", async () => {
    mockSend.mockRejectedValue(new Error('SMTP 535'))
    const res = await send()
    expect(res.status).toBe(502)
    expect((await res.json()).error).toMatch(/pas parti/i)
    expect(mockPrisma.sponsorRequest.update).not.toHaveBeenCalled()
  })

  it("n'envoie rien et le signale si une plaquette manque sur le serveur", async () => {
    mockExists.mockImplementation((p: string) => !p.includes('platinum'))
    const res = await send()
    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/introuvable/i)
    expect(mockSend).not.toHaveBeenCalled()
    expect(mockPrisma.sponsorRequest.update).not.toHaveBeenCalled()
  })
})
