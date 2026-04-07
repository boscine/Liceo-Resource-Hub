import { Hono } from 'hono';
import { AuthVariables } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { updateProfile, getProfile } from '../controllers/profile.controller';

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

// ── GET /api/v1/posts (Student Feed - Only show active) ────────────────────────
router.get('/posts', async (c) => {
  try {
    const posts = await prisma.post.findMany({
      where: { 
        AND: [
          { NOT: { status: 'removed' } },
          { isFlagged: false }
        ]
      },
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
      category: p.category.name.toUpperCase(),
      author: p.user.displayName,
      authorId: p.user.id,
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

// ── GET /api/v1/admin/posts (Admin Dashboard - Show EVERYTHING) ───────────────
router.get('/admin/posts', async (c) => {
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
      category: p.category.name.toUpperCase(),
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

// ── GET /api/v1/posts/:id ─────────────────────────────────────────────────────
router.get('/posts/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId');
  const role = c.get('role');

  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        user: { 
          include: { 
            contacts: true 
          } 
        }
      }
    });

    if (!post) return c.json({ message: 'Post not found' }, 404);

    // ── Moderation Check ──────────────────────────────────────────────────────
    // If post is flagged or removed, only Author or Admin can see it
    const isOwner = post.userId === userId;
    const isAdmin = role === 'admin';
    if ((post.isFlagged || post.status === 'removed') && !isOwner && !isAdmin) {
       return c.json({ message: 'This post is under moderation review.' }, 403);
    }

    const firstContact = post.user.contacts && post.user.contacts.length > 0 
      ? post.user.contacts[0] 
      : null;

    const formattedPost = {
      id: post.id,
      title: post.title,
      description: post.description,
      status: post.status.toUpperCase(),
      category: post.category.name.toUpperCase(),
      author: post.user.displayName,
      authorId: post.userId,
      timeAgo: getTimeAgo(post.createdAt),
      resolved: post.status === 'fulfilled' || post.status === 'closed',
      createdAt: post.createdAt,
      isFlagged: post.isFlagged,
      contact: firstContact ? { 
        type: firstContact.type.charAt(0).toUpperCase() + firstContact.type.slice(1), 
        value: firstContact.value 
      } : { type: 'None', value: 'No contact shared' }
    };

    return c.json(formattedPost);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── GET /api/v1/categories ────────────────────────────────────────────────────
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

// ── GET /api/v1/profile ───────────────────────────────────────────────────────
router.get('/profile', getProfile);

router.put('/profile', updateProfile);

// ── GET /api/v1/profile/:id (Public Profile View) ───────────────────────────
router.get('/profile/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
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

    const formattedPosts = user.posts.map(p => ({
      id: p.id,
      title: p.title,
      status: p.status.toUpperCase(),
      category: p.category.name.toUpperCase(),
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

// ── GET /api/v1/admin/reports ───────────────────────────────────────────────
router.get('/admin/reports', async (c) => {
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
router.put('/admin/reports/:id', async (c) => {
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

// ── POST /api/v1/posts ────────────────────────────────────────────────────────
router.post('/posts', async (c) => {
  const userId = c.get('userId');
  
  if (!userId) {
     return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { title, categoryId, description } = body;
    
    if (!title || !categoryId || !description) {
       return c.json({ message: 'Missing required fields' }, 400);
    }

    const catId = parseInt(categoryId, 10);
    if (isNaN(catId)) {
      return c.json({ message: 'Invalid category ID format' }, 400);
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: catId } });
    if (!categoryExists) {
      return c.json({ message: 'The specified scholarly category does not exist.' }, 400);
    }

    const post = await prisma.post.create({
      data: {
        userId,
        categoryId: catId,
        title,
        description,
        status: 'open'
      }
    });

    // ── Create Notification ───────────────────────────────────────────
    await prisma.notification.create({
      data: {
        userId,
        icon: 'check_circle',
        text: `Your request "${title}" has been published successfully.`
      }
    });

    return c.json(post, 201);
  } catch (error) {
    console.error('Failed to create post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── PUT /api/v1/posts/:id (Supports Admin Moderation) ──────────────────────────
router.put('/posts/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId');
  const role = c.get('role');

  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const body = await c.req.json();
    const { title, categoryId, description, status, isFlagged } = body;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return c.json({ message: 'Post not found' }, 404);
    
    // Ownership check (Admins are exempt)
    if (post.userId !== userId && role !== 'admin') {
      return c.json({ message: 'Forbidden' }, 403);
    }

    // ── Build update payload ──────────────────────────────────────────────────
    const data: any = {};
    const statusChanged = status && status.toLowerCase() !== post.status;
    const flagChanged = isFlagged !== undefined && !!isFlagged !== post.isFlagged;
    
    // Students can only update content if they own it
    if (post.userId === userId) {
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (categoryId !== undefined) {
        const catId = parseInt(categoryId, 10);
        if (!isNaN(catId)) data.categoryId = catId;
      }
    } else if (title !== undefined || description !== undefined || categoryId !== undefined) {
      return c.json({ message: 'You are not allowed to modify the content of this post.' }, 403);
    }

    // Status validation
    if (status !== undefined && statusChanged) {
      const lowerStatus = status.toLowerCase();
      const validStatuses = ['open', 'fulfilled', 'closed', 'removed'];
      if (!validStatuses.includes(lowerStatus)) {
        return c.json({ message: `Invalid status: ${lowerStatus}.` }, 400);
      }
      data.status = lowerStatus;
    }

    // Flagging is Admin-only
    if (isFlagged !== undefined && flagChanged) {
      if (role !== 'admin') {
         return c.json({ message: 'Only admins can flag or unflag posts' }, 403);
      }
      data.isFlagged = !!isFlagged;
    }

    if (Object.keys(data).length === 0) {
      return c.json(post); // No changes made
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data,
      include: {
        category: { select: { name: true } },
        user: { select: { id: true, displayName: true } }
      }
    });

    // ── Create Dynamic Notification ───────────────────────────────────────────
    let notifText = `Changes to your request "${updatedPost.title}" have been saved.`;
    let notifIcon = 'edit';

    if (statusChanged) {
      if (data.status === 'fulfilled') {
        notifText = `Scholar! Your request "${updatedPost.title}" is now marked as FULFILLED.`;
        notifIcon = 'auto_awesome';
      } else if (data.status === 'closed') {
        notifText = `Your request "${updatedPost.title}" has been closed.`;
        notifIcon = 'do_not_disturb_on';
      } else if (data.status === 'removed' && role === 'admin') {
        notifText = `Your request "${updatedPost.title}" was removed by an administrator.`;
        notifIcon = 'delete_forever';
      }
    } else if (flagChanged && updatedPost.isFlagged) {
      notifText = `Your request "${updatedPost.title}" is currently under moderation review.`;
      notifIcon = 'flag';
    }

    await prisma.notification.create({
      data: {
        userId: updatedPost.userId,
        icon: notifIcon,
        text: notifText
      }
    });

    return c.json(updatedPost);
  } catch (error) {
    console.error('Failed to update post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── DELETE /api/v1/posts/:id (Supports Admin Override) ────────────────────────
router.delete('/posts/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId');
  const role = c.get('role');

  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return c.json({ message: 'Post not found' }, 404);
    
    // Notify user if someone else (admin) deletes the post
    if (post.userId !== userId && role === 'admin') {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          icon: 'delete_sweep',
          text: `Your request "${post.title}" has been permanently removed by a HUB administrator.`
        }
      });
    }

    await prisma.post.delete({ where: { id } });
    return c.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});
// ── GET /api/v1/notifications ────────────────────────────────────────────────
router.get('/notifications', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    // We format the time dynamically or map it out
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

// ── PUT /api/v1/notifications/:id/read ──────────────────────────────────────
router.put('/notifications/:id/read', async (c) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id) || !userId) return c.json({ message: 'Invalid request' }, 400);

  try {
    await prisma.notification.update({
      where: { id, userId },
      data: { read: true }
    });
    return c.json({ success: true });
  } catch (error) {
    return c.json({ message: 'Failed to update notification' }, 500);
  }
});

// ── PUT /api/v1/notifications/mark-all-read ─────────────────────────────────
router.put('/notifications/mark-all-read', async (c) => {
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

export default router;