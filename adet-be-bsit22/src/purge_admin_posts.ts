import prisma from './lib/prisma';

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@liceo.edu.ph';
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    console.log(`Admin user with email ${adminEmail} not found.`);
    return;
  }

  const result = await prisma.post.deleteMany({
    where: { userId: admin.id }
  });

  console.log(`Purged ${result.count} posts made by admin (${adminEmail}, ID: ${admin.id}).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
