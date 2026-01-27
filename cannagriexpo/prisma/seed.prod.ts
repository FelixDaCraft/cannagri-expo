import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting PRODUCTION seed...')

  // Create admin user only
  const hashedPassword = await bcrypt.hash('CannAgri2026!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cannagri-expo.fr' },
    update: {
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'admin@cannagri-expo.fr',
      name: 'YannMlt',
      hashedPassword,
      role: 'SUPER_ADMIN',
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

  // Create stands (25 stands matching the floor plan) - ALL FREE, no reservations
  const stands = [
    // Rangee du haut (stands 3-8)
    { number: 3, surfaceM2: 4, priceHT: 150, x: 195, y: 30, width: 50, height: 50 },
    { number: 4, surfaceM2: 4, priceHT: 150, x: 255, y: 30, width: 50, height: 50 },
    { number: 5, surfaceM2: 4, priceHT: 150, x: 315, y: 30, width: 50, height: 50 },
    { number: 6, surfaceM2: 4, priceHT: 150, x: 375, y: 30, width: 50, height: 50 },
    { number: 7, surfaceM2: 4, priceHT: 150, x: 435, y: 30, width: 50, height: 50 },
    { number: 8, surfaceM2: 4, priceHT: 150, x: 495, y: 30, width: 50, height: 50 },
    // Stands 1-2 (a cote conference)
    { number: 2, surfaceM2: 4, priceHT: 150, x: 195, y: 100, width: 50, height: 50 },
    { number: 1, surfaceM2: 4, priceHT: 150, x: 195, y: 160, width: 50, height: 50 },
    // Colonne de droite (stands 9-18)
    { number: 9, surfaceM2: 4, priceHT: 150, x: 555, y: 30, width: 50, height: 50 },
    { number: 10, surfaceM2: 4, priceHT: 150, x: 555, y: 90, width: 50, height: 50 },
    { number: 11, surfaceM2: 4, priceHT: 150, x: 555, y: 150, width: 50, height: 50 },
    { number: 12, surfaceM2: 4, priceHT: 150, x: 555, y: 210, width: 50, height: 50 },
    { number: 13, surfaceM2: 4, priceHT: 150, x: 555, y: 270, width: 50, height: 50 },
    { number: 14, surfaceM2: 4, priceHT: 150, x: 555, y: 330, width: 50, height: 50 },
    { number: 15, surfaceM2: 4, priceHT: 150, x: 555, y: 390, width: 50, height: 50 },
    { number: 16, surfaceM2: 4, priceHT: 150, x: 555, y: 450, width: 50, height: 50 },
    { number: 17, surfaceM2: 4, priceHT: 150, x: 555, y: 510, width: 50, height: 50 },
    { number: 18, surfaceM2: 4, priceHT: 150, x: 555, y: 570, width: 50, height: 50 },
    // Rangee du bas (stands 25-19)
    { number: 25, surfaceM2: 4, priceHT: 150, x: 135, y: 570, width: 50, height: 50 },
    { number: 24, surfaceM2: 4, priceHT: 150, x: 195, y: 570, width: 50, height: 50 },
    { number: 23, surfaceM2: 4, priceHT: 150, x: 255, y: 570, width: 50, height: 50 },
    { number: 22, surfaceM2: 4, priceHT: 150, x: 315, y: 570, width: 50, height: 50 },
    { number: 21, surfaceM2: 4, priceHT: 150, x: 375, y: 570, width: 50, height: 50 },
    { number: 20, surfaceM2: 4, priceHT: 150, x: 435, y: 570, width: 50, height: 50 },
    { number: 19, surfaceM2: 4, priceHT: 150, x: 555, y: 570, width: 50, height: 50 },
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
        size: 'SMALL',
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
  console.log(`${stands.length} stands created (all FREE)`)

  // NO EVENTS - Program will be added later via admin panel
  // NO SPONSORS - They will be added manually via admin panel
  // NO DEMO USERS - Only admin account
  // NO STAND RESERVATIONS - All stands are FREE

  console.log('PRODUCTION seed completed!')
  console.log('')
  console.log('Summary:')
  console.log('- 1 admin account (admin@cannagri-expo.fr)')
  console.log('- 25 stands (all FREE)')
  console.log('- 0 events (add via admin)')
  console.log('- 0 sponsors (add via admin)')
  console.log('- 0 demo users')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
