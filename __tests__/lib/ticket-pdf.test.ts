/**
 * @jest-environment node
 */
import { PDFDocument } from 'pdf-lib'
import { generateTicketPDF, fitTextSize, formatTicketHours, showsAnniversary } from '@/lib/ticket-pdf'
import { formatEditionLongDate, toEditionSummary } from '@/lib/editions/format'
import type { Edition } from '@prisma/client'
import type { Sponsor } from '@/types'

const QR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const edition = {
  year: 2027,
  dateLabel: '3 avril 2027',
  longDateLabel: 'Samedi 3 avril 2027',
  hoursLabel: '10h00 - 19h30',
  venueName: "L'Agronaute",
  address: '2 Rue du Sénégal, 44200 Nantes',
  city: 'Nantes',
}
const billet = { ticketId: 'cmticket0000000000000001', customerName: 'Camille Exemple', ticketType: 'STANDARD', orderNumber: 'CAE-TEST-0001', qrCodeImage: QR, edition }
const MM = 72 / 25.4

describe('generateTicketPDF, format billet', () => {
  it('produit une seule page de 210 × 82 mm', async () => {
    const pdf = await PDFDocument.load(await generateTicketPDF(billet))
    expect(pdf.getPageCount()).toBe(1)
    const { width, height } = pdf.getPage(0).getSize()
    expect(width).toBeCloseTo(210 * MM, 1)
    expect(height).toBeCloseTo(82 * MM, 1)
  })

  it('reste assez léger pour une pièce jointe', async () => {
    expect((await generateTicketPDF(billet)).length).toBeLessThan(1024 * 1024)
  })

  it('accepte un nom accentué, très long ou hors alphabet latin', async () => {
    for (const customerName of ['Łukasz Nguyễn', 'Marie-Charlotte de La Rochefoucauld-Montbel de Saint-Exupéry', '王小明']) {
      await expect(generateTicketPDF({ ...billet, customerName })).resolves.toBeInstanceOf(Buffer)
    }
  })

  it("accepte une édition sans date ni lieu", async () => {
    const vide = { year: 2028, dateLabel: null, venueName: null, city: null }
    await expect(generateTicketPDF({ ...billet, edition: vide })).resolves.toBeInstanceOf(Buffer)
  })

  it('ne casse pas si le logo d’un sponsor est inaccessible', async () => {
    const sponsor = { id: 's', name: 'Sponsor', type: 'OR', isActive: true, logoUrl: 'https://invalide.example/logo.png' } as unknown as Sponsor
    const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('réseau'))
    await expect(generateTicketPDF({ ...billet, sponsors: [sponsor] })).resolves.toBeInstanceOf(Buffer)
    fetchMock.mockRestore()
  })
})

describe('aides du billet', () => {
  const mesure = (texte: string, taille: number) => texte.length * taille * 0.5

  it('garde la taille maximale quand le texte tient', () => {
    expect(fitTextSize('Camille', mesure, 100, 18, 9)).toBe(18)
  })

  it('réduit la taille pour faire tenir un texte long', () => {
    const taille = fitTextSize('x'.repeat(15), mesure, 100, 18, 9)
    expect(taille).toBeLessThan(18)
    expect(mesure('x'.repeat(15), taille)).toBeLessThanOrEqual(100)
  })

  it('ne descend jamais sous la taille minimale', () => {
    expect(fitTextSize('x'.repeat(200), mesure, 100, 18, 9)).toBe(9)
  })

  it('écrit les horaires comme sur l’affiche', () => {
    expect(formatTicketHours('10h00 - 19h30')).toBe('10h – 19h30')
    expect(formatTicketHours(null)).toBeNull()
  })

  it('ne fête les 5 ans que sur l’édition 2027', () => {
    expect(showsAnniversary(2027)).toBe(true)
    expect(showsAnniversary(2026)).toBe(false)
    expect(showsAnniversary(2028)).toBe(false)
  })
})

describe('résumé d’édition pour le billet', () => {
  it('donne le jour de la semaine à l’heure de Paris', () => {
    expect(formatEditionLongDate(new Date('2027-04-03T08:00:00Z'))).toBe('Samedi 3 avril 2027')
    expect(formatEditionLongDate(null)).toBeNull()
  })

  it('transmet date longue, horaires et adresse', () => {
    const resume = toEditionSummary({
      year: 2027,
      startAt: new Date('2027-04-03T08:00:00Z'),
      endAt: new Date('2027-04-03T17:30:00Z'),
      venueName: "L'Agronaute",
      address: '2 Rue du Sénégal, 44200 Nantes',
      city: 'Nantes',
    } as Edition)
    expect(resume).toMatchObject({
      longDateLabel: 'Samedi 3 avril 2027',
      hoursLabel: '10h00 - 19h30',
      address: '2 Rue du Sénégal, 44200 Nantes',
    })
  })
})
