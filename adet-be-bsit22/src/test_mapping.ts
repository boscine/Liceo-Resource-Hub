import prisma from './lib/prisma';
import { getTimeAgo } from './lib/utils';

async function testAdminPosts() {
  console.log('--- Testing Admin Posts Mapping ---');
  try {
    const posts = await prisma.post.findMany({
      include: {
        category: { select: { name: true } },
        user: { select: { id: true, displayName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status.toUpperCase(),
      category: p.category.name,
      author: p.user.displayName,
      authorId: p.user.id,
      timeAgo: getTimeAgo(p.createdAt),
      createdAt: p.createdAt,
      isFlagged: p.isFlagged
    }));
    console.log(`Successfully mapped ${formattedPosts.length} posts.`);
  } catch (err: any) {
    console.error('Admin Posts Mapping failed!', err.message);
  }

  console.log('--- Testing Admin Reports Mapping ---');
  try {
    const reports = await prisma.postReport.findMany({
      include: {
        post: { select: { title: true } },
        reporter: { select: { displayName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const formatted = reports.map(r => ({
      id: r.id,
      postId: r.postId,
      postTitle: r.post.title,
      reportedBy: r.reporter.displayName,
      reason: r.reason.toUpperCase().replace('_', ' '),
      details: r.details,
      status: r.status,
      timeAgo: getTimeAgo(r.createdAt)
    }));
    console.log(`Successfully mapped ${formatted.length} reports.`);
  } catch (err: any) {
    console.error('Admin Reports Mapping failed!', err.message);
  }
}

testAdminPosts().finally(() => prisma.$disconnect());
