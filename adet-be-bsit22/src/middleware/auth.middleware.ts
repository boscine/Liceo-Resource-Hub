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
    c.set('userId', payload.userId);
    c.set('role', payload.role);      // ← add this
    await next();
  } catch {
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