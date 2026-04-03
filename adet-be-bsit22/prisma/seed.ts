import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {

  // ── Categories (hardcoded) ─────────────────────────────────────────────────
  const categories = [
    'Textbook',
    'Notes',
    'Drafting Tools',
    'Laboratory Equipment',
    'Art Supplies',
    'Calculator',
    'USB / Storage',
    'Other',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Categories seeded');

  // ── Admin account ──────────────────────────────────────────────────────────
  // Change email and password before deploying
  const adminEmail = 'admin@liceo.edu.ph';
  const adminPassword = 'Admin@1234';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      displayName: 'System Admin',
      role: 'admin',
      status: 'active',
    },
  });
  console.log('✅ Admin account seeded');
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('   ⚠️  Change this password after first login!');

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
