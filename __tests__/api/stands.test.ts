/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../__mocks__/prisma'

// Mock prisma before importing the route
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

import { GET, PATCH } from '@/app/api/stands/route'

describe('GET /api/stands', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('should return all stands ordered by position', async () => {
    const mockStands = [
      {
        id: '1',
        number: 'A1',
        row: 'A',
        col: 1,
        surface: 6,
        priceHT: 250,
        status: 'FREE',
        order: null,
        sponsor: null,
        reservedUntil: null,
      },
      {
        id: '2',
        number: 'A2',
        row: 'A',
        col: 2,
        surface: 8,
        priceHT: 350,
        status: 'SOLD',
        order: { id: 'order-1', customerName: 'Company A', companyName: 'Company A SARL', status: 'PAID' },
        sponsor: null,
        reservedUntil: null,
      },
    ]

    ;(mockPrisma.stand.findMany as jest.Mock).mockResolvedValue(mockStands)

    const request = new NextRequest('http://localhost:3000/api/stands')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toHaveLength(2)
    expect(mockPrisma.stand.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ row: 'asc' }, { col: 'asc' }],
      })
    )
  })

  it('should filter stands by status', async () => {
    ;(mockPrisma.stand.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/stands?status=FREE')
    await GET(request)

    expect(mockPrisma.stand.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'FREE' },
      })
    )
  })

  it('should release expired reservations', async () => {
    const pastDate = new Date(Date.now() - 3600000) // 1 hour ago
    const mockStands = [
      {
        id: 'stand-1',
        number: 'B1',
        status: 'RESERVED',
        reservedUntil: pastDate, // Expired
        orderId: 'order-temp',
        reservedAt: new Date(Date.now() - 7200000),
      },
      {
        id: 'stand-2',
        number: 'B2',
        status: 'FREE',
        reservedUntil: null,
        orderId: null,
      },
    ]

    ;(mockPrisma.stand.findMany as jest.Mock).mockResolvedValue(mockStands)
    ;(mockPrisma.stand.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

    const request = new NextRequest('http://localhost:3000/api/stands')
    const response = await GET(request)
    const data = await response.json()

    expect(mockPrisma.stand.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['stand-1'] },
        status: 'RESERVED',
      },
      data: {
        status: 'FREE',
        orderId: null,
        reservedAt: null,
        reservedUntil: null,
      },
    })

    // Check that the returned data reflects the updated status
    const expiredStand = data.data.find((s: any) => s.id === 'stand-1')
    expect(expiredStand.status).toBe('FREE')
  })

  it('should not release non-expired reservations', async () => {
    const futureDate = new Date(Date.now() + 3600000) // 1 hour from now
    const mockStands = [
      {
        id: 'stand-1',
        number: 'C1',
        status: 'RESERVED',
        reservedUntil: futureDate, // Not expired
        orderId: 'order-temp',
      },
    ]

    ;(mockPrisma.stand.findMany as jest.Mock).mockResolvedValue(mockStands)

    const request = new NextRequest('http://localhost:3000/api/stands')
    await GET(request)

    expect(mockPrisma.stand.updateMany).not.toHaveBeenCalled()
  })

  it('should include sponsor information', async () => {
    const mockStands = [
      {
        id: '1',
        number: 'D1',
        status: 'SOLD',
        sponsor: {
          id: 'sponsor-1',
          name: 'CBD France',
          type: 'PLATINE',
        },
        order: null,
        reservedUntil: null,
      },
    ]

    ;(mockPrisma.stand.findMany as jest.Mock).mockResolvedValue(mockStands)

    const request = new NextRequest('http://localhost:3000/api/stands')
    const response = await GET(request)
    const data = await response.json()

    expect(data.data[0].sponsor).toEqual({
      id: 'sponsor-1',
      name: 'CBD France',
      type: 'PLATINE',
    })
  })

  it('should handle database errors', async () => {
    ;(mockPrisma.stand.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost:3000/api/stands')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to fetch stands')
  })
})

describe('PATCH /api/stands', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('should update stand status', async () => {
    const updatedStand = {
      id: 'stand-1',
      number: 'A1',
      status: 'SOLD',
      priceHT: 250,
    }

    ;(mockPrisma.stand.update as jest.Mock).mockResolvedValue(updatedStand)

    const request = new NextRequest('http://localhost:3000/api/stands', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'stand-1',
        status: 'SOLD',
      }),
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.status).toBe('SOLD')
    expect(mockPrisma.stand.update).toHaveBeenCalledWith({
      where: { id: 'stand-1' },
      data: { status: 'SOLD' },
    })
  })

  it('should update stand price', async () => {
    const updatedStand = {
      id: 'stand-1',
      number: 'A1',
      status: 'FREE',
      priceHT: 350,
    }

    ;(mockPrisma.stand.update as jest.Mock).mockResolvedValue(updatedStand)

    const request = new NextRequest('http://localhost:3000/api/stands', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'stand-1',
        priceHT: 350,
      }),
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(data.data.priceHT).toBe(350)
  })

  it('should update stand furniture option', async () => {
    const updatedStand = {
      id: 'stand-1',
      hasFurniture: true,
    }

    ;(mockPrisma.stand.update as jest.Mock).mockResolvedValue(updatedStand)

    const request = new NextRequest('http://localhost:3000/api/stands', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'stand-1',
        hasFurniture: true,
      }),
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(data.data.hasFurniture).toBe(true)
  })

  it('should update stand electricity option', async () => {
    const updatedStand = {
      id: 'stand-1',
      hasElectricity: true,
    }

    ;(mockPrisma.stand.update as jest.Mock).mockResolvedValue(updatedStand)

    const request = new NextRequest('http://localhost:3000/api/stands', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'stand-1',
        hasElectricity: true,
      }),
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(data.data.hasElectricity).toBe(true)
  })

  it('should reject request without stand ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/stands', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'SOLD',
      }),
    })

    const response = await PATCH(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Stand ID required')
  })

  it('should update multiple fields at once', async () => {
    const updatedStand = {
      id: 'stand-1',
      status: 'FREE',
      priceHT: 400,
      hasFurniture: true,
      hasElectricity: true,
    }

    ;(mockPrisma.stand.update as jest.Mock).mockResolvedValue(updatedStand)

    const request = new NextRequest('http://localhost:3000/api/stands', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'stand-1',
        status: 'FREE',
        priceHT: 400,
        hasFurniture: true,
        hasElectricity: true,
      }),
    })

    await PATCH(request)

    expect(mockPrisma.stand.update).toHaveBeenCalledWith({
      where: { id: 'stand-1' },
      data: {
        status: 'FREE',
        priceHT: 400,
        hasFurniture: true,
        hasElectricity: true,
      },
    })
  })

  it('should handle database errors', async () => {
    ;(mockPrisma.stand.update as jest.Mock).mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost:3000/api/stands', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'stand-1',
        status: 'SOLD',
      }),
    })

    const response = await PATCH(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to update stand')
  })

  it('should handle setting priceHT to 0', async () => {
    const updatedStand = {
      id: 'stand-free',
      priceHT: 0,
    }

    ;(mockPrisma.stand.update as jest.Mock).mockResolvedValue(updatedStand)

    const request = new NextRequest('http://localhost:3000/api/stands', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'stand-free',
        priceHT: 0,
      }),
    })

    await PATCH(request)

    expect(mockPrisma.stand.update).toHaveBeenCalledWith({
      where: { id: 'stand-free' },
      data: { priceHT: 0 },
    })
  })
})
