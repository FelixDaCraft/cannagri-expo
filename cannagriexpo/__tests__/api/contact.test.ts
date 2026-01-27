/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockPrisma, resetPrismaMocks } from '../__mocks__/prisma'

// Mock prisma before importing the route
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

import { POST } from '@/app/api/contact/route'

describe('POST /api/contact', () => {
  beforeEach(() => {
    resetPrismaMocks()
  })

  it('should create a contact request successfully', async () => {
    ;(mockPrisma.contactRequest.create as jest.Mock).mockResolvedValue({
      id: '1',
      type: 'GENERAL',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
    })

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockPrisma.contactRequest.create).toHaveBeenCalledWith({
      data: {
        type: 'GENERAL',
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        company: null,
        subject: 'Test Subject',
        message: 'Test message content',
      },
    })
  })

  it('should create contact request with custom type', async () => {
    ;(mockPrisma.contactRequest.create as jest.Mock).mockResolvedValue({ id: '2' })

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        type: 'PRESS',
        name: 'Jane Reporter',
        email: 'jane@press.com',
        subject: 'Press Inquiry',
        message: 'Press message',
      }),
    })

    await POST(request)

    expect(mockPrisma.contactRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'PRESS',
      }),
    })
  })

  it('should create contact request with phone and company', async () => {
    ;(mockPrisma.contactRequest.create as jest.Mock).mockResolvedValue({ id: '3' })

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Business Contact',
        email: 'business@company.com',
        phone: '+33612345678',
        company: 'Company SARL',
        subject: 'Business Inquiry',
        message: 'Business message',
      }),
    })

    await POST(request)

    expect(mockPrisma.contactRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        phone: '+33612345678',
        company: 'Company SARL',
      }),
    })
  })

  it('should reject request without name', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Veuillez remplir tous les champs obligatoires')
  })

  it('should reject request without email', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        subject: 'Test',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Veuillez remplir tous les champs obligatoires')
  })

  it('should reject request without subject', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Veuillez remplir tous les champs obligatoires')
  })

  it('should reject request without message', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Veuillez remplir tous les champs obligatoires')
  })

  it('should reject invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Adresse email invalide')
  })

  it('should reject email without domain', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Adresse email invalide')
  })

  it('should reject email without @', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'testexample.com',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Adresse email invalide')
  })

  it('should handle database errors', async () => {
    ;(mockPrisma.contactRequest.create as jest.Mock).mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Une erreur est survenue. Veuillez réessayer.')
  })

  it('should handle empty strings as missing fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
  })

  it('should accept SPONSOR contact type', async () => {
    ;(mockPrisma.contactRequest.create as jest.Mock).mockResolvedValue({ id: '4' })

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        type: 'SPONSOR',
        name: 'Sponsor Contact',
        email: 'sponsor@company.com',
        company: 'Sponsor Corp',
        subject: 'Sponsoring Interest',
        message: 'We want to sponsor the event',
      }),
    })

    await POST(request)

    expect(mockPrisma.contactRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'SPONSOR',
      }),
    })
  })

  it('should accept EXHIBITOR contact type', async () => {
    ;(mockPrisma.contactRequest.create as jest.Mock).mockResolvedValue({ id: '5' })

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        type: 'EXHIBITOR',
        name: 'Exhibitor Contact',
        email: 'exhibitor@company.com',
        subject: 'Exhibitor Interest',
        message: 'We want to exhibit',
      }),
    })

    await POST(request)

    expect(mockPrisma.contactRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'EXHIBITOR',
      }),
    })
  })

  it('should handle special characters in message', async () => {
    ;(mockPrisma.contactRequest.create as jest.Mock).mockResolvedValue({ id: '6' })

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'François Müller',
        email: 'francois@example.com',
        subject: "Demande d'information",
        message: "Je souhaite avoir plus d'informations sur l'événement. Merci !",
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.contactRequest.create).toHaveBeenCalled()
  })
})
