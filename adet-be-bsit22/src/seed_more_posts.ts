import prisma from './lib/prisma';
import { PostStatus } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@liceo.edu.ph';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    console.error('Admin user not found. Please run npm run db:seed first.');
    return;
  }

  const categories = await prisma.category.findMany();
  const getCatId = (name: string) => categories.find(c => c.name === name)?.id || categories[0].id;

  const morePosts = [
    { title: 'Nursing Duty Bundle', desc: 'Complete set including thermometer, BP app, and white watch for duty.', cat: 'Laboratory & Scientific Tools' },
    { title: 'Drafting Kit for Freshmen', desc: 'T-square, triangles, and compass set. used but in good condition.', cat: 'Technical & Artistic Equipment' },
    { title: 'Psychology Reviewer (Board Exam)', desc: 'Comprehensive notes and reviewers for the Psych Board exams.', cat: 'Scholarly Manuscripts' },
    { title: 'Graphing Paper and Scientific Calculator', desc: 'Bundle for Math analysis class. Casio FX-991ES Plus included.', cat: 'Technical & Artistic Equipment' },
    { title: 'Organic Chemistry Model Kit', desc: 'Molecular model set for visualizing organic structures.', cat: 'Laboratory & Scientific Tools' },
    { title: 'Large Format Sketchbook', desc: 'Unused A3 sketchbook for Architecture or Fine Arts.', cat: 'Technical & Artistic Equipment' },
    { title: 'External Hard Drive (1TB)', desc: 'Needed for storing heavy architecture renderings and CAD files.', cat: 'Computing & Digital Assets' },
    { title: 'Liceo Varsity Jersey', desc: 'Official varsity jersey, size medium. Excellent condition.', cat: 'Physical Education Kits' },
    { title: 'Institutional Research Journal', desc: 'Previous volumes of the Liceo Higher Education journal for citation.', cat: 'Scholarly Manuscripts' },
    { title: 'Macroeconomics 101 Module', desc: 'Printed module for the current semester with highlighted key points.', cat: 'Academic Textbooks' },
    { title: 'Wireless Presentation Clicker', desc: 'Remote for PowerPoint presentations. Works with any laptop.', cat: 'Computing & Digital Assets' },
    { title: 'Ergonomic Study Chair', desc: 'Looking for a comfortable chair for long study sessions.', cat: 'Miscellaneous Resources' }
  ];

  console.log('--- Seeding 12 More Academic Records for Admin ---');

  for (const p of morePosts) {
    await prisma.post.create({
      data: {
        userId: admin.id,
        categoryId: getCatId(p.cat),
        title: p.title,
        description: p.desc,
        status: PostStatus.open,
        imageUrl: `/api/uploads/cat${Math.floor(Math.random() * 12) + 1}.png`
      }
    });
  }

  console.log('--- Successfully added 12 more scholarly records. ---');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
