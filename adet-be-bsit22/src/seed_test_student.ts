import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'test-student@liceo.edu.ph';
  const passwordHash = bcrypt.hashSync('TestStudent@123', 10);
  
  // 1. Create or Update Test Student
  const user = await prisma.user.upsert({
    where: { email },
    update: { status: 'active' },
    create: {
      email,
      passwordHash,
      displayName: 'Test Student Scholar',
      role: 'student',
      status: 'active',
      contacts: {
        create: [
          { type: 'phone', value: '09123456789' },
          { type: 'messenger', value: 'test.student.liceo' }
        ]
      }
    }
  });

  console.log(`User ${email} is ready (ID: ${user.id}).`);

  // 2. Generate 12 Posts
  const categories = await prisma.category.findMany();
  const images = [
    'cat1.png', 'cat2.png', 'cat3.png', 'cat4.png', 'cat5.png', 'cat6.png',
    'cat7.png', 'cat8.png', 'cat9.png', 'cat10.png', 'cat11.png', 'cat12.png'
  ];

  for (let i = 0; i < 12; i++) {
    const catIdx = i % categories.length;
    const imgIdx = i % images.length;
    
    await prisma.post.create({
      data: {
        userId: user.id,
        categoryId: categories[catIdx].id,
        title: `Scholarly Resource #${i + 1}: ${categories[catIdx].name} Item`,
        description: `This is a high-quality academic resource provided for the Liceo community. Item #${i + 1} from the ${categories[catIdx].name} collection.`,
        imageUrl: `/api/uploads/${images[imgIdx]}`,
        status: 'open'
      }
    });
  }

  console.log('Successfully generated 12 test posts for the student account.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
