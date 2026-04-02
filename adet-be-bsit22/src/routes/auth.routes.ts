import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

const auth = new Hono();

// POST /api/auth/login
 
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // 1. Check if user exists
  if (!user) {
    // Helpful but less secure:
    return c.json({ message: 'No account found with this email' }, 401);
  }

  // 2. Check password
  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return c.json({ message: 'Incorrect password' }, 401);
  }
  if (user.status !== 'active') {
    return c.json({ message: 'Account is restricted' }, 403);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, display_name: user.displayName, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );

  return c.json({ token, role: user.role });
});

// POST /api/auth/register
auth.post('/register', async (c) => {
  const { email, password, displayName } = await c.req.json();

  if (!email.endsWith('@liceo.edu.ph')) {
    return c.json({ message: 'Only @liceo.edu.ph emails allowed' }, 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return c.json({ message: 'Email already registered' }, 409);

  const passwordHash = bcrypt.hashSync(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, displayName, role: 'student', status: 'active' },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, display_name: user.displayName, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );

  return c.json({ token }, 201);
});

export default auth;