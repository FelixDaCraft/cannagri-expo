import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { siteConfig } from '@/config/site'
import * as fs from 'fs'
import * as path from 'path'

export { generateTicketPDF } from '@/lib/ticket-pdf'

interface InvoicePDFData {
  invoiceNumber: string
  orderNumber: string
  invoiceDate: Date
  customerName: string
  customerEmail: string
  companyName?: string
  companySiret?: string
  companyAddress?: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
  }>
  totalTTC: number
  orderType: 'STAND_BOOKING' | 'VISITOR_TICKET'
}

/**
 * Generate an invoice PDF for orders (stands or tickets)
 * Note: Association non assujettie à la TVA (Art. 293B du CGI)
 */
export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size

  // Fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Colors
  const forestGreen = rgb(46/255, 74/255, 51/255)
  const sageGreen = rgb(164/255, 180/255, 148/255)
  const darkGray = rgb(51/255, 51/255, 51/255)
  const lightGray = rgb(128/255, 128/255, 128/255)
  const black = rgb(0, 0, 0)

  const { width, height } = page.getSize()
  const margin = 50
  let currentY = height - margin

  // ===== HEADER =====
  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width,
    height: 120,
    color: forestGreen,
  })

  // Try to embed the logo
  let logoWidth = 0
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.PNG')
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath)
      const logoImage = await pdfDoc.embedPng(logoBytes)
      const maxLogoHeight = 70
      const scale = maxLogoHeight / logoImage.height
      logoWidth = logoImage.width * scale
      page.drawImage(logoImage, {
        x: margin,
        y: height - 95,
        width: logoWidth,
        height: maxLogoHeight,
      })
    }
  } catch (error) {
    console.error('Error embedding logo in invoice:', error)
  }

  // Title
  const titleX = logoWidth > 0 ? margin + logoWidth + 20 : margin
  page.drawText(siteConfig.name.toUpperCase(), {
    x: titleX,
    y: height - 55,
    size: 22,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText('FACTURE', {
    x: titleX,
    y: height - 85,
    size: 16,
    font: helvetica,
    color: sageGreen,
  })

  currentY = height - 150

  // ===== INVOICE INFO & DATE =====
  const invoiceDate = data.invoiceDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Invoice number and date on the right
  page.drawText(`Facture N° ${data.invoiceNumber}`, {
    x: width - margin - 180,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: forestGreen,
  })

  page.drawText(`Date : ${invoiceDate}`, {
    x: width - margin - 180,
    y: currentY - 18,
    size: 10,
    font: helvetica,
    color: darkGray,
  })

  page.drawText(`Réf. commande : ${data.orderNumber}`, {
    x: width - margin - 180,
    y: currentY - 36,
    size: 10,
    font: helvetica,
    color: darkGray,
  })

  // ===== SELLER INFO (left side) =====
  page.drawText('ÉMETTEUR', {
    x: margin,
    y: currentY,
    size: 10,
    font: helveticaBold,
    color: lightGray,
  })

  const sellerInfo = [
    siteConfig.name,
    'Association loi 1901',
    'Siège social : Nantes, France',
    siteConfig.contact.email,
  ]

  sellerInfo.forEach((line, index) => {
    page.drawText(line, {
      x: margin,
      y: currentY - 18 - (index * 14),
      size: 10,
      font: index === 0 ? helveticaBold : helvetica,
      color: darkGray,
    })
  })

  currentY -= 100

  // ===== BUYER INFO =====
  page.drawRectangle({
    x: margin,
    y: currentY - 80,
    width: width - (margin * 2),
    height: 85,
    color: rgb(248/255, 247/255, 243/255), // cream background
    borderColor: sageGreen,
    borderWidth: 1,
  })

  page.drawText('FACTURÉ À', {
    x: margin + 15,
    y: currentY - 5,
    size: 10,
    font: helveticaBold,
    color: lightGray,
  })

  const buyerLines: string[] = []
  if (data.companyName) {
    buyerLines.push(data.companyName)
  }
  buyerLines.push(data.customerName)
  if (data.companySiret) {
    buyerLines.push(`SIRET : ${data.companySiret}`)
  }
  if (data.companyAddress) {
    buyerLines.push(data.companyAddress)
  }
  buyerLines.push(data.customerEmail)

  buyerLines.forEach((line, index) => {
    page.drawText(line, {
      x: margin + 15,
      y: currentY - 22 - (index * 14),
      size: 10,
      font: index === 0 ? helveticaBold : helvetica,
      color: darkGray,
    })
  })

  currentY -= 110

  // ===== ITEMS TABLE =====
  const tableTop = currentY
  const colX = {
    description: margin,
    quantity: width - margin - 180,
    unitPrice: width - margin - 110,
    total: width - margin - 50,
  }

  // Table header
  page.drawRectangle({
    x: margin,
    y: tableTop - 25,
    width: width - (margin * 2),
    height: 25,
    color: forestGreen,
  })

  page.drawText('Description', {
    x: colX.description + 10,
    y: tableTop - 17,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText('Qté', {
    x: colX.quantity,
    y: tableTop - 17,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText('P.U.', {
    x: colX.unitPrice,
    y: tableTop - 17,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText('Total', {
    x: colX.total,
    y: tableTop - 17,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  currentY = tableTop - 25

  // Table rows
  data.items.forEach((item, index) => {
    const rowY = currentY - 30 - (index * 30)
    const lineTotal = item.quantity * item.unitPrice

    // Alternate row background
    if (index % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: rowY - 8,
        width: width - (margin * 2),
        height: 30,
        color: rgb(248/255, 247/255, 243/255),
      })
    }

    page.drawText(item.description, {
      x: colX.description + 10,
      y: rowY + 5,
      size: 10,
      font: helvetica,
      color: darkGray,
    })

    page.drawText(item.quantity.toString(), {
      x: colX.quantity + 5,
      y: rowY + 5,
      size: 10,
      font: helvetica,
      color: darkGray,
    })

    page.drawText(`${item.unitPrice.toFixed(2)} €`, {
      x: colX.unitPrice - 10,
      y: rowY + 5,
      size: 10,
      font: helvetica,
      color: darkGray,
    })

    page.drawText(`${lineTotal.toFixed(2)} €`, {
      x: colX.total - 15,
      y: rowY + 5,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    })

    currentY = rowY - 8
  })

  // Table bottom line
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: width - margin, y: currentY },
    thickness: 1,
    color: sageGreen,
  })

  currentY -= 30

  // ===== TOTALS =====
  const totalsX = width - margin - 180

  // Total TTC (no TVA for association)
  page.drawRectangle({
    x: totalsX - 10,
    y: currentY - 30,
    width: 190,
    height: 35,
    color: forestGreen,
  })

  page.drawText('TOTAL TTC', {
    x: totalsX,
    y: currentY - 20,
    size: 12,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText(`${data.totalTTC.toFixed(2)} €`, {
    x: width - margin - 60,
    y: currentY - 20,
    size: 14,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  currentY -= 60

  // ===== TVA NOTICE =====
  page.drawText('TVA non applicable - Art. 293B du CGI', {
    x: totalsX,
    y: currentY,
    size: 9,
    font: helvetica,
    color: lightGray,
  })

  currentY -= 40

  // ===== PAYMENT STATUS =====
  page.drawRectangle({
    x: margin,
    y: currentY - 25,
    width: width - (margin * 2),
    height: 30,
    color: rgb(220/255, 237/255, 222/255), // light green background
    borderColor: sageGreen,
    borderWidth: 1,
  })

  page.drawText('PAYE', {
    x: margin + 15,
    y: currentY - 15,
    size: 12,
    font: helveticaBold,
    color: forestGreen,
  })

  page.drawText(`Paiement reçu le ${invoiceDate}`, {
    x: margin + 80,
    y: currentY - 15,
    size: 10,
    font: helvetica,
    color: forestGreen,
  })

  // ===== FOOTER =====
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 70,
    color: forestGreen,
  })

  page.drawText(`${siteConfig.name} - Association loi 1901`, {
    x: margin,
    y: 40,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText(`${siteConfig.contact.email}`, {
    x: margin,
    y: 25,
    size: 9,
    font: helvetica,
    color: sageGreen,
  })

  page.drawText('Merci pour votre confiance !', {
    x: width - margin - 140,
    y: 32,
    size: 10,
    font: helvetica,
    color: sageGreen,
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
