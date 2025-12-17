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
      orderNumber: 'FAC-001',
      customerName: 'Company Test',
      companyName: 'Test SARL',
      companySiret: '12345678901234',
      companyAddress: '123 Rue Test, 44000 Nantes',
      items: [
        { description: 'Stand A1 - 6m²', quantity: 1, priceHT: 250 },
      ],
      totalHT: 250,
      tva: 50,
      totalTTC: 300,
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should generate valid PDF format for invoice', async () => {
    const pdfBuffer = await generateInvoicePDF({
      orderNumber: 'FAC-002',
      customerName: 'Invoice Test',
      items: [],
      totalHT: 0,
      tva: 0,
      totalTTC: 0,
    })

    const pdfString = pdfBuffer.toString('utf8', 0, 8)
    expect(pdfString).toContain('%PDF')
  })

  it('should handle multiple items', async () => {
    const pdfBuffer = await generateInvoicePDF({
      orderNumber: 'FAC-MULTI',
      customerName: 'Multi Items',
      items: [
        { description: 'Stand A1', quantity: 1, priceHT: 250 },
        { description: 'Stand A2', quantity: 1, priceHT: 300 },
        { description: 'Option électricité', quantity: 2, priceHT: 50 },
      ],
      totalHT: 650,
      tva: 130,
      totalTTC: 780,
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should handle company details', async () => {
    const pdfBuffer = await generateInvoicePDF({
      orderNumber: 'FAC-COMPANY',
      customerName: 'Jean Martin',
      companyName: 'Cannabis France SARL',
      companySiret: '98765432101234',
      companyAddress: '456 Avenue CBD, 75001 Paris',
      items: [
        { description: 'Stand Premium', quantity: 1, priceHT: 450 },
      ],
      totalHT: 450,
      tva: 90,
      totalTTC: 540,
    })

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.length).toBeGreaterThan(0)
  })

  it('should handle empty company details', async () => {
    const pdfBuffer = await generateInvoicePDF({
      orderNumber: 'FAC-NOCOMPANY',
      customerName: 'Individual Client',
      items: [
        { description: 'Stand Basic', quantity: 1, priceHT: 150 },
      ],
      totalHT: 150,
      tva: 30,
      totalTTC: 180,
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
      orderNumber: 'FAC-HEADER',
      customerName: 'Header Test',
      items: [{ description: 'Test', quantity: 1, priceHT: 100 }],
      totalHT: 100,
      tva: 20,
      totalTTC: 120,
    })

    // Check PDF magic bytes
    expect(pdfBuffer[0]).toBe(0x25) // %
    expect(pdfBuffer[1]).toBe(0x50) // P
    expect(pdfBuffer[2]).toBe(0x44) // D
    expect(pdfBuffer[3]).toBe(0x46) // F
  })
})
