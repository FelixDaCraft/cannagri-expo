import {
  verifyQRCodeFormat,
  parseQRCodeData,
} from '@/lib/qrcode'

// Mock the QR code generation functions since they require canvas in Node
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockImageData'),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])), // PNG header
  toString: jest.fn().mockResolvedValue('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"></path></svg>'),
}))

import {
  generateQRCode,
  generateQRCodeBuffer,
  generateQRCodeSVG,
} from '@/lib/qrcode'

describe('generateQRCode', () => {
  it('should generate a valid data URL', async () => {
    const dataUrl = await generateQRCode('test-data')
    expect(dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('should call qrcode.toDataURL with correct parameters', async () => {
    const QRCode = require('qrcode')
    await generateQRCode('test-data')

    expect(QRCode.toDataURL).toHaveBeenCalledWith('test-data', expect.objectContaining({
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
    }))
  })

  it('should handle different input data', async () => {
    const dataUrl = await generateQRCode('CANNAGRI-ABC123-XYZ789-1234567890')
    expect(dataUrl).toMatch(/^data:image\/png;base64,/)
  })
})

describe('generateQRCodeBuffer', () => {
  it('should generate a Buffer', async () => {
    const buffer = await generateQRCodeBuffer('test-data')
    expect(Buffer.isBuffer(buffer)).toBe(true)
  })

  it('should generate PNG buffer (mock)', async () => {
    const buffer = await generateQRCodeBuffer('test-data')
    // PNG magic bytes: 89 50 4E 47
    expect(buffer[0]).toBe(0x89)
    expect(buffer[1]).toBe(0x50)
    expect(buffer[2]).toBe(0x4E)
    expect(buffer[3]).toBe(0x47)
  })

  it('should generate non-empty buffer', async () => {
    const buffer = await generateQRCodeBuffer('test-data')
    expect(buffer.length).toBeGreaterThan(0)
  })
})

describe('generateQRCodeSVG', () => {
  it('should generate valid SVG string', async () => {
    const svg = await generateQRCodeSVG('test-data')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  it('should generate SVG with paths', async () => {
    const svg = await generateQRCodeSVG('test-data')
    expect(svg).toContain('<path')
  })

  it('should call qrcode.toString with correct parameters', async () => {
    const QRCode = require('qrcode')
    await generateQRCodeSVG('test-data')

    expect(QRCode.toString).toHaveBeenCalledWith('test-data', expect.objectContaining({
      type: 'svg',
      width: 200,
    }))
  })
})

describe('verifyQRCodeFormat', () => {
  it('should validate correct QR code format', () => {
    expect(verifyQRCodeFormat('CANNAGRI-order123-ticket456-1234567890')).toBe(true)
  })

  it('should validate format with alphanumeric IDs', () => {
    expect(verifyQRCodeFormat('CANNAGRI-ABC123XYZ-DEF456UVW-9876543210')).toBe(true)
  })

  it('should invalidate incorrect prefix', () => {
    expect(verifyQRCodeFormat('INVALID-order123-ticket456-1234567890')).toBe(false)
  })

  it('should invalidate missing parts', () => {
    expect(verifyQRCodeFormat('CANNAGRI-order123-ticket456')).toBe(false)
  })

  it('should invalidate non-numeric timestamp', () => {
    expect(verifyQRCodeFormat('CANNAGRI-order123-ticket456-abcdef')).toBe(false)
  })

  it('should invalidate empty string', () => {
    expect(verifyQRCodeFormat('')).toBe(false)
  })

  it('should invalidate random text', () => {
    expect(verifyQRCodeFormat('random text here')).toBe(false)
  })

  it('should validate uppercase IDs', () => {
    expect(verifyQRCodeFormat('CANNAGRI-ORDER123-TICKET456-1234567890')).toBe(true)
  })

  it('should validate lowercase IDs', () => {
    expect(verifyQRCodeFormat('CANNAGRI-order123-ticket456-1234567890')).toBe(true)
  })

  it('should validate mixed case IDs', () => {
    expect(verifyQRCodeFormat('CANNAGRI-OrDeR123-TiCkEt456-1234567890')).toBe(true)
  })
})

describe('parseQRCodeData', () => {
  it('should parse valid QR code data', () => {
    const result = parseQRCodeData('CANNAGRI-order123-ticket456-1234567890')
    expect(result).not.toBeNull()
    expect(result?.prefix).toBe('CANNAGRI')
    expect(result?.orderId).toBe('order123')
    expect(result?.ticketId).toBe('ticket456')
    expect(result?.timestamp).toBe(1234567890)
  })

  it('should return null for invalid format', () => {
    expect(parseQRCodeData('INVALID-data')).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(parseQRCodeData('')).toBeNull()
  })

  it('should parse alphanumeric IDs correctly', () => {
    const result = parseQRCodeData('CANNAGRI-CAE1ABC2XYZ-TKT3DEF4UVW-9999999999')
    expect(result).not.toBeNull()
    expect(result?.orderId).toBe('CAE1ABC2XYZ')
    expect(result?.ticketId).toBe('TKT3DEF4UVW')
  })

  it('should convert timestamp to number', () => {
    const result = parseQRCodeData('CANNAGRI-order123-ticket456-1703462400000')
    expect(result?.timestamp).toBe(1703462400000)
    expect(typeof result?.timestamp).toBe('number')
  })

  it('should return null for missing timestamp', () => {
    expect(parseQRCodeData('CANNAGRI-order123-ticket456-')).toBeNull()
  })
})

describe('QR Code Integration', () => {
  it('should generate and verify QR code data round-trip', async () => {
    const orderId = 'CAETEST123'
    const ticketId = 'TKT789'

    // Generate QR code data (without hyphens in IDs to match the regex)
    const timestamp = Date.now()
    const qrData = `CANNAGRI-${orderId}-${ticketId}-${timestamp}`

    // Verify format
    expect(verifyQRCodeFormat(qrData)).toBe(true)

    // Parse and verify components
    const parsed = parseQRCodeData(qrData)
    expect(parsed).not.toBeNull()
    expect(parsed?.orderId).toBe(orderId)
    expect(parsed?.ticketId).toBe(ticketId)

    // Generate actual QR code (mocked)
    const qrCodeDataUrl = await generateQRCode(qrData)
    expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('should generate valid QR codes from parsed data', async () => {
    const testData = 'CANNAGRI-ORDER001-TICKET001-1234567890'
    const parsed = parseQRCodeData(testData)

    if (parsed) {
      const reconstructed = `${parsed.prefix}-${parsed.orderId}-${parsed.ticketId}-${parsed.timestamp}`
      expect(reconstructed).toBe(testData)

      const qrCode = await generateQRCode(reconstructed)
      expect(qrCode).toMatch(/^data:image\/png;base64,/)
    }
  })
})

describe('QR Code error handling', () => {
  it('should handle QR code generation error', async () => {
    const QRCode = require('qrcode')
    QRCode.toDataURL.mockRejectedValueOnce(new Error('Generation failed'))

    await expect(generateQRCode('test')).rejects.toThrow('Failed to generate QR code')
  })

  it('should handle buffer generation error', async () => {
    const QRCode = require('qrcode')
    QRCode.toBuffer.mockRejectedValueOnce(new Error('Buffer generation failed'))

    await expect(generateQRCodeBuffer('test')).rejects.toThrow('Failed to generate QR code')
  })

  it('should handle SVG generation error', async () => {
    const QRCode = require('qrcode')
    QRCode.toString.mockRejectedValueOnce(new Error('SVG generation failed'))

    await expect(generateQRCodeSVG('test')).rejects.toThrow('Failed to generate QR code')
  })
})
