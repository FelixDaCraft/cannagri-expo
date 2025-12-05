import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { siteConfig } from '@/config/site'

interface TicketPDFData {
  ticketId: string
  customerName: string
  ticketType: string
  orderNumber: string
  qrCodeImage: string // Base64 data URL
}

/**
 * Generate a ticket PDF with QR code
 */
export async function generateTicketPDF(data: TicketPDFData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size

  // Fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Colors
  const forestGreen = rgb(46/255, 74/255, 51/255)
  const sageGreen = rgb(164/255, 180/255, 148/255)
  const darkGray = rgb(51/255, 51/255, 51/255)

  const { width, height } = page.getSize()

  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 150,
    width,
    height: 150,
    color: forestGreen,
  })

  // Title
  page.drawText(siteConfig.name.toUpperCase(), {
    x: 50,
    y: height - 60,
    size: 28,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText('E-BILLET', {
    x: 50,
    y: height - 95,
    size: 18,
    font: helvetica,
    color: sageGreen,
  })

  // Event info
  page.drawText(`${siteConfig.event.date} - ${siteConfig.event.location}, ${siteConfig.event.city}`, {
    x: 50,
    y: height - 130,
    size: 12,
    font: helvetica,
    color: rgb(1, 1, 1),
  })

  // Embed QR code
  if (data.qrCodeImage) {
    try {
      const qrImageBytes = Buffer.from(data.qrCodeImage.split(',')[1], 'base64')
      const qrImage = await pdfDoc.embedPng(qrImageBytes)
      const qrDims = qrImage.scale(0.6)

      page.drawImage(qrImage, {
        x: width - qrDims.width - 50,
        y: height - 350,
        width: qrDims.width,
        height: qrDims.height,
      })
    } catch (error) {
      console.error('Error embedding QR code:', error)
    }
  }

  // Ticket details
  const detailsY = height - 220

  page.drawText('INFORMATIONS DU BILLET', {
    x: 50,
    y: detailsY,
    size: 14,
    font: helveticaBold,
    color: forestGreen,
  })

  // Divider line
  page.drawLine({
    start: { x: 50, y: detailsY - 15 },
    end: { x: 300, y: detailsY - 15 },
    thickness: 1,
    color: sageGreen,
  })

  const details = [
    { label: 'Nom', value: data.customerName },
    { label: 'Type de billet', value: getTicketTypeLabel(data.ticketType) },
    { label: 'N° de commande', value: data.orderNumber },
    { label: 'N° de billet', value: data.ticketId },
  ]

  details.forEach((detail, index) => {
    const y = detailsY - 50 - (index * 40)

    page.drawText(detail.label, {
      x: 50,
      y,
      size: 10,
      font: helvetica,
      color: darkGray,
    })

    page.drawText(detail.value, {
      x: 50,
      y: y - 18,
      size: 14,
      font: helveticaBold,
      color: forestGreen,
    })
  })

  // Instructions
  const instructionsY = height - 480

  page.drawText('INSTRUCTIONS', {
    x: 50,
    y: instructionsY,
    size: 14,
    font: helveticaBold,
    color: forestGreen,
  })

  page.drawLine({
    start: { x: 50, y: instructionsY - 15 },
    end: { x: width - 50, y: instructionsY - 15 },
    thickness: 1,
    color: sageGreen,
  })

  const instructions = [
    '1. Présentez ce billet (imprimé ou sur smartphone) à l\'entrée du salon.',
    '2. Le QR code sera scanné pour valider votre accès.',
    '3. Ce billet est personnel et ne peut être utilisé qu\'une seule fois.',
    '4. Conservez ce document précieusement.',
  ]

  instructions.forEach((instruction, index) => {
    page.drawText(instruction, {
      x: 50,
      y: instructionsY - 40 - (index * 25),
      size: 11,
      font: helvetica,
      color: darkGray,
    })
  })

  // Footer
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 60,
    color: forestGreen,
  })

  page.drawText(`${siteConfig.name} - ${siteConfig.contact.email}`, {
    x: 50,
    y: 25,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1),
  })

  page.drawText('Ce billet a été généré automatiquement.', {
    x: width - 250,
    y: 25,
    size: 9,
    font: helvetica,
    color: sageGreen,
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

function getTicketTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    VISITEUR: 'Visiteur',
    PASS_PRO: 'Pass Pro',
    VIP: 'VIP',
  }
  return labels[type] || type
}

/**
 * Generate an invoice PDF for stand booking
 */
export async function generateInvoicePDF(data: {
  orderNumber: string
  customerName: string
  companyName?: string
  companySiret?: string
  companyAddress?: string
  items: Array<{
    description: string
    quantity: number
    priceHT: number
  }>
  totalHT: number
  tva: number
  totalTTC: number
}): Promise<Buffer> {
  // Similar implementation to generateTicketPDF
  // with invoice-specific layout
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // ... Invoice layout implementation
  // This is a simplified version

  const { height } = page.getSize()
  const forestGreen = rgb(46/255, 74/255, 51/255)

  page.drawText('FACTURE', {
    x: 50,
    y: height - 50,
    size: 24,
    font: helveticaBold,
    color: forestGreen,
  })

  page.drawText(`N° ${data.orderNumber}`, {
    x: 50,
    y: height - 80,
    size: 14,
    font: helvetica,
  })

  // Add more invoice details...

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
