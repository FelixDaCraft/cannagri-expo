/**
 * @jest-environment node
 */
import { generateTicketPDF, generateInvoicePDF } from '@/lib/pdf'

// Create a real base64 PNG image for testing (1x1 transparent pixel)
const createTestQRCodeImage = () => {
  // Minimal valid PNG base64 (1x1 transparent pixel)
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  return `data:image/png;base64,${pngBase64}`
}

describe('generateTicketPDF', () => {
  it('should generate a valid PDF buffer', async () => {
    const pdfBuffer = await generateTicketPDF({
      ticketId: 'TKT-001',
      customerName: 'John Doe',
      ticketType: 'STANDARD',
      orderNumber: 'CAE-123456',
      qrCodeImage: createTestQRCodeImage(),
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should generate valid PDF format', async () => {
    const pdfBuffer = await generateTicketPDF({
      ticketId: 'TKT-002',
      customerName: 'Jane Doe',
      ticketType: 'FLEX',
      orderNumber: 'CAE-789',
      qrCodeImage: createTestQRCodeImage(),
    })

    // PDF files start with %PDF-
    const pdfString = pdfBuffer.toString('utf8', 0, 8)
    expect(pdfString).toContain('%PDF')
  })

  it('should handle different ticket types', async () => {
    const ticketTypes = ['STANDARD', 'FLEX']

    for (const ticketType of ticketTypes) {
      const pdfBuffer = await generateTicketPDF({
        ticketId: `TKT-${ticketType}`,
        customerName: 'Type Test',
        ticketType,
        orderNumber: `CAE-${ticketType}-001`,
        qrCodeImage: createTestQRCodeImage(),
      })

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
      expect(pdfBuffer.length).toBeGreaterThan(0)
      // Verify it's a valid PDF
      const pdfString = pdfBuffer.toString('utf8', 0, 8)
      expect(pdfString).toContain('%PDF')
    }
  })

  it('should handle special characters in customer name', async () => {
    const pdfBuffer = await generateTicketPDF({
      ticketId: 'TKT-SPECIAL',
      customerName: 'Jean-Pierre Martin',
      ticketType: 'STANDARD',
      orderNumber: 'CAE-SPECIAL-001',
      qrCodeImage: createTestQRCodeImage(),
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should handle long customer names', async () => {
    const pdfBuffer = await generateTicketPDF({
      ticketId: 'TKT-LONG',
      customerName: 'Jean Pierre de la Fontaine Dupont',
      ticketType: 'STANDARD',
      orderNumber: 'CAE-LONG-001',
      qrCodeImage: createTestQRCodeImage(),
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should generate PDF without QR code image', async () => {
    const pdfBuffer = await generateTicketPDF({
      ticketId: 'TKT-NOQR',
      customerName: 'No QR User',
      ticketType: 'STANDARD',
      orderNumber: 'CAE-NOQR-001',
      qrCodeImage: '',
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
    // Verify it's a valid PDF
    const pdfString = pdfBuffer.toString('utf8', 0, 8)
    expect(pdfString).toContain('%PDF')
  })

  it('should generate different sizes for different ticket types', async () => {
    const baseInput = {
      ticketId: 'TKT-SIZE',
      customerName: 'Size Test',
      orderNumber: 'CAE-SIZE',
      qrCodeImage: createTestQRCodeImage(),
    }

    const pdfStandard = await generateTicketPDF({ ...baseInput, ticketType: 'STANDARD' })
    const pdfFlex = await generateTicketPDF({ ...baseInput, ticketType: 'FLEX' })

    // Different ticket types should produce slightly different PDFs
    expect(pdfStandard.length).not.toBe(pdfFlex.length)
  })
})

describe('generateInvoicePDF', () => {
  it('should generate a PDF buffer', async () => {
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: 'F-20260328-00001',
      orderNumber: 'ORD-20260328-00001',
      invoiceDate: new Date('2026-03-28'),
      customerName: 'Company Test',
      customerEmail: 'test@example.com',
      companyName: 'Test SARL',
      companySiret: '12345678901234',
      companyAddress: '123 Rue Test, 44000 Nantes',
      items: [
        { description: 'Stand A1 - 6m²', quantity: 1, unitPrice: 250 },
      ],
      totalTTC: 300,
      orderType: 'STAND_BOOKING',
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should generate valid PDF format for invoice', async () => {
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: 'F-20260328-00002',
      orderNumber: 'ORD-20260328-00002',
      invoiceDate: new Date('2026-03-28'),
      customerName: 'Invoice Test',
      customerEmail: 'invoice@test.com',
      items: [],
      totalTTC: 0,
      orderType: 'VISITOR_TICKET',
    })

    const pdfString = pdfBuffer.toString('utf8', 0, 8)
    expect(pdfString).toContain('%PDF')
  })

  it('should handle multiple items', async () => {
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: 'F-20260328-MULTI',
      orderNumber: 'ORD-20260328-MULTI',
      invoiceDate: new Date('2026-03-28'),
      customerName: 'Multi Items',
      customerEmail: 'multi@test.com',
      items: [
        { description: 'Stand A1', quantity: 1, unitPrice: 250 },
        { description: 'Stand A2', quantity: 1, unitPrice: 300 },
        { description: 'Option électricité', quantity: 2, unitPrice: 50 },
      ],
      totalTTC: 780,
      orderType: 'STAND_BOOKING',
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should handle company details', async () => {
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: 'F-20260328-COMPANY',
      orderNumber: 'ORD-20260328-COMPANY',
      invoiceDate: new Date('2026-03-28'),
      customerName: 'Jean Martin',
      customerEmail: 'jean@company.com',
      companyName: 'Cannabis France SARL',
      companySiret: '98765432101234',
      companyAddress: '456 Avenue CBD, 75001 Paris',
      items: [
        { description: 'Stand Premium', quantity: 1, unitPrice: 540 },
      ],
      totalTTC: 540,
      orderType: 'STAND_BOOKING',
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should handle empty company details', async () => {
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: 'F-20260328-NOCOMPANY',
      orderNumber: 'ORD-20260328-NOCOMPANY',
      invoiceDate: new Date('2026-03-28'),
      customerName: 'Individual Client',
      customerEmail: 'individual@test.com',
      items: [
        { description: 'Stand Basic', quantity: 1, unitPrice: 180 },
      ],
      totalTTC: 180,
      orderType: 'VISITOR_TICKET',
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })
})

describe('PDF Integration', () => {
  it('should generate consistent PDF sizes for same input', async () => {
    const input = {
      ticketId: 'TKT-CONSISTENT',
      customerName: 'Consistent User',
      ticketType: 'STANDARD',
      orderNumber: 'CAE-CONSISTENT',
      qrCodeImage: createTestQRCodeImage(),
    }

    const pdf1 = await generateTicketPDF(input)
    const pdf2 = await generateTicketPDF(input)

    // PDFs should have similar sizes (not exact due to timestamps in PDF)
    expect(Math.abs(pdf1.length - pdf2.length)).toBeLessThan(100)
  })

  it('should generate different PDFs for different ticket types', async () => {
    const baseInput = {
      ticketId: 'TKT-DIFF',
      customerName: 'Diff User',
      orderNumber: 'CAE-DIFF',
      qrCodeImage: createTestQRCodeImage(),
    }

    const pdfStandard = await generateTicketPDF({ ...baseInput, ticketType: 'STANDARD' })
    const pdfFlex = await generateTicketPDF({ ...baseInput, ticketType: 'FLEX' })

    // Different ticket types should produce slightly different PDFs
    expect(pdfStandard.length).not.toBe(pdfFlex.length)
  })

  it('should produce valid PDF header for tickets', async () => {
    const pdfBuffer = await generateTicketPDF({
      ticketId: 'TKT-HEADER',
      customerName: 'Header Test',
      ticketType: 'STANDARD',
      orderNumber: 'CAE-HEADER',
      qrCodeImage: createTestQRCodeImage(),
    })

    // Check PDF magic bytes
    expect(pdfBuffer[0]).toBe(0x25) // %
    expect(pdfBuffer[1]).toBe(0x50) // P
    expect(pdfBuffer[2]).toBe(0x44) // D
    expect(pdfBuffer[3]).toBe(0x46) // F
  })

  it('should produce valid PDF header for invoices', async () => {
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: 'F-20260328-HEADER',
      orderNumber: 'ORD-20260328-HEADER',
      invoiceDate: new Date('2026-03-28'),
      customerName: 'Header Test',
      customerEmail: 'header@test.com',
      items: [{ description: 'Test', quantity: 1, unitPrice: 120 }],
      totalTTC: 120,
      orderType: 'VISITOR_TICKET',
    })

    // Check PDF magic bytes
    expect(pdfBuffer[0]).toBe(0x25) // %
    expect(pdfBuffer[1]).toBe(0x50) // P
    expect(pdfBuffer[2]).toBe(0x44) // D
    expect(pdfBuffer[3]).toBe(0x46) // F
  })
})
