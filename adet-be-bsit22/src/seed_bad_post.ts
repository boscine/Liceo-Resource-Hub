import prisma from './lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const student = await prisma.user.findFirst();
  
  if (!student) {
    console.error("Student user not found.");
    return;
  }

  const category = await prisma.category.findFirst();

  // 1. Simulate a student attempting to post inappropriate content
  const post = await prisma.post.create({
    data: {
      userId: student.id,
      categoryId: category?.id || 1,
      title: "Looking for a date this weekend",
      description: "Not really studying, just looking for someone to hang out with and go to the movies. Message me if interested!",
      status: 'closed', // Auto-closed by AI
      isFlagged: true,  // Flagged for admin review
    }
  });

  // 2. The AI instantly catches it and files an Urgent Report
  await prisma.postReport.create({
    data: {
      postId: post.id,
      reporterId: student.id, // System/Self reported
      reason: 'inappropriate',
      details: 'AI AUTO-MODERATION: The request is not related to academic life or student needs (dating request). Violates Hub standards.',
      status: 'pending'
    }
  });

  console.log("✅ Sample AI Intervention Created!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
