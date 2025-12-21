const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = 'DevTest123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  console.log('New hash generated');

  // Update user password
  const user = await prisma.user.update({
    where: { email: 'user@dev.cannagri-expo.fr' },
    data: { hashedPassword }
  });

  console.log('Updated password for:', user.email);

  // Verify it works
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Verification:', isValid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
