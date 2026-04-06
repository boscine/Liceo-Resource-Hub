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
    const body = await c.req.json();
    let { displayName, contacts, college } = body;
    
    // ── Input Sanitization ──────────────────────────────────────────────────
    displayName = (displayName || '').trim();
    college = (college || '').trim();

    if (!displayName || displayName.length < 2) {
      return c.json({ message: 'A valid display name (min 2 chars) is required' }, 400);
    }

    if (displayName.length > 50) {
      return c.json({ message: 'Display name is too long (max 50 characters)' }, 400);
    }

    if (college && college.length > 100) {
      return c.json({ message: 'College name is too long (max 100 characters)' }, 400);
    }

    // ── Validate Contacts ────────────────────────────────────────────────────
    const refinedContacts = [];
    if (contacts && Array.isArray(contacts)) {
      const validTypes = ['messenger', 'phone', 'other'];
      for (const contact of contacts) {
        if (!validTypes.includes(contact.type)) {
          return c.json({ message: `Invalid contact type: ${contact.type}` }, 400);
        }
        const val = contact.value?.trim();
        if (!val || val === '') {
           return c.json({ message: `A value is required for ${contact.type}` }, 400);
        }
        if (val.length > 255) {
          return c.json({ message: `Contact value for ${contact.type} is too long` }, 400);
        }
        refinedContacts.push({ type: contact.type, value: val });
      }
    }

    // ── Database Update ─────────────────────────────────────────────────────
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        displayName,
        college: college || null,
        contacts: {
          deleteMany: {},
          create: refinedContacts
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
        college: updatedUser.college,
        contacts: updatedUser.contacts
      }
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
};