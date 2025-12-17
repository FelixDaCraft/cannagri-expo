/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../__mocks__/prisma'

// Mock prisma before importing the route
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

import { GET, POST } from '@/app/api/tickets/route'

describe('GET /api/tickets', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('should return tickets with pagination', async () => {
    const mockTickets = [
      {
        id: '1',
        customerName: 'John Doe',
        ticketType: 'STANDARD',
        status: 'PAID',
        qrCodeData: 'CANNAGRI-123-456-789',
        createdAt: new Date(),
        order: { orderNumber: 'CAE-001', status: 'PAID' },
      },
      {
        id: '2',
        customerName: 'Jane Doe',
        ticketType: 'FLEX',
        status: 'PAID',
        qrCodeData: 'CANNAGRI-234-567-890',
        createdAt: new Date(),
        order: { orderNumber: 'CAE-002', status: 'PAID' },
      },
    ]

    ;(mockPrisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets)
    ;(mockPrisma.ticket.count as jest.Mock).mockResolvedValue(2)

    const request = new NextRequest('http://localhost:3000/api/tickets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toHaveLength(2)
    expect(data.pagination).toEqual({
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    })
  })

  it('should filter tickets by status', async () => {
    ;(mockPrisma.ticket.findMany as jest.Mock).mockResolvedValue([])
    ;(mockPrisma.ticket.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/tickets?status=PAID')
    await GET(request)

    expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PAID' },
      })
    )
  })

  it('should handle pagination parameters', async () => {
    ;(mockPrisma.ticket.findMany as jest.Mock).mockResolvedValue([])
    ;(mockPrisma.ticket.count as jest.Mock).mockResolvedValue(100)

    const request = new NextRequest('http://localhost:3000/api/tickets?page=3&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20, // (3-1) * 10
        take: 10,
      })
    )
    expect(data.pagination.page).toBe(3)
    expect(data.pagination.limit).toBe(10)
  })

  it('should handle database errors', async () => {
    ;(mockPrisma.ticket.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost:3000/api/tickets')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to fetch tickets')
  })
})

describe('POST /api/tickets (validate ticket)', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('should validate a paid ticket successfully', async () => {
    const mockTicket = {
      id: 'ticket-1',
      customerName: 'John Doe',
      ticketType: 'STANDARD',
      status: 'PAID',
      qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
      order: { id: 'order-1', status: 'PAID' },
    }

    const updatedTicket = {
      ...mockTicket,
      status: 'USED',
      scannedAt: new Date(),
      scannedBy: 'Scanner',
    }

    ;(mockPrisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket)
    ;(mockPrisma.ticket.update as jest.Mock).mockResolvedValue(updatedTicket)

    const request = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.valid).toBe(true)
    expect(data.ticket.customerName).toBe('John Doe')
  })

  it('should reject ticket without QR code data', async () => {
    const request = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('QR code data required')
  })

  it('should reject invalid/unknown ticket', async () => {
    ;(mockPrisma.ticket.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        qrCodeData: 'INVALID-QR-CODE',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.valid).toBe(false)
    expect(data.error).toBe('Billet invalide ou inconnu')
  })

  it('should reject already used ticket', async () => {
    const usedAt = new Date()
    const mockTicket = {
      id: 'ticket-1',
      status: 'USED',
      scannedAt: usedAt,
      qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
    }

    ;(mockPrisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket)

    const request = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.valid).toBe(false)
    expect(data.error).toBe('Ce billet a déjà été utilisé')
    expect(data.usedAt).toBe(usedAt.toISOString())
  })

  it('should reject unpaid ticket', async () => {
    const mockTicket = {
      id: 'ticket-1',
      status: 'PENDING',
      qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
    }

    ;(mockPrisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket)

    const request = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.valid).toBe(false)
    expect(data.error).toBe("Ce billet n'est pas valide")
    expect(data.status).toBe('PENDING')
  })

  it('should record scanner identity when provided', async () => {
    const mockTicket = {
      id: 'ticket-1',
      customerName: 'Test User',
      ticketType: 'STANDARD',
      status: 'PAID',
      qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
      order: { id: 'order-1' },
    }

    ;(mockPrisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket)
    ;(mockPrisma.ticket.update as jest.Mock).mockResolvedValue({
      ...mockTicket,
      status: 'USED',
      scannedBy: 'Agent A',
    })

    const request = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
        scannedBy: 'Agent A',
      }),
    })

    await POST(request)

    expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scannedBy: 'Agent A',
        }),
      })
    )
  })

  it('should handle database errors during validation', async () => {
    ;(mockPrisma.ticket.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        qrCodeData: 'CANNAGRI-order123-ticket456-1234567890',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to validate ticket')
  })
})
