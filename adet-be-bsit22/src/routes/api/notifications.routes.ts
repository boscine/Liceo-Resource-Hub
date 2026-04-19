import { Hono } from 'hono';
import { AuthVariables } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { getTimeAgo } from '../../lib/utils';
import { purgeExpiredNotifications } from '../../lib/cleanup';

const router = new Hono<{ Variables: AuthVariables }>();

// ── GET /api/v1/notifications ────────────────────────────────────────────────
router.get('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  const limitParam = c.req.query('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 100;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: isNaN(limit) ? 100 : limit
    });
    
    const formatted = notifications.map(n => ({
      id: n.id,
      icon: n.icon,
      text: n.text,
      time: getTimeAgo(n.createdAt),
      read: n.read,
      isSaved: n.isSaved,
      type: n.type
    }));

    return c.json(formatted);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── PATCH /api/v1/notifications/:id/save (Toggle Scholarly Bookmark) ───────
router.patch('/:id/save', async (c) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id) || !userId) return c.json({ message: 'Invalid request' }, 400);

  try {
    const notif = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notif) return c.json({ message: 'Dispatch not found' }, 404);

    const updated = await prisma.notification.update({
      where: { id },
      data: { isSaved: !notif.isSaved }
    });

    return c.json({ success: true, isSaved: updated.isSaved });
  } catch (error) {
    return c.json({ message: 'Failed to star dispatch record' }, 500);
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

// ── DELETE /api/v1/notifications/purge-old ──────────────────────────────────
router.delete('/purge-old', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  try {
    // Note: This endpoint is for user-initiated purge of their own old records
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await prisma.notification.deleteMany({
      where: { 
        userId,
        read: true,
        isSaved: false,
        createdAt: { lt: sevenDaysAgo }
      }
    });
    return c.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Failed to purge old notifications:', error);
    return c.json({ message: 'Failed to purge institutional records' }, 500);
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
