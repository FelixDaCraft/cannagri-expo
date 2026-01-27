// Script to fix stands in production database
// Run with: node fix-stands-prod.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Grid positions from AdminInteractiveStandPlan - these are the authoritative positions
const standPositions = {
  1: { col: 2, row: 4 },
  2: { col: 2, row: 3 },
  3: { col: 2, row: 2 },
  4: { col: 3, row: 1 },
  5: { col: 4, row: 1 },
  6: { col: 5, row: 1 },
  7: { col: 6, row: 1 },
  8: { col: 7, row: 1 },
  9: { col: 8, row: 1 },
  10: { col: 10, row: 2 },
  11: { col: 10, row: 3 },
  12: { col: 10, row: 4 },
  13: { col: 10, row: 5 },
  14: { col: 10, row: 6 },
  15: { col: 10, row: 7 },
  16: { col: 10, row: 8 },
  17: { col: 10, row: 9 },
  18: { col: 10, row: 10 },
  19: { col: 10, row: 11 },
  20: { col: 8, row: 13 },
  21: { col: 7, row: 13 },
  22: { col: 6, row: 13 },
  23: { col: 5, row: 13 },
  24: { col: 4, row: 13 },
  25: { col: 3, row: 13 },
}

async function fixStands() {
  console.log('Starting stand fixes...\n')

  const stands = await prisma.stand.findMany()
  console.log(`Found ${stands.length} stands\n`)

  for (const stand of stands) {
    const standNum = stand.number
    const position = standPositions[standNum]

    if (!position) {
      console.log(`⚠️  No position found for stand ${standNum}, skipping`)
      continue
    }

    const updates = {
      priceHT: 150,
      surfaceM2: 4,
      size: 'SMALL',
      col: position.col,
      row: position.row,
      hasFurniture: true,
      hasElectricity: true,
      furniturePrice: 0,
      electricityPrice: 0,
    }

    await prisma.stand.update({
      where: { id: stand.id },
      data: updates
    })

    console.log(`✅ Stand ${standNum}: price=150€, surface=4m², position=(${position.col}, ${position.row})`)
  }

  console.log('\n✅ All stands updated successfully!')
}

fixStands()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
