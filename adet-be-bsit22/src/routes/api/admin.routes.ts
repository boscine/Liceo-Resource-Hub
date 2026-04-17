import { Hono } from 'hono';
import { AuthVariables } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { getTimeAgo } from '../../lib/utils';

const router = new Hono<{ Variables: AuthVariables }>();

// ── GET /api/v1/admin/posts (Admin Dashboard - Show EVERYTHING) ───────────────
router.get('/posts', async (c) => {
  if (c.get('role') !== 'admin') return c.json({ message: 'Forbidden' }, 403);

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

    return c.json(formattedPosts);
  } catch (error) {
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── GET /api/v1/admin/reports ───────────────────────────────────────────────
router.get('/reports', async (c) => {
  if (c.get('role') !== 'admin') return c.json({ message: 'Forbidden' }, 403);

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

    return c.json(formatted);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── PUT /api/v1/admin/reports/:id ───────────────────────────────────────────
router.put('/reports/:id', async (c) => {
  if (c.get('role') !== 'admin') return c.json({ message: 'Forbidden' }, 403);

  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const body = await c.req.json();
    const { status } = body;

    const validStatuses = ['pending', 'reviewed', 'dismissed'];
    if (!status || !validStatuses.includes(status)) {
      return c.json({ message: 'Invalid status' }, 400);
    }

    const report = await prisma.postReport.update({
      where: { id },
      data: { status }
    });

    return c.json(report);
  } catch (error) {
    console.error('Failed to update report:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── GET /api/v1/admin/users (Admin Management) ─────────────────────────────
router.get('/users', async (c) => {
  if (c.get('role') !== 'admin') return c.json({ message: 'Forbidden' }, 403);

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return c.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── PUT /api/v1/admin/users/:id/status (Ban/Unban/Suspend) ──────────────────
router.put('/users/:id/status', async (c) => {
  if (c.get('role') !== 'admin') return c.json({ message: 'Forbidden' }, 403);

  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const { status } = await c.req.json();
    const validStatuses = ['active', 'pending', 'suspended', 'banned'];

    if (!status || !validStatuses.includes(status)) {
      return c.json({ message: 'Invalid scholarly status provided.' }, 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: status as any }
    });

    // Notify the user of status change
    await prisma.notification.create({
      data: {
        userId: id,
        icon: status === 'active' ? 'check_circle' : 'block',
        text: `Institutional Status Update: Your account status has been changed to ${status.toUpperCase()}.`
      }
    });

    return c.json({ message: `Account status updated to ${status}.`, user: updatedUser });
  } catch (error) {
    console.error('Failed to update user status:', error);
    return c.json({ message: 'Internal server error during status modification.' }, 500);
  }
});

export default router;
