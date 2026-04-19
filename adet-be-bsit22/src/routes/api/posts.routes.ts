import { Hono } from 'hono';
import { AuthVariables, publicAccess } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { zValidator } from '@hono/zod-validator';
import { postSchema, updatePostSchema, reportSchema } from '../../lib/validation';
import { containsInappropriateContent } from '../../lib/moderation';
import { analyzePostContent } from '../../lib/ai.moderation';
import { getTimeAgo, escapeHtml } from '../../lib/utils';

const router = new Hono<{ Variables: AuthVariables }>();

// ── GET /api/v1/posts (Student Feed - Only show active) ────────────────────────
router.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '12', 10);
  const category = c.req.query('category');
  const viewMode = c.req.query('viewMode');
  const sortBy = c.req.query('sortBy') || 'newest';
  const savedIdsStr = c.req.query('savedIds');
  const userId = c.get('userId');
  const skip = (page - 1) * limit;

  // console.log(`[GET /posts] userId: ${userId}, viewMode: ${viewMode}, category: ${category}`);

  // ── Institutional Filter Protocol ──────────────────────────────────────────
  const where: any = { AND: [] };

  if (viewMode === 'requests') {
    if (userId) {
      // console.log(`[Filtering] Applying user-specific filter for userId: ${userId}`);
      // OWNER VIEW: Show all of user's posts (except removed)
      where.AND.push({ userId: userId });
      where.AND.push({ NOT: { status: 'removed' } });
    } else {
      // If requests mode is asked but no userId found, return nothing or all?
      // For security, return empty results as they aren't authorized for 'their' requests
      where.AND.push({ id: -1 });
    }
  } else if (viewMode === 'saved' && savedIdsStr) {
    // SAVED VIEW: Show only posts in the saved list
    const ids = savedIdsStr.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (ids.length > 0) {
      where.AND.push({ id: { in: ids } });
      where.AND.push({ NOT: { status: 'removed' } });
      where.AND.push({ isFlagged: false });
    } else {
      where.AND.push({ id: -1 }); // Force empty results
    }
  } else {
    // PUBLIC FEED: Show only unflagged, non-removed posts, and hide the current user's own posts
    where.AND.push({ NOT: { status: 'removed' } });
    where.AND.push({ isFlagged: false });
    if (userId) {
      where.AND.push({ userId: { not: userId } });
    }
  }

  if (category) {
    const cats = category.split(',').map(c => c.trim()).filter(c => c !== 'All Resources');
    if (cats.length > 0) {
      where.AND.push({ category: { name: { in: cats } } });
    }
  }

  // ── Sorting Logic ──────────────────────────────────────────────────────────
  let orderBy: any = { createdAt: 'desc' };
  if (sortBy === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (sortBy === 'trending') {
    orderBy = { reports: { _count: 'desc' } };
  }

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          category: { select: { name: true } },
          user: { select: { id: true, displayName: true } },
          _count: { select: { reports: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);    
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

    return c.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── GET /api/v1/posts/:id ─────────────────────────────────────────────────────
router.get('/:id', async (c) => {
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

// ── POST /api/v1/posts ────────────────────────────────────────────────────────
router.post('/', zValidator('json', postSchema, (result, c) => {
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
    const userIdNum = Number(userId);

    // ── Contact Info Check ──────────────────────────────────────────
    const userContacts = await prisma.contact.count({
      where: { userId: userIdNum }
    });

    if (userContacts === 0 && c.get('role') !== 'admin') {
      return c.json({ 
        message: 'Account Incomplete: You must add at least one contact method (Messenger, Phone, etc.) to your profile before publishing scholarly requests so others can reach you.' 
      }, 403);
    }

    // ── Moderation Check ───────────────────────────────────────────
    if (containsInappropriateContent(title) || containsInappropriateContent(description)) {
      return c.json({ message: 'Scholarly Integrity Violation: Your post contains inappropriate or unprofessional language prohibited by HUB standards.' }, 400);
    }

    const aiResult = await analyzePostContent(title, description);
    const isAutoFlagged = !aiResult.isAppropriate;

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
        status: isAutoFlagged ? 'closed' : 'open',
        isFlagged: isAutoFlagged
      }
    });

    // ── Create Notification ───────────────────────────────────────────
    if (isAutoFlagged) {
      await prisma.notification.create({
        data: {
          userId,
          icon: 'report_problem',
          text: `Scholarly Alarm: Your request "<b>${escapeHtml(title)}</b>" was auto-flagged for curator review. ${aiResult.reason || ''}`
        }
      });
      
      // Also create a system report for the admin
      await prisma.postReport.create({
        data: {
          postId: post.id,
          reporterId: userId, // Self-report as trigger
          reason: 'inappropriate',
          details: `AI AUTO-MODERATION: ${aiResult.reason}`,
          status: 'pending'
        }
      });

    } else {
      await prisma.notification.create({
        data: {
          userId,
          icon: 'check_circle',
          text: `Your request "<b>${escapeHtml(title)}</b>" has been published successfully.`
        }
      });
    }

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
router.put('/:id', zValidator('json', updatePostSchema, (result, c) => {
  if (!result.success) {
    return c.json({ message: result.error.issues[0].message }, 400);
  }
}), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId');
  const role = c.get('role');

  if (isNaN(id)) return c.json({ message: 'Invalid ID' }, 400);

  try {
    const { title, categoryId, description, imageUrl, status, isFlagged, moderationReason } = c.req.valid('json');
    const userIdNum = Number(userId);

    // ── Contact Info Check ──────────────────────────────────────────
    const userContacts = await prisma.contact.count({
      where: { userId: userIdNum }
    });

    if (userContacts === 0 && role !== 'admin') {
      return c.json({ 
        message: 'Account Incomplete: You must have at least one contact method in your profile to maintain scholarly requests.' 
      }, 403);
    }

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
    
    // Moderation: Status and Flag updates only
    if (title !== undefined && userId === post.userId) data.title = title;
    if (description !== undefined && userId === post.userId) data.description = description;
    if (imageUrl !== undefined && userId === post.userId) data.imageUrl = imageUrl?.trim() ? imageUrl.trim() : null;
    if (categoryId !== undefined && userId === post.userId) {
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
      // Loophole Fix: Prevent users from "un-moderating" their own posts
      if (role !== 'admin' && (post.status === 'removed' || post.isFlagged)) {
        return c.json({ message: 'Institutional Moderation: You cannot modify the status of a record currently under administrative review or removal.' }, 403);
      }
      
      // Loophole Fix: Rate limit status changes to prevent spamming status toggles
      if (role !== 'admin') {
        const recentStatusChange = await prisma.post.findFirst({
          where: { 
            id, 
            updatedAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } 
          }
        });
        if (recentStatusChange) {
           return c.json({ message: 'Scholarly Rate Limit: Please wait 5 minutes between status updates.' }, 429);
        }
      }

      data.status = status.toLowerCase();
    }

    // Flagging is Admin-only
    if (isFlagged !== undefined && flagChanged) {
      if (role !== 'admin') {
         return c.json({ message: 'Only admins can flag or unflag posts' }, 403);
      }
      data.isFlagged = !!isFlagged;
      if (data.isFlagged) {
        data.status = 'closed';
      }
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
      const escapedTitle = escapeHtml(updatedPost.title);
      let notifText = `Changes to your request "<b>${escapedTitle}</b>" have been saved.`;
      let notifIcon = 'edit';

      if (statusChanged) {
        if (data.status === 'fulfilled') {
          notifText = `Scholar! Your request "<b>${escapedTitle}</b>" is now marked as FULFILLED.`;
          notifIcon = 'auto_awesome';
        } else if (data.status === 'closed') {
          notifText = `Your request "<b>${escapedTitle}</b>" has been closed.`;
          notifIcon = 'do_not_disturb_on';
        } else if (data.status === 'removed' && role === 'admin') {
          notifText = `Your request "<b>${escapedTitle}</b>" was removed by an administrator.`;
          notifIcon = 'delete_forever';
        }
      } else if (flagChanged && updatedPost.isFlagged) {
        notifText = `Your request "<b>${escapedTitle}</b>" is currently under moderation review.`;
        notifIcon = 'flag';
      }

      // Append reason if provided by admin
      if (moderationReason && role === 'admin' && (flagChanged || statusChanged)) {
        notifText += ` Reason: ${escapeHtml(moderationReason)}`;
      }

      let notifType = 'system';
      if (statusChanged && (data.status === 'fulfilled' || data.status === 'closed')) {
        notifType = 'resolved';
      }

      await prisma.notification.create({
        data: {
          userId: updatedPost.userId,
          icon: notifIcon,
          text: notifText,
          type: notifType
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
router.post('/:id/report', zValidator('json', reportSchema, (result, c) => {
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

    // Loophole Fix: Rate limiting reports to prevent mass suppression
    const recentReportsCount = await prisma.postReport.count({
      where: {
        reporterId,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
      }
    });

    if (recentReportsCount >= 5) {
       return c.json({ message: 'Institutional Moderation Limit: You have reached the maximum number of reports allowed within a 5-minute window.' }, 429);
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
          text: `Scholarly Alarm: Your request "<b>${escapeHtml(post.title)}</b>" has been auto-flagged for moderation review after multiple reports.`
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
router.post('/bulk-delete', async (c) => {
  const userId = c.get('userId');
  const role = c.get('role');

    try {
    const body = await c.req.json();
    const { ids, reason } = body;

    if (!ids || !Array.isArray(ids)) {
      return c.json({ message: 'Invalid scholarly archive IDs.' }, 400);
    }

    // Loophole Fix: Prevent ID exhaustion/DoS by limiting bulk size
    if (ids.length > 50) {
      return c.json({ message: 'Institutional Limit Exceeded: You can only purge 50 records at a time.' }, 400);
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
            text: `Your request "<b>${escapeHtml(p.title)}</b>" has been permanently removed by an administrator.${reason ? ' Reason: ' + escapeHtml(reason) : ''}`
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
router.delete('/:id', async (c) => {
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
      const reason = c.req.query('reason');
      await prisma.notification.create({
        data: {
          userId: post.userId,
          icon: 'delete_sweep',
          text: `Your request "<b>${escapeHtml(post.title)}</b>" has been permanently removed by a HUB administrator.${reason ? ' Reason: ' + escapeHtml(reason) : ''}`
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

// ── POST /api/v1/posts/:id/cooperate (Offer Help) ──────────────────────────
router.post('/:id/cooperate', async (c) => {
  const postId = parseInt(c.req.param('id'), 10);
  const userId = c.get('userId'); 
  if (isNaN(postId) || !userId) return c.json({ message: 'Invalid request' }, 400);

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, title: true }
    });

    if (!post) return c.json({ message: 'Post not found' }, 404);

    if (post.userId !== userId) {
      // Loophole Fix: Rate limit cooperation notifications to prevent spam (Max 3 per hour per post/user combo)
      const existingNotifCount = await prisma.notification.count({
        where: {
          userId: post.userId,
          type: 'cooperation',
          text: { contains: post.title },
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
        }
      });

      if (existingNotifCount >= 3) {
        return c.json({ message: 'Institutional Limit: Too many cooperation requests sent for this archive record.' }, 429);
      }

      const notifText = `A fellow scholar is interested in cooperating on your request: "<b>${escapeHtml(post.title)}</b>".`;
      await prisma.notification.create({
        data: {
          userId: post.userId,
          icon: 'handshake',
          text: notifText,
          type: 'cooperation'
        }
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to notify author on cooperation:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ── POST /api/v1/posts/:id/save (Notify Author) ─────────────────────────────
router.post('/:id/save', async (c) => {
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
      // Loophole Fix: Stricter spam prevention for saves across the board
      // Limit global save notifications for a single user to 10 per hour
      const totalUserSaveNotifs = await prisma.notification.count({
        where: {
          userId: post.userId,
          type: 'save_alert', // Dedicated type for tracking
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
        }
      });

      if (totalUserSaveNotifs < 10) {
        const escapedTitle = escapeHtml(post.title);
        const notifText = `A fellow scholar has saved your request: "<b>${escapedTitle}</b>".`;
        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: post.userId,
            text: notifText,
            createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Within last hour for this specific post
          }
        });

        if (!recentNotif) {
          await prisma.notification.create({
            data: {
              userId: post.userId,
              icon: 'bookmark_added',
              text: notifText,
              type: 'save_alert'
            }
          });
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to notify author on save:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

export default router;
