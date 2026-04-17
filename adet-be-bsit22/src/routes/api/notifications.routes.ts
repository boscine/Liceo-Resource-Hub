import { Hono } from 'hono';
import { AuthVariables } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { getTimeAgo } from '../../lib/utils';

const router = new Hono<{ Variables: AuthVariables }>();

// ── GET /api/v1/notifications ────────────────────────────────────────────────
router.get('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  const limitParam = c.req.query('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: isNaN(limit) ? 20 : limit
    });
    
    const formatted = notifications.map(n => ({
      id: n.id,
      icon: n.icon,
      text: n.text,
      time: getTimeAgo(n.createdAt),
      read: n.read
    }));

    return c.json(formatted);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── PUT /api/v1/notifications/mark-all-read ─────────────────────────────────
router.put('/mark-all-read', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return c.json({ success: true });
  } catch (error) {
    return c.json({ message: 'Failed to update notifications' }, 500);
  }
});

// ── PUT /api/v1/notifications/:id/read ──────────────────────────────────────
router.put('/:id/read', async (c) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id) || !userId) return c.json({ message: 'Invalid request' }, 400);

  try {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });
    return c.json({ success: true });
  } catch (error) {
    return c.json({ message: 'Failed to update notification' }, 500);
  }
});

// ── DELETE /api/v1/notifications/clear-all ──────────────────────────────────
router.delete('/clear-all', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  try {
    await prisma.notification.deleteMany({
      where: { userId }
    });
    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    return c.json({ message: 'Failed to clear notifications' }, 500);
  }
});

// ── DELETE /api/v1/notifications/:id ────────────────────────────────────────
router.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id) || !userId) return c.json({ message: 'Invalid request' }, 400);

  try {
    await prisma.notification.deleteMany({
      where: { id, userId }
    });
    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return c.json({ message: 'Failed to delete notification' }, 500);
  }
});

export default router;
