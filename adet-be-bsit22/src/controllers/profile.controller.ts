import { Context } from 'hono';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '../lib/mail.service';

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
        displayName: true,
        email: true,
        role: true,
        status: true,
        contacts: {
          select: { type: true, value: true }
        }
      },
    });

    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }

    return c.json(user);
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