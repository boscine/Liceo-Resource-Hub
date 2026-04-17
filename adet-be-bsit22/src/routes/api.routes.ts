import { Hono } from 'hono';
import { AuthVariables } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { updateProfile, getProfile } from '../controllers/profile.controller';
import { zValidator } from '@hono/zod-validator';
import { postSchema, updatePostSchema, profileSchema, reportSchema } from '../lib/validation';
import { containsInappropriateContent } from '../lib/moderation';


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
      category: p.category.name,
      author: p.user.displayName,
      authorId: p.user.id,
      imageUrl: p.imageUrl,
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

    const formattedPost = {
      id: post.id,
      title: post.title,
      description: post.description,
      status: post.status.toUpperCase(),
      category: post.category.name,
      author: post.user.displayName,
      authorId: post.userId,
      imageUrl: post.imageUrl,
      timeAgo: getTimeAgo(post.createdAt),
      resolved: post.status === 'fulfilled' || post.status === 'closed',
      createdAt: post.createdAt,
      isFlagged: post.isFlagged,
      contacts: post.user.contacts && post.user.contacts.length > 0 && userId
        ? post.user.contacts.map(c => ({
            type: c.type.charAt(0).toUpperCase() + c.type.slice(1),
            value: c.value
          }))
        : []
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

router.put('/profile', zValidator('json', profileSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }
}), updateProfile);

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
router.post('/posts', zValidator('json', postSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }
}), async (c) => {
  const userId = c.get('userId');
  
  if (!userId) {
     return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const { title, categoryId, description, imageUrl } = c.req.valid('json');

    // ── Moderation Check ───────────────────────────────────────────
    if (containsInappropriateContent(title) || containsInappropriateContent(description)) {
      return c.json({ message: 'Scholarly Integrity Violation: Your post contains inappropriate or unprofessional language prohibited by HUB standards.' }, 400);
    }

    const catId = categoryId;


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
        imageUrl: imageUrl?.trim() ? imageUrl.trim() : null,
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
  } catch (error: any) {
    if (error.code === 'P2000') {
      return c.json({ message: 'The request title is too long for the institutional archive. Please shorten it.' }, 400);
    }
    console.error('Failed to create post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── PUT /api/v1/posts/:id (Supports Admin Moderation) ──────────────────────────
router.put('/posts/:id', zValidator('json', updatePostSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }
}), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId');
  const role = c.get('role');

  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const { title, categoryId, description, imageUrl, status, isFlagged } = c.req.valid('json');

    // ── Moderation Check ───────────────────────────────────────────
    if ((title && containsInappropriateContent(title)) || (description && containsInappropriateContent(description))) {
      return c.json({ message: 'Scholarly Integrity Violation: Your updates contain inappropriate or unprofessional language prohibited by HUB standards.' }, 400);
    }


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
    
    // Moderation: Allow Admins to edit content for institutional cleanup
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl?.trim() ? imageUrl.trim() : null;
    if (categoryId !== undefined) {
      const catId = Number(categoryId);
      if (isNaN(catId)) {
        return c.json({ message: 'Invalid category ID.' }, 400);
      }
      const categoryExists = await prisma.category.findUnique({ where: { id: catId } });
      if (!categoryExists) {
        return c.json({ message: 'The specified scholarly category does not exist.' }, 400);
      }
      data.categoryId = catId;
    }

    // Status validation
    if (status !== undefined && statusChanged) {
      data.status = status.toLowerCase();
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

    // ── Create Dynamic Notification (Only on significant changes) ─────────────────
    if (statusChanged || flagChanged || (role === 'admin' && (title !== undefined || description !== undefined))) {
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
    }

    return c.json(updatedPost);
  } catch (error: any) {
    if (error.code === 'P2000') {
      return c.json({ message: 'The updated information is too long for the institutional archive. Please shorten your input.' }, 400);
    }
    console.error('Failed to update post:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── POST /api/v1/posts/:id/report (3+ Reports Auto-Flag) ─────────────────────
router.post('/posts/:id/report', zValidator('json', reportSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }
}), async (c) => {
  const postId = parseInt(c.req.param('id'), 10);
  const reporterId = c.get('userId');

  if (isNaN(postId) || !reporterId) {
    return c.json({ message: 'Unauthorized scholarly reporting.' }, 401);
  }

  try {
    const { reason, details } = c.req.valid('json');

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return c.json({ message: 'Post not found' }, 404);

    if (post.userId === reporterId) {
      return c.json({ message: 'Self-reporting is not permitted.' }, 400);
    }

    // 1. Create the report
    await prisma.postReport.upsert({
      where: { postId_reporterId: { postId, reporterId } },
      update: { reason, details, status: 'pending' },
      create: { postId, reporterId, reason, details, status: 'pending' }
    });

    // 2. Count non-dismissed reports to trigger auto-flagging (Rule of 3)
    const activeReportCount = await prisma.postReport.count({ 
      where: { 
        postId,
        status: { in: ['pending', 'reviewed'] } 
      } 
    });
    
    if (activeReportCount >= 3 && !post.isFlagged) {
      await prisma.post.update({
        where: { id: postId },
        data: { isFlagged: true }
      });

      // Notify the author about moderation
      await prisma.notification.create({
        data: {
          userId: post.userId,
          icon: 'flag',
          text: `Scholarly Alarm: Your request "${post.title}" has been auto-flagged for moderation review after multiple reports.`
        }
      });
    }

    return c.json({ message: 'Report submitted successfully. Thank you for maintaining HUB integrity.' });
  } catch (error) {
    console.error('Failed to report post:', error);
    return c.json({ message: 'Internal server error during reporting.' }, 500);
  }
});

// ── POST /api/v1/posts/bulk-delete (Highly Efficient) ──────────────────────
router.post('/posts/bulk-delete', async (c) => {
  const userId = c.get('userId');
  const role = c.get('role');
  
  try {
    const body = await c.req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
      return c.json({ message: 'Invalid scholarly archive IDs.' }, 400);
    }

    const numericIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (numericIds.length === 0) {
      return c.json({ message: 'No valid archive records selected.' }, 400);
    }

    // 1. Fetch posts to verify authorization
    const posts = await prisma.post.findMany({
      where: { id: { in: numericIds } }
    });

    // 2. Filter allowed records (Owner or Admin)
    const allowedPosts = posts.filter(p => p.userId === userId || role === 'admin');
    const allowedIds = allowedPosts.map(p => p.id);

    if (allowedIds.length === 0) {
      return c.json({ message: 'Forbidden: Unauthorized access to selected records.' }, 403);
    }

    // 3. Dispatch Institutional Notifications for Administrative overrides
    if (role === 'admin') {
      const othersPosts = allowedPosts.filter(p => p.userId !== userId);
      if (othersPosts.length > 0) {
        await prisma.notification.createMany({
          data: othersPosts.map(p => ({
            userId: p.userId,
            icon: 'delete_sweep',
            text: `Your request "${p.title}" has been permanently removed by an administrator.`
          }))
        });
      }
    }

    // 4. Atomic deletion
    await prisma.post.deleteMany({
      where: { id: { in: allowedIds } }
    });

    return c.json({ 
      success: true, 
      message: `${allowedIds.length} academic record(s) purged successfully.`,
      deletedCount: allowedIds.length
    });
  } catch (error) {
    console.error('Failed bulk delete:', error);
    return c.json({ message: 'Internal server error during scholarly cleanup.' }, 500);
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
    
    // ── Authorization Check ──────────────────────────────────────────────────
    // Only the owner or an admin can delete this post
    if (post.userId !== userId && role !== 'admin') {
      return c.json({ message: 'Forbidden: You do not have permission to delete this scholarly request.' }, 403);
    }

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
// ── POST /api/v1/posts/:id/save (Notify Author) ─────────────────────────────
router.post('/posts/:id/save', async (c) => {
  const postId = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId'); 
  if (isNaN(postId) || !userId) return c.json({ message: 'Invalid request' }, 400);

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, title: true }
    });

    if (!post) return c.json({ message: 'Post not found' }, 404);

    // Only notify if someone ELSE saves it
    if (post.userId !== userId) {
      // Institutional Spam Prevention: Check for duplicate recent notifications
      const notifText = `A fellow scholar has saved your request: "${post.title}".`;
      const recentNotif = await prisma.notification.findFirst({
        where: {
          userId: post.userId,
          text: notifText,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Within last hour
        }
      });

      if (!recentNotif) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            icon: 'bookmark_added',
            text: notifText
          }
        });
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to notify author on save:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── GET /api/v1/notifications ────────────────────────────────────────────────
router.get('/notifications', async (c) => {
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

// ── PUT /api/v1/notifications/:id/read ──────────────────────────────────────
router.put('/notifications/:id/read', async (c) => {
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

// ── DELETE /api/v1/notifications/:id ────────────────────────────────────────
router.delete('/notifications/:id', async (c) => {
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

// ── DELETE /api/v1/notifications/clear-all ──────────────────────────────────
router.delete('/notifications/clear-all', async (c) => {
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

// ── GET /api/v1/admin/users (Admin Management) ─────────────────────────────
router.get('/admin/users', async (c) => {
  if (c.get('role') !== 'admin') return c.json({ message: 'Forbidden' }, 403);

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        college: true,
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
router.put('/admin/users/:id/status', async (c) => {
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

    // Notify the user of status change (If they can even see notifications while banned/suspended?)
    // Note: If they are NOT 'active', they are blocked by the middleware, but adding a record is good practice.
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