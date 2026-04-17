import { Context } from 'hono';
import prisma from '../lib/prisma';
import { profileSchema } from '../lib/validation';

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
    const { displayName, contacts } = c.req.valid('json');

    // ── Database Update ─────────────────────────────────────────────────────
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        displayName,
        contacts: {
          deleteMany: {},
          create: contacts
        }
      },
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
    console.error('Failed to update profile:', error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
};