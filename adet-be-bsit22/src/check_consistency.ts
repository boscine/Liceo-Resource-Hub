import prisma from './lib/prisma';

async function main() {
  console.log('--- Checking DB Consistency ---');
  
  try {
    const posts = await prisma.post.findMany({
      include: {
        category: true,
        user: true
      }
    });
    
    console.log(`Found ${posts.length} posts.`);
    
    const missingCat = posts.filter(p => !p.category);
    const missingUser = posts.filter(p => !p.user);
    
    if (missingCat.length > 0) console.error('Posts with missing category:', missingCat.map(p => p.id));
    if (missingUser.length > 0) console.error('Posts with missing user:', missingUser.map(p => p.id));
    
    const reports = await prisma.postReport.findMany({
      include: {
        post: true,
        reporter: true
      }
    });
    
    console.log(`Found ${reports.length} reports.`);
    
    const missingPostReport = reports.filter(r => !r.post);
    const missingReporter = reports.filter(r => !r.reporter);
    
    if (missingPostReport.length > 0) console.error('Reports with missing post:', missingPostReport.map(r => r.id));
    if (missingReporter.length > 0) console.error('Reports with missing reporter:', missingReporter.map(r => r.id));

  } catch (err) {
    console.error('Prisma Error:', err);
  }

  console.log('--- DB Check Finished ---');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
