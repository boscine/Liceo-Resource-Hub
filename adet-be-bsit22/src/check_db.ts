
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      status: true
    }
  });
  console.log('Users:', JSON.stringify(users, null, 2));

  const categories = await prisma.category.findMany();
  console.log('Categories:', JSON.stringify(categories, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
