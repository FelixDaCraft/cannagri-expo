import QRCode from 'qrcode'

/**
 * Generate a QR code as a data URL (base64 encoded PNG)
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#2E4A33', // Forest green
        light: '#FFFFFF',
      },
    })

    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate a QR code as a buffer (for PDF generation)
 */
export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#2E4A33',
        light: '#FFFFFF',
      },
    })

    return buffer
  } catch (error) {
    console.error('Error generating QR code buffer:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code SVG (for inline HTML)
 */
export async function generateQRCodeSVG(data: string): Promise<string> {
  try {
    const svg = await QRCode.toString(data, {
      type: 'svg',
      width: 200,
      margin: 1,
      color: {
        dark: '#2E4A33',
        light: '#FFFFFF',
      },
    })

    return svg
  } catch (error) {
    console.error('Error generating QR code SVG:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Verify a QR code data format
 */
export function verifyQRCodeFormat(data: string): boolean {
  // Format: CANNAGRI-{orderId}-{ticketId}-{timestamp}
  const pattern = /^CANNAGRI-[a-zA-Z0-9]+-[a-zA-Z0-9]+-\d+$/
  return pattern.test(data)
}

/**
 * Parse QR code data
 */
export function parseQRCodeData(data: string): {
  prefix: string
  orderId: string
  ticketId: string
  timestamp: number
} | null {
  if (!verifyQRCodeFormat(data)) return null

  const parts = data.split('-')
  return {
    prefix: parts[0],
    orderId: parts[1],
    ticketId: parts[2],
    timestamp: parseInt(parts[3]),
  }
}
