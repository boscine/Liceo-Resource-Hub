import { Context } from 'hono';
import prisma from '../lib/prisma';

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
        college: true,
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
    const { displayName, contacts, college } = await c.req.json();
    
    if (!displayName || displayName.trim().length < 2) {
      return c.json({ message: 'A valid display name (min 2 chars) is required' }, 400);
    }

    // Validate Contact Types before hitting DB
    if (contacts && Array.isArray(contacts)) {
      const validTypes = ['messenger', 'phone', 'other'];
      for (const contact of contacts) {
        if (!validTypes.includes(contact.type)) {
          return c.json({ message: `Invalid contact type: ${contact.type}. Allowed: ${validTypes.join(', ')}` }, 400);
        }
        if (!contact.value || contact.value.trim() === '') {
           return c.json({ message: `A value is required for contact type: ${contact.type}` }, 400);
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        displayName,
        college: college ?? undefined,
        contacts: {
          deleteMany: {},
          create: Array.isArray(contacts) ? contacts.map((contact: any) => ({
            type: contact.type,
            value: contact.value,
          })) : []
        }
      },
      include: { contacts: true }
    });

    return c.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
};