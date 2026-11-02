/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockPrisma = {
  newsletterSubscriber: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
}
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockSendConfirmation = jest.fn()
jest.mock('@/lib/email', () => ({
  sendNewsletterConfirmation: (...args: unknown[]) => mockSendConfirmation(...args),
}))

const mockCheckRateLimit = jest.fn()
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIP: () => '203.0.113.7',
  RATE_LIMIT_PRESETS: { API: { limit: 60, windowSeconds: 60 } },
}))

/* eslint-disable @typescript-eslint/no-require-imports */
const { POST: subscribe } = require('@/app/api/newsletter/route') as typeof import('@/app/api/newsletter/route')
const { POST: confirm } = require('@/app/api/newsletter/confirm/route') as typeof import('@/app/api/newsletter/confirm/route')
const { POST: unsubscribe } = require('@/app/api/newsletter/unsubscribe/route') as typeof import('@/app/api/newsletter/unsubscribe/route')
/* eslint-enable @typescript-eslint/no-require-imports */

function post(handler: (r: NextRequest) => Promise<Response>, url: string, body?: unknown) {
  return handler(
    new NextRequest(`http://localhost:3078${url}`, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

const valid = { email: ' Alice@Example.FR ', consent: true, website: '', source: 'footer', locale: 'fr' }
const TOKEN = 'a'.repeat(43)

beforeEach(() => {
  jest.clearAllMocks()
  mockCheckRateLimit.mockReturnValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })
  mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null)
  mockPrisma.newsletterSubscriber.create.mockImplementation(({ data }) => Promise.resolve({ id: 's1', ...data }))
  mockPrisma.newsletterSubscriber.update.mockImplementation(({ data }) => Promise.resolve({ id: 's1', ...data }))
  mockSendConfirmation.mockResolvedValue(undefined)
})

describe('POST /api/newsletter : inscription', () => {
  it('crée un abonné inactif et envoie l’e-mail de confirmation', async () => {
    const res = await post(subscribe, '/api/newsletter', valid)
    expect(res.status).toBe(200)
    const { data } = mockPrisma.newsletterSubscriber.create.mock.calls[0][0]
    expect(data).toMatchObject({ email: 'alice@example.fr', isActive: false, source: 'footer', locale: 'fr' })
    expect(data.confirmToken).toMatch(/^[\w-]{40,}$/)
    expect(data.unsubscribeToken).toMatch(/^[\w-]{40,}$/)
    expect(data.confirmToken).not.toBe(data.unsubscribeToken)
    expect(data.confirmTokenExpiresAt.getTime()).toBeGreaterThan(Date.now() + 6 * 24 * 3600 * 1000)
    expect(mockSendConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'alice@example.fr', confirmUrl: expect.stringContaining(`token=${data.confirmToken}`) })
    )
  })

  it('répond pareil pour une adresse déjà inscrite, sans rien renvoyer ni modifier', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({ id: 's1', email: 'alice@example.fr', isActive: true })
    const first = await post(subscribe, '/api/newsletter', valid)
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null)
    const second = await post(subscribe, '/api/newsletter', valid)
    expect(first.status).toBe(second.status)
    expect(await first.json()).toEqual(await second.json())
    expect(mockSendConfirmation).toHaveBeenCalledTimes(1)
  })

  it('renvoie un nouveau lien à une adresse en attente ou désinscrite, en gardant son jeton de désinscription', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({ id: 's1', email: 'alice@example.fr', isActive: false, unsubscribeToken: 'old-unsub' })
    await post(subscribe, '/api/newsletter', valid)
    expect(mockPrisma.newsletterSubscriber.create).not.toHaveBeenCalled()
    const { data } = mockPrisma.newsletterSubscriber.update.mock.calls[0][0]
    expect(data.confirmToken).toMatch(/^[\w-]{40,}$/)
    expect(data.unsubscribeToken).toBeUndefined()
    expect(mockSendConfirmation).toHaveBeenCalledWith(expect.objectContaining({ unsubscribeUrl: expect.stringContaining('token=old-unsub') }))
  })

  it.each([
    ['sans consentement', { ...valid, consent: false }],
    ['consentement en texte', { ...valid, consent: 'true' }],
    ['e-mail invalide', { ...valid, email: 'alice@' }],
    ['e-mail non textuel', { ...valid, email: ['a@b.fr'] }],
  ])('refuse : %s', async (_label, body) => {
    const res = await post(subscribe, '/api/newsletter', body)
    expect(res.status).toBe(400)
    expect(mockPrisma.newsletterSubscriber.create).not.toHaveBeenCalled()
  })

  it('ignore en silence un robot qui remplit le champ piège', async () => {
    const res = await post(subscribe, '/api/newsletter', { ...valid, website: 'http://spam.example' })
    expect(res.status).toBe(200)
    expect(mockPrisma.newsletterSubscriber.create).not.toHaveBeenCalled()
    expect(mockSendConfirmation).not.toHaveBeenCalled()
  })

  it('remplace une origine inconnue par « autre »', async () => {
    await post(subscribe, '/api/newsletter', { ...valid, source: '<script>' })
    expect(mockPrisma.newsletterSubscriber.create.mock.calls[0][0].data.source).toBe('autre')
  })

  it('limite les inscriptions par adresse IP (429)', async () => {
    mockCheckRateLimit.mockReturnValue({ success: false, remaining: 0, resetAt: Date.now() + 60_000 })
    const res = await post(subscribe, '/api/newsletter', valid)
    expect(res.status).toBe(429)
    expect(mockPrisma.newsletterSubscriber.create).not.toHaveBeenCalled()
  })

  it('limite aussi par adresse e-mail', async () => {
    mockCheckRateLimit.mockImplementation((key: string) =>
      key.startsWith('newsletter-email:') ? { success: false, remaining: 0, resetAt: Date.now() + 60_000 } : { success: true, remaining: 4, resetAt: Date.now() }
    )
    const res = await post(subscribe, '/api/newsletter', valid)
    expect(res.status).toBe(429)
  })

  it('refuse un corps qui n’est pas du JSON', async () => {
    const res = await subscribe(new NextRequest('http://localhost:3078/api/newsletter', { method: 'POST', body: 'x' }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/newsletter/confirm : confirmation', () => {
  it('active l’abonné et efface le jeton de confirmation', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({ id: 's1', isActive: false, confirmTokenExpiresAt: new Date(Date.now() + 3600_000) })
    const res = await post(confirm, '/api/newsletter/confirm', { token: TOKEN })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'confirmed' })
    expect(mockPrisma.newsletterSubscriber.findUnique).toHaveBeenCalledWith({ where: { confirmToken: TOKEN } })
    const { data } = mockPrisma.newsletterSubscriber.update.mock.calls[0][0]
    expect(data).toMatchObject({ isActive: true, confirmToken: null, confirmTokenExpiresAt: null, unsubscribedAt: null })
    expect(data.confirmedAt).toBeInstanceOf(Date)
  })

  it('refuse un jeton inconnu', async () => {
    const res = await post(confirm, '/api/newsletter/confirm', { token: TOKEN })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ status: 'invalid' })
  })

  it('refuse un jeton expiré', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({ id: 's1', isActive: false, confirmTokenExpiresAt: new Date(Date.now() - 1000) })
    const res = await post(confirm, '/api/newsletter/confirm', { token: TOKEN })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ status: 'expired' })
    expect(mockPrisma.newsletterSubscriber.update).not.toHaveBeenCalled()
  })

  it.each([[undefined], [''], ['court'], [42], ['x'.repeat(300)]])('refuse un jeton mal formé : %p', async (token) => {
    const res = await post(confirm, '/api/newsletter/confirm', { token })
    expect(res.status).toBe(400)
    expect(mockPrisma.newsletterSubscriber.findUnique).not.toHaveBeenCalled()
  })

  it('limite les tentatives (429)', async () => {
    mockCheckRateLimit.mockReturnValue({ success: false, remaining: 0, resetAt: Date.now() + 60_000 })
    const res = await post(confirm, '/api/newsletter/confirm', { token: TOKEN })
    expect(res.status).toBe(429)
  })
})

describe('POST /api/newsletter/unsubscribe : désinscription en un clic', () => {
  it('désactive l’abonné avec le jeton du corps', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({ id: 's1', isActive: true })
    const res = await post(unsubscribe, '/api/newsletter/unsubscribe', { token: TOKEN })
    expect(res.status).toBe(200)
    expect(mockPrisma.newsletterSubscriber.findUnique).toHaveBeenCalledWith({ where: { unsubscribeToken: TOKEN } })
    const { data } = mockPrisma.newsletterSubscriber.update.mock.calls[0][0]
    expect(data.isActive).toBe(false)
    expect(data.unsubscribedAt).toBeInstanceOf(Date)
  })

  it('accepte le jeton dans l’adresse (en-tête List-Unsubscribe-Post des messageries)', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({ id: 's1', isActive: true })
    const res = await unsubscribe(
      new NextRequest(`http://localhost:3078/api/newsletter/unsubscribe?token=${TOKEN}`, {
        method: 'POST',
        body: 'List-Unsubscribe=One-Click',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    )
    expect(res.status).toBe(200)
  })

  it('reste sans effet et sans erreur pour un abonné déjà désinscrit', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({ id: 's1', isActive: false, unsubscribedAt: new Date() })
    const res = await post(unsubscribe, '/api/newsletter/unsubscribe', { token: TOKEN })
    expect(res.status).toBe(200)
    expect(mockPrisma.newsletterSubscriber.update).not.toHaveBeenCalled()
  })

  it('refuse un jeton inconnu ou mal formé', async () => {
    expect((await post(unsubscribe, '/api/newsletter/unsubscribe', { token: TOKEN })).status).toBe(400)
    expect((await post(unsubscribe, '/api/newsletter/unsubscribe', { token: 'x' })).status).toBe(400)
  })
})
