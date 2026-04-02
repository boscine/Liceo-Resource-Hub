import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
}

export type AuthVariables = {
  userId: number;
};

export const verifyToken = async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const secret = process.env.JWT_SECRET;

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ message: 'No token provided' }, 403);
  }

  if (!secret) {
    console.error('JWT_SECRET is not defined in .env');
    return c.json({ message: 'Internal Server Error' }, 500);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    c.set('userId', decoded.id);
    await next();
  } catch (err) {
    return c.json({ message: 'Unauthorized' }, 401);
  }
};