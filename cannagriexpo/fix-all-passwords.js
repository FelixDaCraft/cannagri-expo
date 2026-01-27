const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = 'DevTest123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  console.log('Updating all dev user passwords to: DevTest123!\n');

  // Update all dev users
  const result = await prisma.user.updateMany({
    where: {
      email: { contains: 'dev.cannagri-expo.fr' }
    },
    data: { hashedPassword }
  });

  console.log(`Updated ${result.count} users`);

  // Verify
  const users = await prisma.user.findMany({
    where: {
      email: { contains: 'dev.cannagri-expo.fr' }
    },
    select: { email: true, role: true }
  });

  console.log('\nTest users with password DevTest123!:');
  for (const u of users) {
    console.log(`  - ${u.email} (${u.role})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
