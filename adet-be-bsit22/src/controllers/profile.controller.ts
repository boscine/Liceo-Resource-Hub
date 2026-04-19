import { Context } from 'hono';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '../lib/mail.service';
import { containsInappropriateContent } from '../lib/moderation';

export const getProfile = async (c: Context) => {
  // Use the 'userId' field set by our custom authenticate middleware
  const userId = c.get('userId'); 

  if (!userId) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        contacts: {
          select: { type: true, value: true }
        },
        _count: {
          select: {
            posts: true
          }
        }
      },
    });

    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }

    // Get counts by status
    const statusCounts = await prisma.post.groupBy({
      by: ['status'],
      where: { userId: Number(userId) },
      _count: true
    });

    const stats = {
      open: statusCounts.find(s => s.status === 'open')?._count || 0,
      fulfilled: statusCounts.find(s => s.status === 'fulfilled')?._count || 0,
      closed: statusCounts.find(s => s.status === 'closed')?._count || 0,
      removed: statusCounts.find(s => s.status === 'removed')?._count || 0
    };

    return c.json({ ...user, stats });
  } catch (error) {
    console.error('getProfile Error:', error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
};

export const updateProfile = async (c: Context) => {
  const userId = c.get('userId'); 

  if (!userId) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const { displayName, contacts, password } = await c.req.json();

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { displayName: true, displayNameUpdatedAt: true }
    });

    if (!user) return c.json({ message: 'User not found' }, 404);

    const data: any = {
      contacts: {
        deleteMany: {},
        create: contacts
      }
    };

    // ── NAME CHANGE COOLDOWN LOGIC ──────────────────────────────────────────
    if (displayName && displayName !== user.displayName) {
      // Moderation Check
      if (containsInappropriateContent(displayName)) {
        return c.json({ message: 'Scholarly Integrity Violation: The requested display name contains inappropriate content prohibited by HUB standards.' }, 400);
      }

      if (user.displayNameUpdatedAt) {
        const lastUpdate = new Date(user.displayNameUpdatedAt);
        const diffDays = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
        
        if (diffDays < 7) {
          const remaining = Math.ceil(7 - diffDays);
          return c.json({ 
            message: `Institutional Rule: You can only update your display name once every 7 days. Please wait ${remaining} more day(s).` 
          }, 403);
        }
      }
      data.displayName = displayName;
      data.displayNameUpdatedAt = new Date();
    }

    if (password && password.trim() !== '') {
      data.passwordHash = bcrypt.hashSync(password, 10);
    }

    // ── Database Update ─────────────────────────────────────────────────────
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data,
      include: { 
        contacts: {
          select: { type: true, value: true }
        } 
      }
    });

    return c.json({ 
      message: 'Profile updated successfully', 
      user: {
        displayName: updatedUser.displayName,
        contacts: updatedUser.contacts
      }
    });
  } catch (error) {
    return c.json({ message: 'Internal Server Error' }, 500);
  }
};

export const requestPasswordChange = async (c: Context) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  try {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return c.json({ message: 'User not found' }, 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 mins expiry

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: otp,
        expiresAt
      }
    });

    await sendOTPEmail(user.email, otp);

    return c.json({ message: 'A secure validation code has been dispatched to your institutional mail.' });
  } catch (error) {
    console.error('RequestPasswordChange Error:', error);
    return c.json({ message: 'Failed to initiate security protocol.' }, 500);
  }
};

export const verifyPasswordChange = async (c: Context) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  try {
    const { otp, newPassword } = await c.req.json();
    
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        userId: Number(userId),
        token: otp,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRequest) {
      return c.json({ message: 'Invalid or expired scholarly validation code.' }, 400);
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: Number(userId) },
        data: { passwordHash }
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() }
      })
    ]);

    return c.json({ message: 'Credentials updated successfully.' });
  } catch (error) {
    console.error('VerifyPasswordChange Error:', error);
    return c.json({ message: 'System error during credential update.' }, 500);
  }
};