import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'jlmandahinog65115@liceo.edu.ph' },
    select: { id: true, email: true, status: true, role: true }
  });
  console.log(JSON.stringify(user, null, 2));
}
main().finally(() => prisma.$disconnect());
