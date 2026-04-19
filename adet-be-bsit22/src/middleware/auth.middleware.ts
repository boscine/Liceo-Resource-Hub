import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export type AuthVariables = {
  userId?: number;
  role?: string;
};

/**
 * Institutional Authentication Middleware
 * 
 * ARCHITECTURE:
 * - Layer 1 (Transport): Intercepts Bearer tokens from the Authorization header.
 * - Layer 2 (Verification): Decodes JWT using the Liceo-proprietary RSA/HS256 secret.
 * - Layer 3 (Database Sync): Performs a real-time check of the user status (Active vs. Suspended).
 * - Layer 4 (Role Injection): Securely attaches the userId and role to the Hono context.
 */
export const authenticate = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    // Check if this route is explicitly allowed to be public
    // By default, we now block if verifyToken is applied but no token is provided.
    return c.json({ message: 'Authorization required. Please log in.' }, 401);
  }

  try {
    const token = authHeader.slice(7);
    if (!token) {
      return c.json({ message: 'Invalid token format.' }, 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const validUserId = Number(payload.id || payload.userId);
    
    if (isNaN(validUserId)) {
      return c.json({ message: 'Invalid token payload.' }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: validUserId },
      select: { status: true, role: true }
    });

    if (!user) {
      return c.json({ message: 'User not found.' }, 401);
    }

    if (user.status === 'active') {
      c.set('userId', validUserId);
      c.set('role', user.role); // Use database role for extra security
      await next();
    } else {
      // Institutional Security: Return 403 for restricted accounts
      return c.json({ 
        message: `Institutional Access Restricted: Your account status is currently ${user.status.toUpperCase()}.`,
        status: user.status 
      }, 403);
    }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return c.json({ message: 'Session expired. Please log in again.' }, 401);
    }
    return c.json({ message: 'Invalid token.' }, 401);
  }
};

export const adminOnly = async (c: Context, next: Next) => {
  if (c.get('role') !== 'admin') {
    return c.json({ message: 'Forbidden' }, 403);
  }
  await next();
};

/**
 * Allows the request to proceed even without a token.
 * If a token is provided and valid, it sets the userId and role if the user is active.
 */
export const publicAccess = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const validUserId = Number(payload.id || payload.userId);
        
        if (!isNaN(validUserId)) {
          // Extra security: Verify user status even for public routes if token is present
          const user = await prisma.user.findUnique({
            where: { id: validUserId },
            select: { status: true, role: true }
          });

          if (user && user.status === 'active') {
            c.set('userId', validUserId);
            c.set('role', user.role);
          }
        }
      }
    } catch (error) {
      // Ignore errors for public routes, just don't set user context
    }
  }
  await next();
};

// Alias for use in index.ts route protection
export const verifyToken = authenticate;