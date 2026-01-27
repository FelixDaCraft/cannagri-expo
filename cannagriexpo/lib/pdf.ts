import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { siteConfig } from '@/config/site'
import type { Sponsor, SponsorType } from '@/types'
import * as fs from 'fs'
import * as path from 'path'

interface TicketPDFData {
  ticketId: string
  customerName: string
  ticketType: string
  orderNumber: string
  qrCodeImage: string // Base64 data URL
  sponsors?: Sponsor[] // Active sponsors with logos
}

// Tailles des logos des sponsors dans le PDF (en points)
// Proportionnelles aux tailles affichées sur la page d'accueil
const sponsorSizesForPDF: Record<SponsorType, { width: number; height: number }> = {
  PLATINE: { width: 80, height: 45 },
  OR: { width: 65, height: 38 },
  ARGENT: { width: 50, height: 30 },
  BRONZE: { width: 40, height: 25 },
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

  // Try to embed the logo
  let logoWidth = 0
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.PNG')
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath)
      const logoImage = await pdfDoc.embedPng(logoBytes)

      // Scale logo to fit header (max height ~80px)
      const maxLogoHeight = 80
      const scale = maxLogoHeight / logoImage.height
      logoWidth = logoImage.width * scale
      const logoHeight = maxLogoHeight

      page.drawImage(logoImage, {
        x: 50,
        y: height - 115,
        width: logoWidth,
        height: logoHeight,
      })
    }
  } catch (error) {
    console.error('Error embedding logo:', error)
  }

  // Title - positioned after logo
  const titleX = logoWidth > 0 ? 50 + logoWidth + 15 : 50

  page.drawText(siteConfig.name.toUpperCase(), {
    x: titleX,
    y: height - 60,
    size: 28,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText('E-BILLET', {
    x: titleX,
    y: height - 95,
    size: 18,
    font: helvetica,
    color: sageGreen,
  })

  // Event info
  page.drawText(`${siteConfig.event.date} - ${siteConfig.event.location}, ${siteConfig.event.city}`, {
    x: titleX,
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

  // Sponsors section
  if (data.sponsors && data.sponsors.length > 0) {
    const sponsorsY = instructionsY - 160

    page.drawText('NOS PARTENAIRES', {
      x: 50,
      y: sponsorsY,
      size: 14,
      font: helveticaBold,
      color: forestGreen,
    })

    page.drawLine({
      start: { x: 50, y: sponsorsY - 15 },
      end: { x: width - 50, y: sponsorsY - 15 },
      thickness: 1,
      color: sageGreen,
    })

    // Group sponsors by type and sort by tier (PLATINE first, then OR, ARGENT, BRONZE)
    const tierOrder: SponsorType[] = ['PLATINE', 'OR', 'ARGENT', 'BRONZE']
    const sponsorsByTier = tierOrder.reduce((acc, tier) => {
      acc[tier] = data.sponsors!.filter(s => s.type === tier && s.logoUrl && s.isActive)
      return acc
    }, {} as Record<SponsorType, Sponsor[]>)

    let currentX = 50
    let currentY = sponsorsY - 50
    const maxX = width - 50
    const rowHeight = 60

    // Draw sponsors by tier
    for (const tier of tierOrder) {
      const tierSponsors = sponsorsByTier[tier]
      if (tierSponsors.length === 0) continue

      const sizes = sponsorSizesForPDF[tier]

      for (const sponsor of tierSponsors) {
        // Check if we need to move to next row
        if (currentX + sizes.width > maxX) {
          currentX = 50
          currentY -= rowHeight
        }

        // Skip if we're running out of vertical space
        if (currentY < 100) break

        // Try to embed the sponsor logo
        if (sponsor.logoUrl) {
          try {
            // Fetch the logo image
            const logoResponse = await fetch(sponsor.logoUrl)
            if (logoResponse.ok) {
              const logoBytes = await logoResponse.arrayBuffer()
              const logoUint8 = new Uint8Array(logoBytes)

              let logoImage
              // Try PNG first, then JPEG
              try {
                logoImage = await pdfDoc.embedPng(logoUint8)
              } catch {
                try {
                  logoImage = await pdfDoc.embedJpg(logoUint8)
                } catch {
                  // Skip if we can't embed the image
                  console.log(`Could not embed logo for ${sponsor.name}`)
                  continue
                }
              }

              // Calculate scaled dimensions preserving aspect ratio
              const originalWidth = logoImage.width
              const originalHeight = logoImage.height
              const aspectRatio = originalWidth / originalHeight

              let drawWidth = sizes.width
              let drawHeight = sizes.width / aspectRatio

              // If height exceeds max, scale by height instead
              if (drawHeight > sizes.height) {
                drawHeight = sizes.height
                drawWidth = sizes.height * aspectRatio
              }

              page.drawImage(logoImage, {
                x: currentX,
                y: currentY - drawHeight / 2,
                width: drawWidth,
                height: drawHeight,
              })

              currentX += drawWidth + 15 // Add spacing between logos
            }
          } catch (error) {
            console.error(`Error loading logo for ${sponsor.name}:`, error)
          }
        }
      }
    }
  }

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
    STANDARD: 'Billet Standard',
    FLEX: 'Billet Flex',
  }
  return labels[type] || type
}

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
