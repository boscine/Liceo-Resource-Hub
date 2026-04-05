import { Hono } from 'hono';
import { AuthVariables } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { updateProfile } from '../controllers/profile.controller';

// Specify the Variables type so c.get('userId') works
const router = new Hono<{ Variables: AuthVariables }>();

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ── GET /api/v1/posts ─────────────────────────────────────────────────────────
router.get('/posts', async (c) => {
  console.log('[GET /posts] Route matched!');
  try {
    const posts = await prisma.post.findMany({
      include: {
        category: { select: { name: true } },
        user: { select: { displayName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform to match the UI expectations
    const formattedPosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status.toUpperCase(),
      category: p.category.name.toUpperCase(),
      author: p.user.displayName,
      timeAgo: getTimeAgo(p.createdAt),
      resolved: p.status === 'fulfilled' || p.status === 'closed',
      createdAt: p.createdAt
    }));

    return c.json(formattedPosts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── GET /api/v1/posts/:id ─────────────────────────────────────────────────────
router.get('/posts/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        user: { select: { displayName: true } }
      }
    });

    if (!post) return c.json({ message: 'Post not found' }, 404);

    const formattedPost = {
      id: post.id,
      title: post.title,
      description: post.description,
      status: post.status.toUpperCase(),
      category: post.category.name.toUpperCase(),
      author: post.user.displayName,
      timeAgo: getTimeAgo(post.createdAt),
      resolved: post.status === 'fulfilled' || post.status === 'closed',
      createdAt: post.createdAt,
      college: 'College of Arts & Sciences', // Placeholder as it's not in the schema yet
      contact: { type: 'Messenger', value: 'contact' } // Placeholder
    };

    return c.json(formattedPost);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── GET /api/v1/categories ────────────────────────────────────────────────────
// Note: Path is just '/' or '/categories' because prefix is handled in index.ts
router.get('/categories', async (c) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return c.json(categories);
  } catch (error) {
    return c.json({ message: 'Failed to fetch categories' }, 500);
  }
});
// ── GET /api/v1/profile (Example of using the protected userId) ──────────────
router.get('/profile', async (c) => {
  const userId = c.get('userId');
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true, role: true, status: true }
    });
    return c.json(user);
  } catch (error) {
    return c.json({ message: 'User not found' }, 404);
  }
});

router.put('/profile', updateProfile);

// ── POST /api/v1/posts ────────────────────────────────────────────────────────
router.post('/posts', async (c) => {
  const userIdFromContext = c.get('userId');
  console.log(`[POST /posts] Request received. userId from context:`, userIdFromContext);
  const userId = userIdFromContext; // Always set if route is guarded
  
  if (!userId) {
     console.error(`[POST /posts] Failed! Extracted userId from context is falsy:`, userId);
     return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const { title, categoryId, description } = await c.req.json();

    if (!title || !categoryId || !description) {
       return c.json({ message: 'Missing required fields' }, 400);
    }

    const post = await prisma.post.create({
      data: {
        userId,
        categoryId: parseInt(categoryId, 10),
        title,
        description,
        status: 'open'
      }
    });

    return c.json(post, 201);
  } catch (error) {
    console.error('Failed to create post:', error);
    return c.json({ message: 'Internal server error while creating post' }, 500);
  }
});

// ── PUT /api/v1/posts/:id ─────────────────────────────────────────────────────
router.put('/posts/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId');

  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const { title, categoryId, description, status } = await c.req.json();

    // Check ownership
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return c.json({ message: 'Post not found' }, 404);
    if (post.userId !== userId) return c.json({ message: 'Forbidden' }, 403);

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title ?? post.title,
        categoryId: categoryId ? parseInt(categoryId, 10) : post.categoryId,
        description: description ?? post.description,
        status: status ?? post.status
      }
    });

    return c.json(updatedPost);
  } catch (error) {
    console.error('Failed to update post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── DELETE /api/v1/posts/:id ──────────────────────────────────────────────────
router.delete('/posts/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId');

  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    // Check ownership
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return c.json({ message: 'Post not found' }, 404);
    if (post.userId !== userId) return c.json({ message: 'Forbidden' }, 403);

    await prisma.post.delete({ where: { id } });
    return c.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

export default router;