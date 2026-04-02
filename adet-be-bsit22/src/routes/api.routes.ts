import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { AuthVariables } from '../middleware/auth.middleware';

// Specify the Variables type so c.get('userId') works
const router = new Hono<{ Variables: AuthVariables }>();
const prisma = new PrismaClient();

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

export default router;