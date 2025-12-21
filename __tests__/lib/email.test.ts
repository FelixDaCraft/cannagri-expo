import { sendTicketEmail, sendNewsletterConfirmation } from '@/lib/email'

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}))

// Get the mock for assertions
import nodemailer from 'nodemailer'
const mockSendMail = (nodemailer.createTransport() as any).sendMail

describe('sendTicketEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send ticket email successfully', async () => {
    await sendTicketEmail({
      to: 'test@example.com',
      customerName: 'John Doe',
      orderNumber: 'CAE-123456',
    })

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.to).toBe('test@example.com')
    expect(callArgs.subject).toContain('e-billet')
  })

  it('should include customer name in email HTML', async () => {
    await sendTicketEmail({
      to: 'test@example.com',
      customerName: 'Marie Dupont',
      orderNumber: 'CAE-789',
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('Marie Dupont')
  })

  it('should include order number in email HTML', async () => {
    await sendTicketEmail({
      to: 'test@example.com',
      customerName: 'Test User',
      orderNumber: 'CAE-ORDER-456',
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('CAE-ORDER-456')
  })

  it('should attach PDF when provided', async () => {
    const pdfBuffer = Buffer.from('fake-pdf-content')

    await sendTicketEmail({
      to: 'test@example.com',
      customerName: 'Test User',
      orderNumber: 'CAE-123',
      pdfBuffer,
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.attachments).toHaveLength(1)
    expect(callArgs.attachments[0].filename).toContain('billet-CAE-123.pdf')
    expect(callArgs.attachments[0].contentType).toBe('application/pdf')
  })

  it('should not include attachments when PDF is not provided', async () => {
    await sendTicketEmail({
      to: 'test@example.com',
      customerName: 'Test User',
      orderNumber: 'CAE-123',
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.attachments).toHaveLength(0)
  })

  it('should send stand booking confirmation email', async () => {
    await sendTicketEmail({
      to: 'pro@example.com',
      customerName: 'Entreprise ABC',
      orderNumber: 'CAE-STAND-001',
      isStandBooking: true,
      standCodes: ['A1', 'A2'],
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.subject).toContain('Confirmation de réservation')
    expect(callArgs.subject).toContain('Stand')
    expect(callArgs.html).toContain('A1')
    expect(callArgs.html).toContain('A2')
  })

  it('should handle single stand in stand booking', async () => {
    await sendTicketEmail({
      to: 'pro@example.com',
      customerName: 'Entreprise XYZ',
      orderNumber: 'CAE-STAND-002',
      isStandBooking: true,
      standCodes: ['B3'],
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('B3')
  })

  it('should throw error when email sending fails', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP error'))

    await expect(
      sendTicketEmail({
        to: 'test@example.com',
        customerName: 'Test User',
        orderNumber: 'CAE-123',
      })
    ).rejects.toThrow('Failed to send email')
  })
})

describe('sendNewsletterConfirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send newsletter confirmation email', async () => {
    await sendNewsletterConfirmation('subscriber@example.com')

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.to).toBe('subscriber@example.com')
    expect(callArgs.subject).toContain('newsletter')
  })

  it('should include welcome message in HTML', async () => {
    await sendNewsletterConfirmation('subscriber@example.com')

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('Merci pour votre inscription')
  })

  it('should include information about updates', async () => {
    await sendNewsletterConfirmation('subscriber@example.com')

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('actualités')
  })
})

describe('Email HTML Templates', () => {
  it('should include event location in ticket email', async () => {
    await sendTicketEmail({
      to: 'test@example.com',
      customerName: 'Test',
      orderNumber: 'CAE-123',
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    // Should contain location info from siteConfig
    expect(callArgs.html).toContain('Lieu')
  })

  it('should include event date in ticket email', async () => {
    await sendTicketEmail({
      to: 'test@example.com',
      customerName: 'Test',
      orderNumber: 'CAE-123',
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('Date')
  })

  it('should include presentation instructions in ticket email', async () => {
    await sendTicketEmail({
      to: 'test@example.com',
      customerName: 'Test',
      orderNumber: 'CAE-123',
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('Important')
    expect(callArgs.html).toContain('e-billet')
  })

  it('should include next steps in stand booking email', async () => {
    await sendTicketEmail({
      to: 'pro@example.com',
      customerName: 'Test Pro',
      orderNumber: 'CAE-STAND-001',
      isStandBooking: true,
      standCodes: ['A1'],
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('Prochaines étapes')
    expect(callArgs.html).toContain('guide de l\'exposant')
    expect(callArgs.html).toContain('badge exposant')
  })

  it('should mention invoice when invoicePdfBuffer is provided', async () => {
    const mockInvoice = Buffer.from('mock invoice pdf')
    await sendTicketEmail({
      to: 'pro@example.com',
      customerName: 'Test Pro',
      orderNumber: 'CAE-STAND-001',
      isStandBooking: true,
      standCodes: ['A1'],
      invoicePdfBuffer: mockInvoice,
    })

    const callArgs = mockSendMail.mock.calls[0][0]
    expect(callArgs.html).toContain('facture est jointe')
    expect(callArgs.attachments).toContainEqual(
      expect.objectContaining({
        filename: 'facture-CAE-STAND-001.pdf',
        content: mockInvoice,
      })
    )
  })
})
