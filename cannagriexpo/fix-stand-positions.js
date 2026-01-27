const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Stand positions based on the layout image
// Grid: 10 columns x 13 rows
const standPositions = [
  // Top row (row 1) - Stands 4-9
  { code: '4', row: 1, col: 3 },
  { code: '5', row: 1, col: 4 },
  { code: '6', row: 1, col: 5 },
  { code: '7', row: 1, col: 6 },
  { code: '8', row: 1, col: 7 },
  { code: '9', row: 1, col: 8 },

  // Left side near Conferences (col 2) - Stands 3, 2, 1
  { code: '3', row: 2, col: 2 },
  { code: '2', row: 3, col: 2 },
  { code: '1', row: 4, col: 2 },

  // Right side (col 10) - Stands 10-19
  { code: '10', row: 2, col: 10 },
  { code: '11', row: 3, col: 10 },
  { code: '12', row: 4, col: 10 },
  { code: '13', row: 5, col: 10 },
  { code: '14', row: 6, col: 10 },
  { code: '15', row: 7, col: 10 },
  { code: '16', row: 8, col: 10 },
  { code: '17', row: 9, col: 10 },
  { code: '18', row: 10, col: 10 },
  { code: '19', row: 11, col: 10 },

  // Bottom row (row 13) - Stands 25-20 (left to right)
  { code: '25', row: 13, col: 3 },
  { code: '24', row: 13, col: 4 },
  { code: '23', row: 13, col: 5 },
  { code: '22', row: 13, col: 6 },
  { code: '21', row: 13, col: 7 },
  { code: '20', row: 13, col: 8 },
];

async function main() {
  console.log('Updating stand positions...\n');

  for (const pos of standPositions) {
    try {
      const result = await prisma.stand.updateMany({
        where: { code: pos.code },
        data: { row: pos.row, col: pos.col }
      });

      if (result.count > 0) {
        console.log(`Stand ${pos.code}: row=${pos.row}, col=${pos.col} ✓`);
      } else {
        console.log(`Stand ${pos.code}: not found in database`);
      }
    } catch (error) {
      console.error(`Error updating Stand ${pos.code}:`, error.message);
    }
  }

  console.log('\nDone! Verifying positions...\n');

  const stands = await prisma.stand.findMany({
    select: { code: true, row: true, col: true, status: true },
    orderBy: [{ row: 'asc' }, { col: 'asc' }]
  });

  stands.forEach(s => {
    console.log(`Stand ${s.code}: row=${s.row}, col=${s.col}, status=${s.status}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
