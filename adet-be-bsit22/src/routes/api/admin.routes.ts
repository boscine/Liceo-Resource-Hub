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
    console.error('Failed to fetch admin posts:', error);
    return c.json({ message: 'Internal server error while fetching curator archive.' }, 500);
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
    console.error('Administrative System Failure: Failed to fetch scholarly reports:', error);
    return c.json({ message: 'Internal server error while accessing the institutional reporting archive.' }, 500);
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
      data: { status },
      include: { post: true }
    });

    // ── Logic: If report is dismissed, potentially unflag the post if no other active reports ──
    if (status === 'dismissed' && report.post.isFlagged) {
       const otherActiveReports = await prisma.postReport.count({
         where: { 
           postId: report.postId,
           id: { not: id },
           status: { in: ['pending', 'reviewed'] }
         }
       });

       if (otherActiveReports === 0) {
         await prisma.post.update({
           where: { id: report.postId },
           data: { isFlagged: false }
         });
       }
    }

    return c.json(report);
  } catch (error) {
    console.error('Administrative System Failure: Failed to update scholarly report status:', error);
    return c.json({ message: 'Internal server error while modifying report records.' }, 500);
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
    console.error('Administrative System Failure: Failed to fetch user registry:', error);
    return c.json({ message: 'Internal server error while accessing the scholarly user registry.' }, 500);
  }
});

// ── PUT /api/v1/admin/users/:id/status (Ban/Unban/Suspend) ──────────────────
router.put('/users/:id/status', async (c) => {
  if (c.get('role') !== 'admin') return c.json({ message: 'Forbidden' }, 403);

  const id = parseInt(c.req.param('id'), 10);
  const adminId = c.get('userId');
  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  // Loophole Fix: Prevent Admin Self-Lockout
  if (id === adminId) {
    return c.json({ message: 'Institutional Safety: You cannot modify your own administrative status.' }, 403);
  }

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
