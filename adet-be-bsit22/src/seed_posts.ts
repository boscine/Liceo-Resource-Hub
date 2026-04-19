import prisma from './lib/prisma';
import { Role, user_status, PostStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const studentEmail = 'student@liceo.edu.ph';
  const studentPassword = 'qasxq2ew';
  const adminEmail = 'admin@liceo.edu.ph';
  const adminPassword = 'adminpassword123';

  console.log('--- Ensuring Users Exist ---');

  // Check Student
  let student = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!student) {
    const hashedPassword = await bcrypt.hash(studentPassword, 10);
    student = await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash: hashedPassword,
        displayName: 'Sample Student',
        role: Role.student,
        status: user_status.active
      }
    });
    console.log(`Created student user: ${studentEmail}`);
  } else {
    // Ensure active
    await prisma.user.update({
      where: { id: student.id },
      data: { status: user_status.active }
    });
    console.log(`Student user already exists: ${studentEmail}`);
  }

  // Check Admin
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        displayName: 'System Admin',
        role: Role.admin,
        status: user_status.active
      }
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    // Ensure role and active
    await prisma.user.update({
      where: { id: admin.id },
      data: { status: user_status.active, role: Role.admin }
    });
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.error('No categories found! Please run setup_db.sql first.');
    return;
  }

  console.log('--- Creating Posts ---');

  const postTemplates = [
    { title: 'Looking for Advanced Calculus Textbook', desc: 'Need a copy of Larson Calculus 11th Edition for MTH101.', cat: 'Textbooks & Modules', img: '/api/uploads/cat1.png' },
    { title: 'Seeking CS202 Lecture Notes', desc: 'Missed some lectures in Data Structures. Looking for comprehensive notes.', cat: 'Study Notes & Reviewers', img: '/api/uploads/cat2.png' },
    { title: 'Chemistry Lab Equipment Needed', desc: 'Require a set of test tubes and a Bunsen burner for a home experiment.', cat: 'Laboratory & Science Tools', img: '/api/uploads/cat3.png' },
    { title: 'Adobe Creative Cloud License', desc: 'Looking for a spare institutional license for graphic design work.', cat: 'Laptops & Gadgets', img: '/api/uploads/cat4.png' },
    { title: 'Graphic Calculator for Engineering', desc: 'Need a TI-84 or equivalent for my Engineering Mathematics class.', cat: 'Calculators & Math Tools', img: '/api/uploads/cat5.png' },
    { title: 'Precision Screwdriver Set', desc: 'Looking for technical tools for my Electronics workshop.', cat: 'Engineering & Tech Tools', img: '/api/uploads/cat6.png' },
    { title: 'Oil Paint Palette and Brushes', desc: 'Seeking high-quality brushes for the upcoming Fine Arts exhibition.', cat: 'Art & Creative Supplies', img: '/api/uploads/cat7.png' },
    { title: 'Stethoscope for Nursing Duty', desc: 'Need a reliable stethoscope for my clinical rotation at the hospital.', cat: 'Medical & Nursing Kits', img: '/api/uploads/cat8.png' },
    { title: 'Official PE Uniform (Large)', desc: 'Looking for a clean, used PE uniform for the midterms.', cat: 'PE & Sports Equipment', img: '/api/uploads/cat9.png' },
    { title: 'Portable Projector for Presentation', desc: 'Need a projector for a group reporting session in the auditorium.', cat: 'Campus & General Equipment', img: '/api/uploads/cat10.png' },
    { title: 'Historical Research Manuscripts', desc: 'Searching for local history archives for my senior thesis.', cat: 'Research & Manuscripts', img: '/api/uploads/cat11.png' },
    { title: 'Magnifying Glass and Study Lamp', desc: 'General study aids needed for late-night research sessions.', cat: 'Other Resources', img: '/api/uploads/cat12.png' }
  ];

  // Helper function to find category ID by name
  const getCatId = (name: string) => categories.find(c => c.name === name)?.id || categories[0].id;

  // Create 12 posts for student
  for (const template of postTemplates) {
    await prisma.post.create({
      data: {
        userId: student.id,
        categoryId: getCatId(template.cat),
        title: `[STUDENT] ${template.title}`,
        description: template.desc,
        imageUrl: template.img,
        status: PostStatus.open
      }
    });
  }
  console.log(`Created 12 posts for student: ${studentEmail}`);

  // Create 12 posts for admin
  for (const template of postTemplates) {
    await prisma.post.create({
      data: {
        userId: admin.id,
        categoryId: getCatId(template.cat),
        title: `[ADMIN] ${template.title}`,
        description: template.desc,
        imageUrl: template.img,
        status: PostStatus.open
      }
    });
  }
  console.log(`Created 12 posts for admin: ${adminEmail}`);

  console.log('--- Seed Finished Successfuly ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
