import prisma from './lib/prisma';

async function main() {
  console.log('--- Updating Category Names ---');
  
  const update = await prisma.category.updateMany({
    where: { name: 'Miscellaneous Resources' },
    data: { name: 'Other Resources' }
  });

  console.log(`Updated ${update.count} categories.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
