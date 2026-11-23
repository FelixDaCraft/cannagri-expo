import { readFile } from 'fs/promises'
import path from 'path'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PDFFont, PDFImage, PDFPage, degrees, rgb, setCharacterSpacing } from 'pdf-lib'
import { formatVenueAddress, type EditionSummary } from '@/lib/editions/format'
import type { Sponsor, SponsorType } from '@/types'

/** Billet au format ticket, 210 × 82 mm. Les positions sont en mm depuis le coin haut gauche. */
const MM = 72 / 25.4
const WIDTH_MM = 210
const HEIGHT_MM = 82
const STUB_X_MM = 148
const STUB_CENTER_MM = (STUB_X_MM + WIDTH_MM) / 2
const LEFT_MM = 9
const TEXT_WIDTH_MM = 85
const QR_SIZE_MM = 47
const MASCOT_HEIGHT_MM = 72
const ANNIVERSARY_YEAR = 2027
const LOGO_TIMEOUT_MS = 3000

const NIGHT = rgb(0x1d / 255, 0x2b / 255, 0x3a / 255)
const CREAM = rgb(0xf4 / 255, 0xea / 255, 0xd5 / 255)
const GOLD = rgb(0xc9 / 255, 0xa0 / 255, 0x4a / 255)
const ANNOTATION = rgb(0xe0 / 255, 0xa9 / 255, 0x3b / 255)

const ASSETS = path.join(process.cwd(), 'public', 'billet')
const FONT_FILES = {
  display: 'Modak-Regular.ttf',
  accent: 'Chewy-Regular.ttf',
  medium: 'BarlowCondensed-Medium.ttf',
  semibold: 'BarlowCondensed-SemiBold.ttf',
  bold: 'BarlowCondensed-Bold.ttf',
} as const
type FontName = keyof typeof FONT_FILES
type Fonts = Record<FontName, PDFFont>

const LOGO_HEIGHT_MM: Record<SponsorType, number> = { PLATINE: 9, OR: 8, ARGENT: 7, BRONZE: 6 }
const TIER_ORDER: SponsorType[] = ['PLATINE', 'OR', 'ARGENT', 'BRONZE']

export interface TicketPDFData {
  ticketId: string
  customerName: string
  ticketType: string
  orderNumber: string
  qrCodeImage: string // Data URL base64 (PNG)
  sponsors?: Sponsor[]
  edition: EditionSummary
}

/** Plus grande taille entre min et max à laquelle le texte tient dans la largeur. */
export function fitTextSize(
  text: string,
  measure: (text: string, size: number) => number,
  maxWidth: number,
  maxSize: number,
  minSize: number
): number {
  const width = measure(text, maxSize)
  if (width <= maxWidth) return maxSize
  return Math.max(minSize, Math.floor((maxSize * maxWidth * 10) / width) / 10)
}

/** « 10h00 - 19h30 » devient « 10h – 19h30 », comme sur l'affiche. */
export function formatTicketHours(hours: string | null | undefined): string | null {
  return hours ? hours.replace(/h00/g, 'h').replace(' - ', ' – ') : null
}

export function showsAnniversary(year: number): boolean {
  return year === ANNIVERSARY_YEAR
}

const fontBytes = new Map<FontName, Promise<Buffer>>()

function loadFontBytes(name: FontName): Promise<Buffer> {
  let bytes = fontBytes.get(name)
  if (!bytes) {
    bytes = readFile(path.join(ASSETS, 'fonts', FONT_FILES[name]))
    fontBytes.set(name, bytes)
  }
  return bytes
}

async function embedFonts(pdf: PDFDocument): Promise<Fonts> {
  pdf.registerFontkit(fontkit)
  const names = Object.keys(FONT_FILES) as FontName[]
  const embedded = await Promise.all(
    names.map(async (name) => pdf.embedFont(await loadFontBytes(name), { subset: true }))
  )
  return Object.fromEntries(names.map((name, i) => [name, embedded[i]])) as Fonts
}

interface TextOptions {
  x: number
  y: number
  size: number
  font: PDFFont
  color?: ReturnType<typeof rgb>
  /** Interlettrage en points */
  spacing?: number
  center?: boolean
  rotate?: number
}

function drawText(page: PDFPage, text: string, options: TextOptions) {
  const { y, size, font, color = CREAM, spacing = 0, center = false, rotate = 0 } = options
  const width = font.widthOfTextAtSize(text, size) + spacing * Math.max(0, text.length - 1)
  const x = options.x * MM - (center ? width / 2 : 0)
  if (spacing) page.pushOperators(setCharacterSpacing(spacing))
  page.drawText(text, { x, y: (HEIGHT_MM - y) * MM, size, font, color, rotate: degrees(rotate) })
  if (spacing) page.pushOperators(setCharacterSpacing(0))
}

/** Coupe un nom trop long en deux lignes, au mot le plus proche du milieu. */
function splitName(name: string): [string, string] {
  const words = name.split(/\s+/)
  let best = 1
  let bestGap = Infinity
  for (let i = 1; i < words.length; i++) {
    const gap = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length)
    if (gap < bestGap) {
      bestGap = gap
      best = i
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}

function truncate(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
  let cut = text
  while (cut.length > 1 && font.widthOfTextAtSize(`${cut}…`, size) > maxWidth) cut = cut.slice(0, -1)
  return `${cut.trimEnd()}…`
}

function drawName(page: PDFPage, name: string, fonts: Fonts) {
  const maxWidth = TEXT_WIDTH_MM * MM
  const measure = (text: string, size: number) => fonts.bold.widthOfTextAtSize(text, size)
  const size = fitTextSize(name, measure, maxWidth, 18, 11.5)
  if (measure(name, size) <= maxWidth) {
    drawText(page, name, { x: LEFT_MM, y: 70.7, size, font: fonts.bold })
    return
  }
  const [first, second] = splitName(name)
  drawText(page, truncate(first, fonts.bold, 11, maxWidth), { x: LEFT_MM, y: 67.8, size: 11, font: fonts.bold })
  drawText(page, truncate(second, fonts.bold, 11, maxWidth), { x: LEFT_MM, y: 71.8, size: 11, font: fonts.bold })
}

function venueLines(edition: EditionSummary): [string, string] {
  const full = formatVenueAddress(edition.address ?? null, edition.city)
  const comma = full?.indexOf(',') ?? -1
  if (full && comma > 0) {
    const street = full.slice(0, comma).trim().replace(/^(\d+\s+)Rue\b/, '$1rue')
    const first = edition.venueName ? `${edition.venueName}, ${street}` : street
    return [first, full.slice(comma + 1).trim()]
  }
  return [edition.venueName ?? 'Lieu à venir', full ?? '']
}

async function drawImageAsset(pdf: PDFDocument, file: string): Promise<PDFImage | null> {
  try {
    const bytes = await readFile(path.join(ASSETS, file))
    return file.endsWith('.png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes)
  } catch (error) {
    console.error(`Billet : image ${file} indisponible`, error)
    return null
  }
}

async function loadLogo(pdf: PDFDocument, logoUrl: string): Promise<PDFImage | null> {
  try {
    let bytes: Uint8Array
    if (logoUrl.startsWith('/')) {
      const publicDir = path.join(process.cwd(), 'public')
      const file = path.normalize(path.join(publicDir, logoUrl.split('?')[0]))
      if (!file.startsWith(publicDir + path.sep)) return null
      bytes = await readFile(file)
    } else {
      const response = await fetch(logoUrl, { signal: AbortSignal.timeout(LOGO_TIMEOUT_MS) })
      if (!response.ok) return null
      bytes = new Uint8Array(await response.arrayBuffer())
    }
    return await pdf.embedPng(bytes).catch(() => pdf.embedJpg(bytes))
  } catch {
    return null
  }
}

/** Logos sous l'adresse, chacun sur une pastille crème pour rester lisible sur le bleu. */
async function drawSponsors(pdf: PDFDocument, page: PDFPage, sponsors: Sponsor[] = []) {
  const active = TIER_ORDER.flatMap((tier) => sponsors.filter((s) => s.type === tier && s.isActive && s.logoUrl))
  const logos = await Promise.all(active.map((s) => loadLogo(pdf, s.logoUrl!)))
  const pad = 0.8
  const centerY = 55
  let x = LEFT_MM
  active.forEach((sponsor, index) => {
    const logo = logos[index]
    if (!logo) return
    const h = LOGO_HEIGHT_MM[sponsor.type]
    const w = Math.min((logo.width / logo.height) * h, 26)
    const drawH = (w / logo.width) * logo.height
    if (x + w + pad * 2 > LEFT_MM + TEXT_WIDTH_MM) return
    page.drawRectangle({
      x: x * MM,
      y: (HEIGHT_MM - centerY - h / 2 - pad) * MM,
      width: (w + pad * 2) * MM,
      height: (h + pad * 2) * MM,
      color: CREAM,
    })
    page.drawImage(logo, {
      x: (x + pad) * MM,
      y: (HEIGHT_MM - centerY - drawH / 2) * MM,
      width: w * MM,
      height: drawH * MM,
    })
    x += w + pad * 2 + 2
  })
}

function drawPerforation(page: PDFPage) {
  page.drawLine({
    start: { x: STUB_X_MM * MM, y: 0 },
    end: { x: STUB_X_MM * MM, y: HEIGHT_MM * MM },
    thickness: 0.55 * MM,
    color: CREAM,
    opacity: 0.55,
    dashArray: [1.6 * MM, 1.3 * MM],
  })
}

/** Génère le billet PDF au format ticket, en bleu nuit, avec talon et QR code. */
export async function generateTicketPDF(data: TicketPDFData): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Billet Cann'Agri Expo ${data.edition.year}`)
  const page = pdf.addPage([WIDTH_MM * MM, HEIGHT_MM * MM])
  const fonts = await embedFonts(pdf)
  const { edition } = data

  page.drawRectangle({ x: 0, y: 0, width: WIDTH_MM * MM, height: HEIGHT_MM * MM, color: NIGHT })
  const background = await drawImageAsset(pdf, 'fond.jpg')
  if (background) page.drawImage(background, { x: 0, y: 0, width: WIDTH_MM * MM, height: HEIGHT_MM * MM })

  drawText(page, 'LE SALON PROFESSIONNEL DU CANNABIS CBD', { x: LEFT_MM, y: 9.5, size: 8.6, font: fonts.semibold, spacing: 0.77 })
  drawText(page, "CANN'AGRI EXPO", { x: 8.6, y: 18.8, size: 33, font: fonts.display })
  if (showsAnniversary(edition.year)) {
    drawText(page, 'fête ses 5 ans', { x: 69, y: 30.2, size: 13, font: fonts.accent, color: ANNOTATION, rotate: 3 })
  }

  drawText(page, edition.longDateLabel ?? edition.dateLabel ?? String(edition.year), { x: LEFT_MM, y: 31.7, size: 13, font: fonts.semibold })
  const hours = formatTicketHours(edition.hoursLabel)
  if (hours) drawText(page, hours, { x: LEFT_MM, y: 37, size: 13, font: fonts.semibold })
  const [venue, town] = venueLines(edition)
  drawText(page, truncate(venue, fonts.medium, 9.6, TEXT_WIDTH_MM * MM), { x: LEFT_MM, y: 43.2, size: 9.6, font: fonts.medium })
  if (town) drawText(page, town, { x: LEFT_MM, y: 47.1, size: 9.6, font: fonts.medium })

  await drawSponsors(pdf, page, data.sponsors)

  drawText(page, 'AU NOM DE', { x: LEFT_MM, y: 64, size: 7.2, font: fonts.semibold, color: GOLD, spacing: 0.72 })
  drawName(page, data.customerName, fonts)
  drawText(page, `Commande ${data.orderNumber}`, { x: LEFT_MM, y: 75.5, size: 8.8, font: fonts.medium })

  const mascot = await drawImageAsset(pdf, 'mascotte.png')
  if (mascot) {
    const w = (mascot.width / mascot.height) * MASCOT_HEIGHT_MM
    page.drawImage(mascot, { x: (STUB_X_MM - 2 - w) * MM, y: 2.2 * MM, width: w * MM, height: MASCOT_HEIGHT_MM * MM })
  }

  drawPerforation(page)

  const isFlex = data.ticketType === 'FLEX'
  drawText(page, isFlex ? 'Flex' : 'Standard', { x: STUB_CENTER_MM, y: 12.2, size: isFlex ? 22 : 19, font: fonts.display, center: true })
  try {
    const qr = await pdf.embedPng(Buffer.from(data.qrCodeImage.split(',')[1], 'base64'))
    page.drawImage(qr, {
      x: (STUB_CENTER_MM - QR_SIZE_MM / 2) * MM,
      y: (HEIGHT_MM - 19 - QR_SIZE_MM) * MM,
      width: QR_SIZE_MM * MM,
      height: QR_SIZE_MM * MM,
    })
  } catch (error) {
    console.error('Billet : QR code illisible', error)
  }
  drawText(page, 'N° DE BILLET', { x: STUB_CENTER_MM, y: 73.3, size: 7.2, font: fonts.semibold, color: GOLD, spacing: 0.72, center: true })
  drawText(page, data.ticketId, { x: STUB_CENTER_MM, y: 76.8, size: 8.4, font: fonts.semibold, center: true })

  return Buffer.from(await pdf.save())
}
