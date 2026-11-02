/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockPrisma = {
  user: { findUnique: jest.fn() },
  ticket: { findMany: jest.fn(), findUnique: jest.fn() },
  sponsor: { findMany: jest.fn() },
  verificationToken: { deleteMany: jest.fn(), create: jest.fn() },
}
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockGetServerSession = jest.fn()
jest.mock('next-auth', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

const mockSendVerificationEmail = jest.fn()
jest.mock('@/lib/email', () => ({ sendVerificationEmail: (...a: unknown[]) => mockSendVerificationEmail(...a) }))

const mockCheckRateLimit = jest.fn()
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...a: unknown[]) => mockCheckRateLimit(...a),
  RATE_LIMIT_PRESETS: { SENSITIVE: { limit: 3, windowSeconds: 300 } },
}))
jest.mock('@/lib/pdf', () => ({ generateTicketPDF: jest.fn() }))
jest.mock('@/lib/qrcode', () => ({ generateQRCode: jest.fn() }))

/* eslint-disable @typescript-eslint/no-require-imports */
const { GET: listTickets } = require('@/app/api/user/tickets/route')
const { GET: downloadTicket } = require('@/app/api/user/tickets/[id]/route')
const { POST: resendVerification } = require('@/app/api/auth/resend-verification/route')
/* eslint-enable @typescript-eslint/no-require-imports */

const session = { user: { id: 'u1', email: 'Alice@Example.fr', role: 'USER' } }

beforeEach(() => {
  jest.clearAllMocks()
  mockGetServerSession.mockResolvedValue(session)
  mockPrisma.ticket.findMany.mockResolvedValue([])
  mockCheckRateLimit.mockReturnValue({ success: true, remaining: 2, resetAt: Date.now() + 60_000 })
})

describe('GET /api/user/tickets', () => {
  it("retrouve les billets achetés sans compte avec la même adresse, une fois l'e-mail vérifié", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ email: 'alice@example.fr', emailVerified: new Date() })
    const response = await listTickets()
    expect(response.status).toBe(200)
    expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          order: { customerEmail: { equals: 'alice@example.fr', mode: 'insensitive' } },
        }),
      })
    )
  })

  it("ne montre rien tant que l'adresse e-mail n'est pas vérifiée", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ email: 'alice@example.fr', emailVerified: null })
    const response = await listTickets()
    expect(response.status).toBe(403)
    expect((await response.json()).code).toBe('EMAIL_NOT_VERIFIED')
    expect(mockPrisma.ticket.findMany).not.toHaveBeenCalled()
  })

  it('refuse sans session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    expect((await listTickets()).status).toBe(401)
  })
})

describe('GET /api/user/tickets/[id]', () => {
  const call = () => downloadTicket(new NextRequest('http://localhost/api/user/tickets/t1'), { params: Promise.resolve({ id: 't1' }) })

  it("refuse le téléchargement tant que l'adresse n'est pas vérifiée", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ email: 'alice@example.fr', emailVerified: null })
    expect((await call()).status).toBe(403)
    expect(mockPrisma.ticket.findUnique).not.toHaveBeenCalled()
  })

  it("refuse le billet d'une autre adresse", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ email: 'alice@example.fr', emailVerified: new Date() })
    mockPrisma.ticket.findUnique.mockResolvedValue({ id: 't1', order: { orderNumber: 'X', customerEmail: 'bob@example.fr' } })
    expect((await call()).status).toBe(403)
  })
})

describe('POST /api/auth/resend-verification', () => {
  it('renvoie un nouveau lien à une adresse non vérifiée', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ email: 'alice@example.fr', name: 'Alice', emailVerified: null })
    const response = await resendVerification()
    expect(response.status).toBe(200)
    expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({ where: { identifier: 'alice@example.fr' } })
    expect(mockPrisma.verificationToken.create).toHaveBeenCalled()
    expect(mockSendVerificationEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'alice@example.fr' }))
  })

  it("n'envoie rien si l'adresse est déjà vérifiée", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ email: 'alice@example.fr', name: 'Alice', emailVerified: new Date() })
    expect((await resendVerification()).status).toBe(200)
    expect(mockSendVerificationEmail).not.toHaveBeenCalled()
  })

  it('limite les envois', async () => {
    mockCheckRateLimit.mockReturnValue({ success: false, remaining: 0, resetAt: Date.now() + 60_000 })
    expect((await resendVerification()).status).toBe(429)
    expect(mockSendVerificationEmail).not.toHaveBeenCalled()
  })

  it('refuse sans session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    expect((await resendVerification()).status).toBe(401)
  })
})
