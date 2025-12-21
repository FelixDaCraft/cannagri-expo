const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true, hashedPassword: true }
  });
  console.log('Users in database:');
  users.forEach(u => {
    console.log(u.email, '|', u.role, '| has_pwd:', u.hashedPassword ? 'YES' : 'NO');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
