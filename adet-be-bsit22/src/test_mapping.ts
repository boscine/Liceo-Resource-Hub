import prisma from './lib/prisma';
async function test() {
  const userId = 1; // Assuming admin or student is ID 1
  const statusCounts = await prisma.post.groupBy({
    by: ['status'],
    where: { userId: Number(userId) },
    _count: true
  });
  console.log(JSON.stringify(statusCounts, null, 2));
}
test().finally(() => prisma.$disconnect());
