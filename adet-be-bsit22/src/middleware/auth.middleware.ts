import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export type AuthVariables = {
  userId?: number;
  role?: string;
};

export const authenticate = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const validUserId = Number(payload.id || payload.userId);
        
        if (!isNaN(validUserId)) {
          // Institutional Security: Check user status in DB to handle bans/suspensions immediately
          const user = await prisma.user.findUnique({
            where: { id: validUserId },
            select: { status: true }
          });

          if (user && user.status === 'active') {
            c.set('userId', validUserId);
            c.set('role', payload.role);
          } else if (user) {
            // User exists but is not active (suspended/banned/pending)
            console.warn(`[AuthMiddleware] Access denied for user ${validUserId} with status: ${user.status}`);
          }
        }
      }
    } catch (error) {
      console.error(`[AuthMiddleware] JWT Verification Failed!`, error);
    }
  }
  await next();
};

export const adminOnly = async (c: Context, next: Next) => {
  if (c.get('role') !== 'admin') {
    return c.json({ message: 'Forbidden' }, 403);
  }
  await next();
};

// Alias for use in index.ts route protection
export const verifyToken = authenticate;