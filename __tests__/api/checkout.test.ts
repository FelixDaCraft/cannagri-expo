/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockPrisma = {
  user: { findUnique: jest.fn() },
  stand: { findFirst: jest.fn(), update: jest.fn() },
  promoCode: { findUnique: jest.fn(), update: jest.fn() },
  order: { create: jest.fn(), update: jest.fn() },
  $transaction: jest.fn(),
}
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockGetServerSession = jest.fn()
jest.mock('next-auth', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

const edition = {
  id: 'ed-2027',
  year: 2027,
  standardTicketPrice: 15,
  flexTicketPrice: 25,
  ticketingOpenAt: new Date('2026-01-01'),
  ticketingCloseAt: null,
}
const mockIsTicketingOpen = jest.fn()
jest.mock('@/lib/editions', () => ({
  getActiveEdition: jest.fn(() => Promise.resolve(edition)),
  isTicketingOpen: () => mockIsTicketingOpen(),
}))

const mockCreateVivaWalletOrder = jest.fn()
jest.mock('@/lib/vivawallet', () => ({
  createVivaWalletOrder: (...args: unknown[]) => mockCreateVivaWalletOrder(...args),
}))

const mockCheckRateLimit = jest.fn()
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIP: () => '203.0.113.7',
  RATE_LIMIT_PRESETS: { PAYMENT: { limit: 10, windowSeconds: 60 } },
}))

process.env.VIVA_WALLET_MERCHANT_ID = 'merchant'
process.env.VIVA_WALLET_API_KEY = 'key'

// Chargée après les variables d'environnement et les mocks ci-dessus
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require('@/app/api/payment/checkout/route') as typeof import('@/app/api/payment/checkout/route')

function checkout(body: unknown) {
  return POST(
    new NextRequest('http://localhost:3078/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

const guestOrder = {
  type: 'VISITOR_TICKET',
  items: [
    { ticketType: 'STANDARD', price: 0.01, quantity: 1, attendeeName: 'Alice Martin' },
    { ticketType: 'FLEX', price: 0.01, quantity: 1, attendeeName: 'Bruno Martin' },
  ],
  customer: { name: 'Alice Martin', email: ' Alice@Example.FR ', phone: '', acceptTerms: true, website: '' },
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetServerSession.mockResolvedValue(null)
  mockIsTicketingOpen.mockReturnValue(true)
  mockCheckRateLimit.mockReturnValue({ success: true, remaining: 9, resetAt: Date.now() + 60_000 })
  mockPrisma.$transaction.mockImplementation((fn: (tx: typeof mockPrisma) => unknown) => fn(mockPrisma))
  mockPrisma.order.create.mockImplementation(({ data }) => Promise.resolve({ id: 'order-1', ...data }))
  mockPrisma.order.update.mockResolvedValue({})
  mockCreateVivaWalletOrder.mockResolvedValue({ orderCode: '123', checkoutUrl: 'https://demo.vivapayments.com/x' })
})

describe('POST /api/payment/checkout : billets sans compte', () => {
  it('accepte une commande de billets sans session', async () => {
    const response = await checkout(guestOrder)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ success: true, checkoutUrl: 'https://demo.vivapayments.com/x' })
  })

  it("recalcule le prix côté serveur et normalise l'e-mail", async () => {
    await checkout(guestOrder)
    const { data } = mockPrisma.order.create.mock.calls[0][0]
    expect(data.amount).toBe(40)
    expect(data.customerEmail).toBe('alice@example.fr')
    expect(data.customerPhone).toBeNull()
    expect(JSON.parse(data.notes)).toEqual([
      { type: 'STANDARD', price: 15, quantity: 1, attendeeName: 'Alice Martin' },
      { type: 'FLEX', price: 25, quantity: 1, attendeeName: 'Bruno Martin' },
    ])
    expect(mockCreateVivaWalletOrder).toHaveBeenCalledWith(expect.objectContaining({ amount: 4000 }))
  })

  it('ignore un montant envoyé par le navigateur', async () => {
    await checkout({ ...guestOrder, amount: 1 })
    expect(mockPrisma.order.create.mock.calls[0][0].data.amount).toBe(40)
  })

  it.each([
    ['e-mail invalide', { ...guestOrder, customer: { ...guestOrder.customer, email: 'pas-un-email' } }],
    ['CGV non acceptées', { ...guestOrder, customer: { ...guestOrder.customer, acceptTerms: false } }],
    ['champ piège rempli', { ...guestOrder, customer: { ...guestOrder.customer, website: 'spam' } }],
    ['participant sans nom', { ...guestOrder, items: [{ ticketType: 'STANDARD', attendeeName: ' ' }] }],
    ['quantité hors bornes', { ...guestOrder, items: [{ ticketType: 'STANDARD', quantity: 21, attendeeName: 'A B' }] }],
    ['type de billet inconnu', { ...guestOrder, items: [{ ticketType: 'VIP', attendeeName: 'A B' }] }],
    ['aucun billet', { ...guestOrder, items: [] }],
  ])('refuse : %s', async (_label, body) => {
    const response = await checkout(body)
    expect(response.status).toBe(400)
    expect(mockPrisma.order.create).not.toHaveBeenCalled()
  })

  it('refuse un type de commande inconnu', async () => {
    expect((await checkout({ ...guestOrder, type: 'FREE_STUFF' })).status).toBe(400)
  })

  it('refuse quand la billetterie est fermée', async () => {
    mockIsTicketingOpen.mockReturnValue(false)
    expect((await checkout(guestOrder)).status).toBe(400)
  })

  it("limite les tentatives par adresse IP et par e-mail d'acheteur", async () => {
    await checkout(guestOrder)
    const keys = mockCheckRateLimit.mock.calls.map(([key]) => key)
    expect(keys).toContain('checkout:203.0.113.7')
    expect(keys).toContain('checkout-email:alice@example.fr')

    mockCheckRateLimit.mockImplementation((key: string) => ({
      success: !key.startsWith('checkout-email:'),
      remaining: 0,
      resetAt: Date.now() + 60_000,
    }))
    expect((await checkout(guestOrder)).status).toBe(429)
  })
})

describe('POST /api/payment/checkout : stands', () => {
  const standOrder = {
    type: 'STAND_BOOKING',
    items: { standId: 'stand-1' },
    customer: { name: 'Société', email: 'pro@example.fr', acceptTerms: true },
  }

  it('refuse une réservation de stand sans compte', async () => {
    const response = await checkout(standOrder)
    expect(response.status).toBe(401)
    expect(mockPrisma.stand.update).not.toHaveBeenCalled()
  })

  it('refuse un compte visiteur', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1' } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'USER', isApproved: true })
    expect((await checkout(standOrder)).status).toBe(403)
  })

  it('refuse un compte pro non approuvé', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1' } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'PRO', isApproved: false })
    expect((await checkout(standOrder)).status).toBe(403)
    expect(mockPrisma.stand.update).not.toHaveBeenCalled()
  })
})
