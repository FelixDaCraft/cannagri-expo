/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockPrisma = { sponsorRequest: { create: jest.fn(), delete: jest.fn() } }
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockCheckRateLimit = jest.fn()
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIP: () => '203.0.113.7',
}))

const mockCheckFullAdminAuth = jest.fn()
jest.mock('@/lib/admin-auth', () => ({
  checkFullAdminAuth: () => mockCheckFullAdminAuth(),
  unauthorizedResponse: () => new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 }),
}))

/* eslint-disable @typescript-eslint/no-require-imports */
const { POST } = require('@/app/api/sponsor-request/route') as typeof import('@/app/api/sponsor-request/route')
const { DELETE } = require('@/app/api/admin/sponsor-requests/[id]/route') as typeof import('@/app/api/admin/sponsor-requests/[id]/route')
/* eslint-enable @typescript-eslint/no-require-imports */

const post = (body: unknown) =>
  POST(new NextRequest('http://localhost:3078/api/sponsor-request', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }))

const valid = {
  companyName: 'FLORFACTORY',
  contactName: 'Baptiste Debus',
  email: 'contact@florfactory.fr',
  phone: '06 56 71 84 47',
  website: '',
  startedAt: Date.now() - 30_000,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCheckRateLimit.mockReturnValue({ success: true, remaining: 4, resetAt: Date.now() + 3_600_000 })
  mockPrisma.sponsorRequest.create.mockImplementation(({ data }) => Promise.resolve({ id: 'r1', ...data }))
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('POST /api/sponsor-request', () => {
  it('enregistre une vraie demande, champs nettoyés', async () => {
    const res = await post({ ...valid, companyName: '  FLORFACTORY ', email: ' Contact@Florfactory.fr ' })
    expect(res.status).toBe(200)
    expect(mockPrisma.sponsorRequest.create).toHaveBeenCalledWith({
      data: { companyName: 'FLORFACTORY', contactName: 'Baptiste Debus', email: 'contact@florfactory.fr', phone: '06 56 71 84 47', status: 'PENDING' },
    })
  })

  it('répond « succès » à un spam sans l’enregistrer (le robot n’apprend rien)', async () => {
    for (const spam of [
      { ...valid, companyName: 'dyxbOaJpimIZBOoQET', contactName: 'EeRNAstyqesLPVKOu', phone: 'sQvWiwvnTNEode' },
      { ...valid, website: 'http://spam.example' },
      { ...valid, startedAt: Date.now() - 500 },
    ]) {
      const res = await post(spam)
      expect(res.status).toBe(200)
      expect((await res.json()).success).toBe(true)
    }
    expect(mockPrisma.sponsorRequest.create).not.toHaveBeenCalled()
  })

  it('limite le nombre de demandes par adresse IP', async () => {
    mockCheckRateLimit.mockReturnValue({ success: false, remaining: 0, resetAt: Date.now() + 600_000 })
    const res = await post(valid)
    expect(res.status).toBe(429)
    expect(mockPrisma.sponsorRequest.create).not.toHaveBeenCalled()
  })

  it('refuse les champs manquants, un e-mail invalide ou des champs démesurés', async () => {
    expect((await post({ ...valid, contactName: ' ' })).status).toBe(400)
    expect((await post({ ...valid, email: 'pas-un-email' })).status).toBe(400)
    expect((await post({ ...valid, companyName: 'x'.repeat(300) })).status).toBe(400)
    expect(mockPrisma.sponsorRequest.create).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/admin/sponsor-requests/[id]', () => {
  const del = (id: string) => DELETE(new NextRequest(`http://localhost:3078/api/admin/sponsor-requests/${id}`, { method: 'DELETE' }), { params: { id } })

  it('refuse sans droits d’administration complets', async () => {
    mockCheckFullAdminAuth.mockResolvedValue(null)
    expect((await del('r1')).status).toBe(401)
    expect(mockPrisma.sponsorRequest.delete).not.toHaveBeenCalled()
  })

  it('supprime la demande', async () => {
    mockCheckFullAdminAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
    mockPrisma.sponsorRequest.delete.mockResolvedValue({ id: 'r1' })
    const res = await del('r1')
    expect(res.status).toBe(200)
    expect(mockPrisma.sponsorRequest.delete).toHaveBeenCalledWith({ where: { id: 'r1' } })
  })

  it('répond 404 si la demande n’existe plus', async () => {
    mockCheckFullAdminAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
    mockPrisma.sponsorRequest.delete.mockRejectedValue(Object.assign(new Error('not found'), { code: 'P2025' }))
    expect((await del('zz')).status).toBe(404)
  })
})
