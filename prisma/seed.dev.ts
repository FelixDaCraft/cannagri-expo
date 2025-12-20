/**
 * Seed script for DEVELOPMENT environment
 * Creates complete test data for dev.cannagri-expo.eu
 *
 * Run with: npm run db:seed:dev
 */

import { PrismaClient, StandStatus, SponsorType, BusinessType, EventType, TicketType, TicketStatus, OrderType, OrderStatus, ContactType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting DEVELOPMENT seed...')
  console.log('⚠️  This will populate the DEV database with test data\n')

  // ============================================================================
  // 1. USERS - Comptes de test
  // ============================================================================
  console.log('👤 Creating test users...')

  const adminPassword = await bcrypt.hash('DevAdmin2026!', 12)
  const testPassword = await bcrypt.hash('DevTest123!', 12)

  const users = [
    {
      email: 'admin@dev.cannagri-expo.fr',
      name: 'Admin Dev',
      hashedPassword: adminPassword,
      role: 'SUPER_ADMIN' as const,
      isApproved: true,
    },
    {
      email: 'moderator@dev.cannagri-expo.fr',
      name: 'Moderateur Dev',
      hashedPassword: testPassword,
      role: 'ADMIN' as const,
      isApproved: true,
    },
    {
      email: 'contributor@dev.cannagri-expo.fr',
      name: 'Contributeur Dev',
      hashedPassword: testPassword,
      role: 'CONTRIBUTOR' as const,
      isApproved: true,
    },
    {
      email: 'pro@dev.cannagri-expo.fr',
      name: 'Jean-Pierre Martin',
      hashedPassword: testPassword,
      role: 'PRO' as const,
      isApproved: true,
      companyName: 'CBD Premium Test',
      companyDescription: 'Producteur de CBD bio en Bretagne, spécialisé dans les fleurs premium.',
      phone: '+33 6 12 34 56 78',
      siret: '12345678901234',
      businessType: 'PRODUCTEURS' as BusinessType,
    },
    {
      email: 'pro2@dev.cannagri-expo.fr',
      name: 'Marie Dupont',
      hashedPassword: testPassword,
      role: 'PRO' as const,
      isApproved: true,
      companyName: 'GrowTech Solutions',
      companyDescription: 'Solutions innovantes pour la culture indoor et outdoor de chanvre.',
      phone: '+33 6 98 76 54 32',
      siret: '98765432109876',
      businessType: 'MATERIEL' as BusinessType,
    },
    {
      email: 'pro-pending@dev.cannagri-expo.fr',
      name: 'Thomas Bernard',
      hashedPassword: testPassword,
      role: 'PRO' as const,
      isApproved: false, // En attente de validation
      companyName: 'Hemp Lifestyle',
      companyDescription: 'Vêtements et accessoires en chanvre.',
      businessType: 'LIFESTYLE' as BusinessType,
    },
    {
      email: 'user@dev.cannagri-expo.fr',
      name: 'Sophie Lambert',
      hashedPassword: testPassword,
      role: 'USER' as const,
      isApproved: true,
    },
    {
      email: 'user2@dev.cannagri-expo.fr',
      name: 'Lucas Moreau',
      hashedPassword: testPassword,
      role: 'USER' as const,
      isApproved: true,
    },
  ]

  const createdUsers: { [key: string]: { id: string } } = {}
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
    createdUsers[user.email] = created
  }
  console.log(`   ✓ ${users.length} users created`)

  // ============================================================================
  // 2. SITE SETTINGS
  // ============================================================================
  console.log('⚙️  Creating site settings...')

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
  console.log('   ✓ Site settings created')

  // ============================================================================
  // 3. STANDS - 25 stands avec différents statuts
  // ============================================================================
  console.log('🏪 Creating stands...')

  const standsData = [
    // Rangée du haut (stands 3-8)
    { number: 3, surfaceM2: 9, priceHT: 350, x: 195, y: 30, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 4, surfaceM2: 9, priceHT: 350, x: 255, y: 30, width: 50, height: 50, status: 'RESERVED' as StandStatus },
    { number: 5, surfaceM2: 9, priceHT: 350, x: 315, y: 30, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 6, surfaceM2: 9, priceHT: 350, x: 375, y: 30, width: 50, height: 50, status: 'SOLD' as StandStatus },
    { number: 7, surfaceM2: 9, priceHT: 350, x: 435, y: 30, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 8, surfaceM2: 9, priceHT: 350, x: 495, y: 30, width: 50, height: 50, status: 'FREE' as StandStatus },
    // Stands 1-2 (à côté conférence)
    { number: 2, surfaceM2: 12, priceHT: 450, x: 195, y: 100, width: 50, height: 50, status: 'SOLD' as StandStatus },
    { number: 1, surfaceM2: 12, priceHT: 450, x: 195, y: 160, width: 50, height: 50, status: 'FREE' as StandStatus },
    // Colonne de droite (stands 9-18)
    { number: 9, surfaceM2: 9, priceHT: 350, x: 555, y: 30, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 10, surfaceM2: 9, priceHT: 350, x: 555, y: 90, width: 50, height: 50, status: 'RESERVED' as StandStatus },
    { number: 11, surfaceM2: 9, priceHT: 350, x: 555, y: 150, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 12, surfaceM2: 9, priceHT: 350, x: 555, y: 210, width: 50, height: 50, status: 'SOLD' as StandStatus },
    { number: 13, surfaceM2: 9, priceHT: 350, x: 555, y: 270, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 14, surfaceM2: 9, priceHT: 350, x: 555, y: 330, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 15, surfaceM2: 9, priceHT: 350, x: 555, y: 390, width: 50, height: 50, status: 'SOLD' as StandStatus },
    { number: 16, surfaceM2: 9, priceHT: 350, x: 555, y: 450, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 17, surfaceM2: 9, priceHT: 350, x: 555, y: 510, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 18, surfaceM2: 9, priceHT: 350, x: 555, y: 570, width: 50, height: 50, status: 'RESERVED' as StandStatus },
    // Rangée du bas (stands 25-19)
    { number: 25, surfaceM2: 9, priceHT: 350, x: 135, y: 570, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 24, surfaceM2: 9, priceHT: 350, x: 195, y: 570, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 23, surfaceM2: 9, priceHT: 350, x: 255, y: 570, width: 50, height: 50, status: 'SOLD' as StandStatus },
    { number: 22, surfaceM2: 9, priceHT: 350, x: 315, y: 570, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 21, surfaceM2: 9, priceHT: 350, x: 375, y: 570, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 20, surfaceM2: 9, priceHT: 350, x: 435, y: 570, width: 50, height: 50, status: 'FREE' as StandStatus },
    { number: 19, surfaceM2: 9, priceHT: 350, x: 555, y: 570, width: 50, height: 50, status: 'FREE' as StandStatus },
  ]

  const createdStands: { [key: number]: { id: string } } = {}
  for (const stand of standsData) {
    const created = await prisma.stand.upsert({
      where: { number: stand.number },
      update: { status: stand.status },
      create: {
        number: stand.number,
        code: String(stand.number),
        surfaceM2: stand.surfaceM2,
        priceHT: stand.priceHT,
        status: stand.status,
        size: stand.surfaceM2 >= 12 ? 'MEDIUM' : 'SMALL',
        x: stand.x,
        y: stand.y,
        width: stand.width,
        height: stand.height,
        row: 0,
        col: 0,
        furniturePrice: 120,
        electricityPrice: 80,
        hasFurniture: stand.status === 'SOLD',
        hasElectricity: stand.status === 'SOLD',
      },
    })
    createdStands[stand.number] = created
  }
  console.log(`   ✓ ${standsData.length} stands created`)

  // ============================================================================
  // 4. SPONSORS - Différents niveaux
  // ============================================================================
  console.log('🏆 Creating sponsors...')

  // Utilisation de logos placeholder via UI Avatars (génère des avatars avec initiales)
  const getPlaceholderLogo = (name: string) => {
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=2d5a3d&color=fff&size=200&font-size=0.4&bold=true`
  }

  const sponsors = [
    {
      name: 'CBD Premium France',
      slug: 'cbd-premium-france',
      type: 'PLATINE' as SponsorType,
      description: 'Leader français du CBD premium, engagé pour la qualité et la traçabilité depuis 2018.',
      websiteUrl: 'https://cbd-premium-france.example.com',
      articleTitle: 'Innovation et qualité : notre engagement pour le CBD français',
      articleBody: `CBD Premium France est fier de soutenir CannAgri Expo 2026 en tant que partenaire Platine.

Notre engagement pour la qualité française:
- 100% de nos produits sont cultivés en France
- Certification bio sur l'ensemble de notre gamme
- Traçabilité complète de la graine au produit fini
- Laboratoires partenaires pour des analyses rigoureuses

Découvrez nos innovations exclusives lors du salon, notamment notre nouvelle gamme d'huiles full-spectrum et nos fleurs premium sélectionnées par nos experts.`,
      logoUrl: getPlaceholderLogo('CBD Premium France'),
      displayOrder: 1,
      isActive: true,
      exhibitorDescription: 'Stand de dégustation et présentation de notre gamme complète de produits CBD premium.',
      exhibitorCategory: 'PRODUCTEURS' as BusinessType,
      contactName: 'Pierre Martin',
      contactEmail: 'contact@cbd-premium-france.example.com',
      contactPhone: '+33 1 23 45 67 89',
    },
    {
      name: 'GreenTech Solutions',
      slug: 'greentech-solutions',
      type: 'OR' as SponsorType,
      description: 'Solutions innovantes pour la culture de chanvre industriel et CBD.',
      websiteUrl: 'https://greentech-solutions.example.com',
      logoUrl: getPlaceholderLogo('GreenTech Solutions'),
      displayOrder: 2,
      isActive: true,
      exhibitorDescription: 'Démonstration de nos systèmes hydroponiques et LED horticoles dernière génération.',
      exhibitorCategory: 'MATERIEL' as BusinessType,
      contactName: 'Sophie Durand',
      contactEmail: 'info@greentech-solutions.example.com',
    },
    {
      name: 'Hemp & Co',
      slug: 'hemp-and-co',
      type: 'OR' as SponsorType,
      description: 'Cosmétiques naturels à base de chanvre, fabrication française.',
      websiteUrl: 'https://hemp-and-co.example.com',
      logoUrl: getPlaceholderLogo('Hemp Co'),
      displayOrder: 3,
      isActive: true,
    },
    {
      name: 'BioHemp Labs',
      slug: 'biohemp-labs',
      type: 'ARGENT' as SponsorType,
      description: 'Laboratoire spécialisé dans l\'analyse et la certification des produits CBD.',
      websiteUrl: 'https://biohemp-labs.example.com',
      logoUrl: getPlaceholderLogo('BioHemp Labs'),
      displayOrder: 4,
      isActive: true,
    },
    {
      name: 'CannaPack',
      slug: 'cannapack',
      type: 'ARGENT' as SponsorType,
      description: 'Solutions d\'emballage éco-responsables pour l\'industrie du CBD.',
      websiteUrl: 'https://cannapack.example.com',
      logoUrl: getPlaceholderLogo('CannaPack'),
      displayOrder: 5,
      isActive: true,
    },
    {
      name: 'Chanvre Info',
      slug: 'chanvre-info',
      type: 'BRONZE' as SponsorType,
      description: 'Magazine en ligne dédié à l\'actualité du chanvre et du CBD.',
      websiteUrl: 'https://chanvre-info.example.com',
      logoUrl: getPlaceholderLogo('Chanvre Info'),
      displayOrder: 6,
      isActive: true,
    },
    {
      name: 'Hemp Store Pro',
      slug: 'hemp-store-pro',
      type: 'BRONZE' as SponsorType,
      description: 'Grossiste B2B en produits CBD pour professionnels.',
      logoUrl: getPlaceholderLogo('Hemp Store Pro'),
      displayOrder: 7,
      isActive: true,
    },
  ]

  for (const sponsor of sponsors) {
    await prisma.sponsor.upsert({
      where: { slug: sponsor.slug },
      update: {},
      create: sponsor,
    })
  }
  console.log(`   ✓ ${sponsors.length} sponsors created`)

  // ============================================================================
  // 5. EVENTS - Programme complet
  // ============================================================================
  console.log('📅 Creating events...')

  const events = [
    {
      title: 'Accueil et ouverture des portes',
      slug: 'accueil-ouverture',
      description: 'Accueil des visiteurs et remise des badges.',
      type: 'BREAK' as EventType,
      startAt: new Date('2026-03-28T09:00:00'),
      endAt: new Date('2026-03-28T09:30:00'),
      location: 'Hall d\'entrée',
      displayOrder: 1,
    },
    {
      title: 'Conférence d\'ouverture : L\'état du marché CBD en France',
      slug: 'conference-ouverture-marche-cbd',
      description: 'Panorama complet du marché CBD français : chiffres clés, tendances et perspectives pour 2026-2030. Analyse des évolutions réglementaires et des opportunités pour les professionnels.',
      type: 'CONFERENCE' as EventType,
      startAt: new Date('2026-03-28T09:30:00'),
      endAt: new Date('2026-03-28T10:30:00'),
      location: 'Scène principale',
      speakerName: 'Dr. Marie Lecomte',
      speakerTitle: 'Économiste spécialisée cannabis',
      speakerCompany: 'Institut du Chanvre',
      speakerBio: 'Docteure en économie, Marie Lecomte étudie les marchés du cannabis légal depuis 10 ans.',
      isHighlighted: true,
      displayOrder: 2,
    },
    {
      title: 'Pause café networking',
      slug: 'pause-cafe-matin',
      description: 'Rencontrez les exposants et les autres visiteurs autour d\'un café.',
      type: 'BREAK' as EventType,
      startAt: new Date('2026-03-28T10:30:00'),
      endAt: new Date('2026-03-28T10:45:00'),
      location: 'Espace restauration',
      displayOrder: 3,
    },
    {
      title: 'Table ronde : Réglementation européenne du CBD',
      slug: 'table-ronde-reglementation',
      description: 'Discussion autour des évolutions réglementaires européennes et leur impact sur la filière française. Avec des experts juridiques et des représentants professionnels.',
      type: 'CONFERENCE' as EventType,
      startAt: new Date('2026-03-28T10:45:00'),
      endAt: new Date('2026-03-28T11:45:00'),
      location: 'Scène principale',
      speakers: JSON.stringify([
        { name: 'Me. Jean Dupont', title: 'Avocat spécialisé', company: 'Cabinet Dupont & Associés' },
        { name: 'Claire Martin', title: 'Directrice juridique', company: 'Syndicat du Chanvre' },
        { name: 'Dr. Hans Mueller', title: 'Expert réglementaire', company: 'EU Cannabis Council' },
      ]),
      displayOrder: 4,
    },
    {
      title: 'Atelier : Techniques de culture indoor',
      slug: 'atelier-culture-indoor',
      description: 'Découvrez les dernières innovations en matière de culture indoor : LED horticoles, systèmes hydroponiques, contrôle climatique automatisé.',
      type: 'WORKSHOP' as EventType,
      startAt: new Date('2026-03-28T11:45:00'),
      endAt: new Date('2026-03-28T12:45:00'),
      location: 'Salle B',
      speakerName: 'Thomas Verger',
      speakerTitle: 'Expert en horticulture',
      speakerCompany: 'GreenTech Solutions',
      displayOrder: 5,
    },
    {
      title: 'Déjeuner',
      slug: 'dejeuner',
      description: 'Pause déjeuner - Food trucks et restauration sur place.',
      type: 'BREAK' as EventType,
      startAt: new Date('2026-03-28T12:45:00'),
      endAt: new Date('2026-03-28T14:00:00'),
      location: 'Espace restauration',
      displayOrder: 6,
    },
    {
      title: 'Conférence : CBD et bien-être - Les dernières recherches',
      slug: 'conference-cbd-bienetre',
      description: 'État des lieux des recherches scientifiques sur les bienfaits du CBD. Études cliniques récentes et perspectives médicales.',
      type: 'CONFERENCE' as EventType,
      startAt: new Date('2026-03-28T14:00:00'),
      endAt: new Date('2026-03-28T15:00:00'),
      location: 'Scène principale',
      speakerName: 'Dr. Sophie Bernard',
      speakerTitle: 'Chercheuse en pharmacologie',
      speakerCompany: 'CNRS',
      isHighlighted: true,
      displayOrder: 7,
    },
    {
      title: 'Atelier : Extraction et transformation du CBD',
      slug: 'atelier-extraction-cbd',
      description: 'Méthodes d\'extraction (CO2, éthanol, huile), purification et formulation. Démonstration pratique.',
      type: 'WORKSHOP' as EventType,
      startAt: new Date('2026-03-28T14:00:00'),
      endAt: new Date('2026-03-28T15:00:00'),
      location: 'Salle B',
      speakerName: 'Marc Lefebvre',
      speakerTitle: 'Ingénieur chimiste',
      speakerCompany: 'BioHemp Labs',
      displayOrder: 8,
    },
    {
      title: 'Session networking B2B',
      slug: 'networking-b2b',
      description: 'Session de networking dédiée aux professionnels. Speed-meetings organisés entre exposants et visiteurs pro.',
      type: 'NETWORKING' as EventType,
      startAt: new Date('2026-03-28T15:00:00'),
      endAt: new Date('2026-03-28T16:00:00'),
      location: 'Espace networking',
      displayOrder: 9,
    },
    {
      title: 'Platinum CBD Cup - Présentation des candidats',
      slug: 'platinum-cbd-cup-presentation',
      description: 'Présentation des variétés en compétition pour le Platinum CBD Cup 2026. Découvrez les producteurs et leurs créations.',
      type: 'CEREMONY' as EventType,
      startAt: new Date('2026-03-28T16:00:00'),
      endAt: new Date('2026-03-28T16:30:00'),
      location: 'Scène principale',
      isPlatinumCBDCup: true,
      displayOrder: 10,
    },
    {
      title: 'Platinum CBD Cup - Cérémonie de remise des prix',
      slug: 'platinum-cbd-cup-ceremonie',
      description: 'Grande cérémonie de remise des prix du Platinum CBD Cup 2026. Catégories : Meilleure fleur indoor, Meilleure fleur outdoor, Innovation de l\'année.',
      type: 'CEREMONY' as EventType,
      startAt: new Date('2026-03-28T16:30:00'),
      endAt: new Date('2026-03-28T18:00:00'),
      location: 'Scène principale',
      isPlatinumCBDCup: true,
      isHighlighted: true,
      displayOrder: 11,
    },
    {
      title: 'Cocktail de clôture',
      slug: 'cocktail-cloture',
      description: 'Cocktail de clôture avec DJ set. Célébrez avec nous la réussite de cette édition 2026 !',
      type: 'NETWORKING' as EventType,
      startAt: new Date('2026-03-28T18:00:00'),
      endAt: new Date('2026-03-28T20:00:00'),
      location: 'Espace principal',
      displayOrder: 12,
    },
  ]

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    })
  }
  console.log(`   ✓ ${events.length} events created`)

  // ============================================================================
  // 6. ORDERS - Commandes de test
  // ============================================================================
  console.log('🛒 Creating test orders...')

  const orders = [
    {
      orderNumber: 'DEV-2026-001',
      type: 'VISITOR_TICKET' as OrderType,
      amount: 30,
      amountHT: 25,
      tva: 20,
      status: 'PAID' as OrderStatus,
      customerEmail: 'sophie.lambert@test.com',
      customerName: 'Sophie Lambert',
      customerPhone: '+33 6 11 22 33 44',
      paidAt: new Date('2026-01-20T10:30:00'),
    },
    {
      orderNumber: 'DEV-2026-002',
      type: 'STAND_BOOKING' as OrderType,
      amount: 420,
      amountHT: 350,
      tva: 20,
      status: 'PAID' as OrderStatus,
      customerEmail: 'pro@dev.cannagri-expo.fr',
      customerName: 'Jean-Pierre Martin',
      customerPhone: '+33 6 12 34 56 78',
      companyName: 'CBD Premium Test',
      companySiret: '12345678901234',
      paidAt: new Date('2026-01-15T14:00:00'),
    },
    {
      orderNumber: 'DEV-2026-003',
      type: 'VISITOR_TICKET' as OrderType,
      amount: 15,
      status: 'PENDING' as OrderStatus,
      customerEmail: 'pending@test.com',
      customerName: 'Client En Attente',
    },
    {
      orderNumber: 'DEV-2026-004',
      type: 'VISITOR_TICKET' as OrderType,
      amount: 15,
      status: 'CANCELLED' as OrderStatus,
      customerEmail: 'cancelled@test.com',
      customerName: 'Commande Annulée',
    },
  ]

  const createdOrders: { [key: string]: { id: string } } = {}
  for (const order of orders) {
    const created = await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: order,
    })
    createdOrders[order.orderNumber] = created
  }
  console.log(`   ✓ ${orders.length} orders created`)

  // ============================================================================
  // 7. TICKETS - Billets de test
  // ============================================================================
  console.log('🎟️  Creating test tickets...')

  const tickets = [
    {
      customerName: 'Sophie Lambert',
      customerEmail: 'sophie.lambert@test.com',
      ticketType: 'STANDARD' as TicketType,
      ticketPrice: 15,
      qrCodeData: 'DEV-TKT-2026-001',
      status: 'PAID' as TicketStatus,
      orderId: createdOrders['DEV-2026-001'].id,
    },
    {
      customerName: 'Lucas Moreau',
      customerEmail: 'lucas.moreau@test.com',
      ticketType: 'STANDARD' as TicketType,
      ticketPrice: 15,
      qrCodeData: 'DEV-TKT-2026-002',
      status: 'PAID' as TicketStatus,
      orderId: createdOrders['DEV-2026-001'].id,
    },
    {
      customerName: 'Marie Test',
      customerEmail: 'marie@test.com',
      ticketType: 'FLEX' as TicketType,
      ticketPrice: 25,
      qrCodeData: 'DEV-TKT-2026-003',
      status: 'PAID' as TicketStatus,
    },
    {
      customerName: 'Ticket Scanné',
      customerEmail: 'scanned@test.com',
      ticketType: 'STANDARD' as TicketType,
      ticketPrice: 15,
      qrCodeData: 'DEV-TKT-2026-004',
      status: 'USED' as TicketStatus,
      scannedAt: new Date('2026-03-28T09:15:00'),
      scannedBy: 'admin@dev.cannagri-expo.fr',
    },
  ]

  for (const ticket of tickets) {
    await prisma.ticket.upsert({
      where: { qrCodeData: ticket.qrCodeData },
      update: {},
      create: ticket,
    })
  }
  console.log(`   ✓ ${tickets.length} tickets created`)

  // ============================================================================
  // 8. MEDIA - Photos galerie
  // ============================================================================
  console.log('📸 Creating media entries...')

  const media = [
    { imageUrl: '/images/gallery/conf-2024-1.jpg', caption: 'Conférence d\'ouverture 2024', edition: '2024', category: 'Conférences', displayOrder: 1 },
    { imageUrl: '/images/gallery/conf-2024-2.jpg', caption: 'Table ronde réglementation', edition: '2024', category: 'Conférences', displayOrder: 2 },
    { imageUrl: '/images/gallery/stands-2024-1.jpg', caption: 'Vue d\'ensemble des stands', edition: '2024', category: 'Stands', displayOrder: 3 },
    { imageUrl: '/images/gallery/stands-2024-2.jpg', caption: 'Stand CBD Premium', edition: '2024', category: 'Stands', displayOrder: 4 },
    { imageUrl: '/images/gallery/cup-2024-1.jpg', caption: 'Platinum CBD Cup - Remise des prix', edition: '2024', category: 'Platinum CBD Cup', displayOrder: 5 },
    { imageUrl: '/images/gallery/cup-2024-2.jpg', caption: 'Gagnant catégorie Indoor', edition: '2024', category: 'Platinum CBD Cup', displayOrder: 6 },
    { imageUrl: '/images/gallery/networking-2024.jpg', caption: 'Session networking', edition: '2024', category: 'Networking', displayOrder: 7 },
    { imageUrl: '/images/gallery/public-2024.jpg', caption: 'Visiteurs au salon', edition: '2024', category: 'Ambiance', displayOrder: 8 },
  ]

  for (const item of media) {
    await prisma.media.create({
      data: item,
    })
  }
  console.log(`   ✓ ${media.length} media entries created`)

  // ============================================================================
  // 9. NEWSLETTER SUBSCRIBERS
  // ============================================================================
  console.log('📧 Creating newsletter subscribers...')

  const subscribers = [
    { email: 'subscriber1@test.com', name: 'Jean Test', isActive: true },
    { email: 'subscriber2@test.com', name: 'Marie Test', isActive: true },
    { email: 'subscriber3@test.com', name: 'Pierre Test', isActive: true },
    { email: 'unsubscribed@test.com', name: 'Désabonné Test', isActive: false, unsubscribedAt: new Date() },
  ]

  for (const sub of subscribers) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: sub.email },
      update: {},
      create: sub,
    })
  }
  console.log(`   ✓ ${subscribers.length} newsletter subscribers created`)

  // ============================================================================
  // 10. CONTACT REQUESTS
  // ============================================================================
  console.log('📬 Creating contact requests...')

  const contacts = [
    {
      type: 'GENERAL' as ContactType,
      name: 'Visiteur Curieux',
      email: 'visiteur@test.com',
      subject: 'Question sur les horaires',
      message: 'Bonjour, à quelle heure ouvre le salon ?',
      isRead: false,
    },
    {
      type: 'EXHIBITOR' as ContactType,
      name: 'Futur Exposant',
      email: 'exposant@test.com',
      phone: '+33 6 99 88 77 66',
      company: 'New CBD Company',
      subject: 'Demande d\'information stand',
      message: 'Nous souhaitons exposer au salon 2026. Quelles sont les modalités ?',
      isRead: true,
    },
    {
      type: 'PRESS' as ContactType,
      name: 'Journaliste Test',
      email: 'presse@test.com',
      company: 'CBD Magazine',
      subject: 'Demande accréditation presse',
      message: 'Je souhaite couvrir l\'événement pour notre magazine.',
      isRead: false,
    },
    {
      type: 'SPONSOR' as ContactType,
      name: 'Sponsor Potentiel',
      email: 'sponsor@test.com',
      company: 'Big CBD Corp',
      subject: 'Partenariat',
      message: 'Nous sommes intéressés par un partenariat Platine.',
      isRead: false,
    },
  ]

  for (const contact of contacts) {
    await prisma.contactRequest.create({
      data: contact,
    })
  }
  console.log(`   ✓ ${contacts.length} contact requests created`)

  // ============================================================================
  // 11. SPONSOR REQUESTS
  // ============================================================================
  console.log('📋 Creating sponsor requests...')

  const sponsorRequests = [
    {
      companyName: 'CBD Startup',
      contactName: 'Marc Startup',
      email: 'marc@startup.test',
      phone: '+33 6 12 12 12 12',
      status: 'PENDING' as const,
    },
    {
      companyName: 'Hemp Industries',
      contactName: 'Hélène Industry',
      email: 'helene@hemp.test',
      status: 'SENT' as const,
      sentAt: new Date('2026-01-10'),
    },
  ]

  for (const req of sponsorRequests) {
    await prisma.sponsorRequest.create({
      data: req,
    })
  }
  console.log(`   ✓ ${sponsorRequests.length} sponsor requests created`)

  // ============================================================================
  // 12. DAILY STATS (Analytics)
  // ============================================================================
  console.log('📊 Creating analytics data...')

  const today = new Date()
  const stats = []
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    stats.push({
      date,
      totalViews: Math.floor(Math.random() * 500) + 100,
      uniqueVisitors: Math.floor(Math.random() * 200) + 50,
      topPages: JSON.stringify([
        { path: '/', views: Math.floor(Math.random() * 100) + 50 },
        { path: '/programme', views: Math.floor(Math.random() * 50) + 20 },
        { path: '/exposants', views: Math.floor(Math.random() * 40) + 15 },
      ]),
    })
  }

  for (const stat of stats) {
    await prisma.dailyStats.upsert({
      where: { date: stat.date },
      update: stat,
      create: stat,
    })
  }
  console.log(`   ✓ ${stats.length} days of analytics created`)

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(60))
  console.log('🎉 DEVELOPMENT SEED COMPLETED!')
  console.log('='.repeat(60))
  console.log('\n📝 Test accounts created:')
  console.log('   ┌─────────────────────────────────────┬────────────────┬──────────────┐')
  console.log('   │ Email                               │ Password       │ Role         │')
  console.log('   ├─────────────────────────────────────┼────────────────┼──────────────┤')
  console.log('   │ admin@dev.cannagri-expo.fr          │ DevAdmin2026!  │ SUPER_ADMIN  │')
  console.log('   │ moderator@dev.cannagri-expo.fr      │ DevTest123!    │ ADMIN        │')
  console.log('   │ contributor@dev.cannagri-expo.fr    │ DevTest123!    │ CONTRIBUTOR  │')
  console.log('   │ pro@dev.cannagri-expo.fr            │ DevTest123!    │ PRO          │')
  console.log('   │ user@dev.cannagri-expo.fr           │ DevTest123!    │ USER         │')
  console.log('   └─────────────────────────────────────┴────────────────┴──────────────┘')
  console.log('\n📊 Data summary:')
  console.log(`   • ${users.length} users`)
  console.log(`   • ${standsData.length} stands (FREE: ${standsData.filter(s => s.status === 'FREE').length}, RESERVED: ${standsData.filter(s => s.status === 'RESERVED').length}, SOLD: ${standsData.filter(s => s.status === 'SOLD').length})`)
  console.log(`   • ${sponsors.length} sponsors (PLATINE: 1, OR: 2, ARGENT: 2, BRONZE: 2)`)
  console.log(`   • ${events.length} events`)
  console.log(`   • ${orders.length} orders`)
  console.log(`   • ${tickets.length} tickets`)
  console.log(`   • ${media.length} media entries`)
  console.log(`   • ${subscribers.length} newsletter subscribers`)
  console.log(`   • ${contacts.length} contact requests`)
  console.log(`   • 31 days of analytics\n`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
