import { Context } from 'hono';
import prisma from '../client'; // This points to your src/client.ts

export const getProfile = async (c: Context) => {
  // Get the ID from your verifyToken middleware
  const userId = c.get('jwtPayload')?.id; 

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
        status: true
      },
    });

    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
};