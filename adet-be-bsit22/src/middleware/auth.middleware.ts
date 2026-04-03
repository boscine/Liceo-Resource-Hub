import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

export type AuthVariables = {
  userId: number;
  role: string;
};

export const authenticate = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET!) as any;
    console.log(`[AuthMiddleware] Decoded payload:`, payload); // Debug payload

    // Support both id and userId depending on how old the token is
    const validUserId = payload.id || payload.userId;
    c.set('userId', validUserId);
    c.set('role', payload.role);
    await next();
  } catch (error) {
    console.error(`[AuthMiddleware] JWT Verification Failed!`, error);
    return c.json({ message: 'Invalid token' }, 401);
  }
};

export const adminOnly = async (c: Context, next: Next) => {
  if (c.get('role') !== 'admin') {
    return c.json({ message: 'Forbidden' }, 403);
  }
  await next();
};

// Alias for use in index.ts route protection
export const verifyToken = authenticate;