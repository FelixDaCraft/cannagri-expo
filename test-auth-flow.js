const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'user@dev.cannagri-expo.fr';
  const password = 'DevTest123!';

  console.log('=== Testing Authentication Flow ===\n');

  // Step 1: Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      hashedPassword: true,
      role: true,
      isApproved: true,
      emailVerified: true
    }
  });

  if (!user) {
    console.log('ERROR: User not found:', email);
    return;
  }

  console.log('User found:');
  console.log('  - ID:', user.id);
  console.log('  - Email:', user.email);
  console.log('  - Name:', user.name);
  console.log('  - Role:', user.role);
  console.log('  - isApproved:', user.isApproved);
  console.log('  - emailVerified:', user.emailVerified);
  console.log('  - hashedPassword exists:', !!user.hashedPassword);
  console.log('  - hashedPassword length:', user.hashedPassword?.length);
  console.log();

  if (!user.hashedPassword) {
    console.log('ERROR: User has no password hash!');
    return;
  }

  // Step 2: Test bcrypt comparison
  console.log('Testing password comparison...');
  console.log('  - Password to test:', password);
  console.log('  - Hash (first 20 chars):', user.hashedPassword.substring(0, 20) + '...');

  try {
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    console.log('  - bcrypt.compare result:', isValid);

    if (!isValid) {
      console.log('\nERROR: Password does not match!');

      // Generate a new hash to compare
      const newHash = await bcrypt.hash(password, 12);
      console.log('\nGenerated new hash for same password:');
      console.log('  - New hash (first 20 chars):', newHash.substring(0, 20) + '...');
      console.log('  - Verifying new hash:', await bcrypt.compare(password, newHash));
    } else {
      console.log('\nSUCCESS: Password matches!');
      console.log('\nIf login still fails in browser, check:');
      console.log('1. Browser dev tools Network tab for error responses');
      console.log('2. Clear browser cookies and try again');
      console.log('3. Check NEXTAUTH_URL matches the URL you are accessing');
    }
  } catch (err) {
    console.log('ERROR during bcrypt.compare:', err.message);
  }

  // Check all test users
  console.log('\n=== All Test Users ===\n');
  const allUsers = await prisma.user.findMany({
    where: {
      email: { contains: 'dev.cannagri-expo.fr' }
    },
    select: {
      email: true,
      role: true,
      hashedPassword: true
    }
  });

  for (const u of allUsers) {
    const hasPassword = !!u.hashedPassword;
    let passwordWorks = false;
    if (hasPassword) {
      passwordWorks = await bcrypt.compare('DevTest123!', u.hashedPassword);
    }
    console.log(`${u.email} (${u.role}): hasPassword=${hasPassword}, passwordWorks=${passwordWorks}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
