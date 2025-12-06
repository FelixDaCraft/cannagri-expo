import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('CannAgri2026!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cannagri-expo.fr' },
    update: {},
    create: {
      email: 'admin@cannagri-expo.fr',
      name: 'YannMlt',
      hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin user created:', admin.email)

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 'site_settings' },
    update: {},
    create: {
      id: 'site_settings',
      eventDate: new Date('2026-03-28'),
      eventLocation: "L'Agronaute",
      eventAddress: "L'Agronaute, Nantes, France",
      ticketingOpenDate: new Date('2026-01-15'),
      ticketingCloseDate: new Date('2026-03-27'),
      visitorTicketPrice: 15,
      proTicketPrice: 25,
      vipTicketPrice: 75,
      showTicketingButton: true,
      maintenanceMode: false,
    },
  })
  console.log('Site settings created')

  // Create sample stands (25 stands matching the floor plan)
  const stands = [
    // Rangée du haut (stands 3-9)
    { number: 3, surfaceM2: 9, priceHT: 350, x: 200, y: 50, width: 55, height: 55 },
    { number: 4, surfaceM2: 9, priceHT: 350, x: 265, y: 50, width: 55, height: 55 },
    { number: 5, surfaceM2: 9, priceHT: 350, x: 330, y: 50, width: 55, height: 55 },
    { number: 6, surfaceM2: 9, priceHT: 350, x: 395, y: 50, width: 55, height: 55 },
    { number: 7, surfaceM2: 9, priceHT: 350, x: 460, y: 50, width: 55, height: 55 },
    { number: 8, surfaceM2: 9, priceHT: 350, x: 525, y: 50, width: 55, height: 55 },
    { number: 9, surfaceM2: 9, priceHT: 350, x: 590, y: 50, width: 55, height: 55 },
    // Stands 1-2 (à côté conférence)
    { number: 2, surfaceM2: 12, priceHT: 450, x: 200, y: 130, width: 55, height: 65 },
    { number: 1, surfaceM2: 12, priceHT: 450, x: 200, y: 205, width: 55, height: 65 },
    // Côté droit (stands 10-18)
    { number: 10, surfaceM2: 9, priceHT: 350, x: 590, y: 130, width: 55, height: 45 },
    { number: 11, surfaceM2: 9, priceHT: 350, x: 590, y: 185, width: 55, height: 45 },
    { number: 12, surfaceM2: 9, priceHT: 350, x: 590, y: 240, width: 55, height: 45 },
    { number: 13, surfaceM2: 9, priceHT: 350, x: 590, y: 295, width: 55, height: 45 },
    { number: 14, surfaceM2: 9, priceHT: 350, x: 590, y: 350, width: 55, height: 45 },
    { number: 15, surfaceM2: 9, priceHT: 350, x: 590, y: 405, width: 55, height: 45 },
    { number: 16, surfaceM2: 9, priceHT: 350, x: 590, y: 460, width: 55, height: 45 },
    { number: 17, surfaceM2: 9, priceHT: 350, x: 590, y: 515, width: 55, height: 45 },
    { number: 18, surfaceM2: 9, priceHT: 350, x: 590, y: 570, width: 55, height: 45 },
    // Rangée du bas (stands 19-25)
    { number: 25, surfaceM2: 9, priceHT: 350, x: 200, y: 570, width: 55, height: 55 },
    { number: 24, surfaceM2: 9, priceHT: 350, x: 265, y: 570, width: 55, height: 55 },
    { number: 23, surfaceM2: 9, priceHT: 350, x: 330, y: 570, width: 55, height: 55 },
    { number: 22, surfaceM2: 9, priceHT: 350, x: 395, y: 570, width: 55, height: 55 },
    { number: 21, surfaceM2: 9, priceHT: 350, x: 460, y: 570, width: 55, height: 55 },
    { number: 20, surfaceM2: 9, priceHT: 350, x: 525, y: 570, width: 55, height: 55 },
    { number: 19, surfaceM2: 9, priceHT: 350, x: 590, y: 625, width: 55, height: 55 },
  ]

  for (const stand of stands) {
    await prisma.stand.upsert({
      where: { number: stand.number },
      update: {},
      create: {
        number: stand.number,
        code: String(stand.number),
        surfaceM2: stand.surfaceM2,
        priceHT: stand.priceHT,
        status: 'FREE',
        size: stand.surfaceM2 >= 12 ? 'MEDIUM' : 'SMALL',
        x: stand.x,
        y: stand.y,
        width: stand.width,
        height: stand.height,
        row: 0,
        col: 0,
        furniturePrice: 120,
        electricityPrice: 80,
      },
    })
  }
  console.log(`${stands.length} stands created`)

  // Create sample events
  const events = [
    {
      title: "Conférence d'ouverture : L'état du marché CBD en France",
      slug: 'conference-ouverture-marche-cbd',
      description: 'Panorama complet du marché CBD français : chiffres clés, tendances et perspectives.',
      type: 'CONFERENCE' as const,
      startAt: new Date('2026-03-28T09:30:00'),
      endAt: new Date('2026-03-28T10:30:00'),
      location: 'Scène principale',
      speakerName: 'Expert à confirmer',
      speakerTitle: 'Analyste marché',
      isHighlighted: true,
      displayOrder: 1,
    },
    {
      title: 'Table ronde : Réglementation européenne du CBD',
      slug: 'table-ronde-reglementation',
      description: 'Discussion autour des évolutions réglementaires et leur impact sur la filière.',
      type: 'CONFERENCE' as const,
      startAt: new Date('2026-03-28T10:45:00'),
      endAt: new Date('2026-03-28T11:45:00'),
      location: 'Scène principale',
      speakerName: "Panel d'experts",
      displayOrder: 2,
    },
    {
      title: 'Atelier : Techniques de culture indoor',
      slug: 'atelier-culture-indoor',
      description: 'Découvrez les dernières innovations en matière de culture indoor.',
      type: 'WORKSHOP' as const,
      startAt: new Date('2026-03-28T14:00:00'),
      endAt: new Date('2026-03-28T15:00:00'),
      location: 'Salle B',
      speakerName: 'Expert technique',
      displayOrder: 3,
    },
    {
      title: 'Platinum CBD Cup - Cérémonie de remise des prix',
      slug: 'platinum-cbd-cup',
      description: "Remise des prix aux meilleures variétés CBD de l'année.",
      type: 'CEREMONY' as const,
      startAt: new Date('2026-03-28T16:30:00'),
      endAt: new Date('2026-03-28T18:00:00'),
      location: 'Scène principale',
      isPlatinumCBDCup: true,
      isHighlighted: true,
      displayOrder: 4,
    },
  ]

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    })
  }
  console.log(`${events.length} events created`)

  // Create sample sponsors
  const sponsors = [
    {
      name: 'CBD Premium France',
      slug: 'cbd-premium-france',
      type: 'PREMIUM' as const,
      description: 'Leader français du CBD premium, engagé pour la qualité et la traçabilité.',
      websiteUrl: 'https://example.com',
      articleTitle: 'Innovation et qualité : notre engagement pour le CBD français',
      articleBody: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      displayOrder: 1,
    },
    {
      name: 'GreenTech Solutions',
      slug: 'greentech-solutions',
      type: 'STANDARD' as const,
      description: 'Solutions innovantes pour la culture de chanvre.',
      websiteUrl: 'https://example.com',
      displayOrder: 2,
    },
  ]

  for (const sponsor of sponsors) {
    await prisma.sponsor.upsert({
      where: { slug: sponsor.slug },
      update: {},
      create: sponsor,
    })
  }
  console.log(`${sponsors.length} sponsors created`)

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
