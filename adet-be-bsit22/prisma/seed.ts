import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

console.log('🚀 Starting institution seed process...');

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in environment. Ensure .env is loaded.');
  process.exit(1);
}

const url = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
});

const prisma = new PrismaClient({ adapter });

async function main() {

  // ── Categories (hardcoded) ─────────────────────────────────────────────────
  const categories = [
    'Academic Textbooks',
    'Lecture Chronicles',
    'Laboratory & Scientific Tools',
    'Computing & Digital Assets',
    'Technical & Artistic Equipment',
    'Scholarly Manuscripts',
    'Physical Education Kits',
    'Miscellaneous Resources',
  ];

  // 1. Ensure all universal categories exist
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Identify legacy categories for removal
  const miscCategory = await prisma.category.findUnique({ where: { name: 'Miscellaneous Resources' } });
  const allExisting = await prisma.category.findMany();
  const legacyCategories = allExisting.filter(c => !categories.includes(c.name));

  if (legacyCategories.length > 0 && miscCategory) {
    const legacyIds = legacyCategories.map(c => c.id);
    console.log(`🧹 Found ${legacyCategories.length} legacy categories. Moving posts to Miscellaneous...`);
    
    // Batch migrate posts
    await prisma.post.updateMany({
      where: { categoryId: { in: legacyIds } },
      data: { categoryId: miscCategory.id }
    });
    
    // Batch delete categories
    await prisma.category.deleteMany({
      where: { id: { in: legacyIds } }
    });

    console.log('✅ Legacy cleanup complete.');
  }

  console.log('✅ Universal Categories synchronized and legacy records purged.');

  // ── Admin account ──────────────────────────────────────────────────────────
  // Secure Seeding: Prefer environment variables to avoid hardcoded credentials in source control
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@liceo.edu.ph';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn('⚠️ WARNING: Using default hardcoded admin password. Set SEED_ADMIN_PASSWORD in .env for better security.');
  }

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
