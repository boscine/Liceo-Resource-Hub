import 'dotenv/config';
import prisma from './src/lib/prisma';

async function main() {
  const categories = [
    'Textbooks',
    'Notes',
    'Drafting Tools',
    'Laboratory Equipment',
    'Art Supplies',
    'Calculator',
    'USB / Storage',
    'Other'
  ];

  console.log('Seeding categories...');
  
  for (const name of categories) {
    // upsert ensures we don't create duplicates if run multiple times
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  console.log('✅ Categories seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
