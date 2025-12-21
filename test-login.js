const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'user@dev.cannagri-expo.fr';
  const password = 'DevTest123!';

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, hashedPassword: true }
  });

  if (!user) {
    console.log('User not found:', email);
    return;
  }

  console.log('User found:', user.email);
  console.log('Hash exists:', !!user.hashedPassword);

  if (user.hashedPassword) {
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    console.log('Password "DevTest123!" valid:', isValid);

    // Test other passwords
    const isValid2 = await bcrypt.compare('demo123', user.hashedPassword);
    console.log('Password "demo123" valid:', isValid2);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
