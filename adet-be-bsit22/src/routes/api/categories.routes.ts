import { Hono } from 'hono';
import { AuthVariables } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';

const router = new Hono<{ Variables: AuthVariables }>();

// ── GET /api/v1/categories ────────────────────────────────────────────────────
router.get('/', async (c) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return c.json(categories);
  } catch (error) {
    return c.json({ message: 'Failed to fetch categories' }, 500);
  }
});

export default router;
