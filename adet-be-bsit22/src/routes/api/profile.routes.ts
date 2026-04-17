import { Hono } from 'hono';
import { AuthVariables } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { updateProfile, getProfile } from '../../controllers/profile.controller';
import { zValidator } from '@hono/zod-validator';
import { profileSchema } from '../../lib/validation';
import { getTimeAgo } from '../../lib/utils';

const router = new Hono<{ Variables: AuthVariables }>();

// ── GET /api/v1/profile ───────────────────────────────────────────────────────
router.get('/', getProfile);

router.put('/', zValidator('json', profileSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }
}), updateProfile);

// ── GET /api/v1/profile/:id (Public Profile View) ───────────────────────────
router.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        contacts: { select: { type: true, value: true } },
        posts: {
          where: { 
            AND: [
              { status: 'open' },
              { isFlagged: false }
            ]
          },
          include: { category: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return c.json({ message: 'User not found' }, 404);

    // Hide profiles of restricted users
    if (user.status !== 'active' && user.id !== c.get('userId') && c.get('role') !== 'admin') {
       return c.json({ message: 'This account is restricted.' }, 403);
    }

    // Redact contact info for guests
    if (!c.get('userId')) {
      user.contacts = [];
      user.email = ''; // Redact institutional email for unauthenticated visitors
    }

    const formattedPosts = user.posts.map(p => ({
      id: p.id,
      title: p.title,
      status: p.status.toUpperCase(),
      category: p.category.name,
      timeAgo: getTimeAgo(p.createdAt),
      createdAt: p.createdAt
    }));

    return c.json({
      ...user,
      posts: formattedPosts,
      joinedDate: user.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  } catch (error) {
    console.error('Failed to fetch public profile:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

export default router;
