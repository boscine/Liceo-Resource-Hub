import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

const auth = new Hono();

// POST /api/auth/login
 
// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ message: 'Email and password are required' }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // 1. Check if user exists
    if (!user) {
      return c.json({ message: 'No account found with this email' }, 401);
    }

    // 2. Check password FIRST before revealing account status
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json({ message: 'Incorrect password' }, 401);
    }

    // 3. Inform of pending verification ONLY if credentials are correct
    if (user.status === 'pending') {
      return c.json({ 
        message: 'Account pending verification. Please check your email.', 
        pending: true,
        email: user.email 
      }, 403);
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
  } catch (error) {
    console.error('Login Error:', error);
    return c.json({ message: 'Internal server error during login' }, 500);
  }
});

// POST /api/auth/register
auth.post('/register', async (c) => {
  try {
    const { email, password, displayName } = await c.req.json();

    if (!email || !password || !displayName) {
      return c.json({ message: 'All fields are required' }, 400);
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@liceo\.edu\.ph$/;
    if (!emailRegex.test(email)) {
      return c.json({ message: 'Only @liceo.edu.ph emails allowed' }, 400);
    }

    const emailLower = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) return c.json({ message: 'Email already registered' }, 409);

    const passwordHash = bcrypt.hashSync(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2); // 2 hours expiry

    const user = await prisma.user.create({
      data: { 
        email: emailLower, 
        passwordHash, 
        displayName, 
        role: 'student', 
        status: 'pending',
        verificationToken,
        verificationExpiresAt: expiresAt
      },
    });

    // In a real app, this would be an email. For now, log to console for dev.
    console.log(`\n\n[DEV] Verification code for ${emailLower}: ${verificationToken}\n\n`);

    return c.json({ 
      message: 'Registration successful. Verification code sent.',
      email: user.email
    }, 201);
  } catch (error) {
    console.error('Registration Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ message: 'Internal server error during registration', detail: msg }, 500);
  }
});

// POST /api/auth/verify
auth.post('/verify', async (c) => {
  try {
    const { email, code } = await c.req.json();
    if (!email || !code) return c.json({ message: 'Email and code required' }, 400);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || user.status !== 'pending') {
      return c.json({ message: 'Invalid verification request' }, 400);
    }

    if (user.verificationToken !== code) {
      return c.json({ message: 'Incorrect verification code' }, 400);
    }

    if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
      return c.json({ message: 'Verification code expired' }, 400);
    }

    // Activate the user
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        status: 'active',
        verificationToken: null,
        verificationExpiresAt: null
      }
    });

    // Sign a token for immediate login after verification
    const token = jwt.sign(
      { id: user.id, email: user.email, display_name: user.displayName, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return c.json({
      message: 'Account verified successfully!',
      token,
      role: user.role
    });
  } catch (error) {
    return c.json({ message: 'Verification failed' }, 500);
  }
});

// POST /api/auth/resend-code
auth.post('/resend-code', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ message: 'Email required' }, 400);

    const emailLower = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    if (!user || user.status !== 'pending') {
      return c.json({ message: 'Resend not applicable' }, 400);
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        verificationToken, 
        verificationExpiresAt: expiresAt 
      }
    });

    console.log(`\n\n[DEV] NEW Verification code for ${emailLower}: ${verificationToken}\n\n`);

    return c.json({ message: 'A fresh access code has been dispatched.' });
  } catch (error) {
    console.error('Resend Error:', error);
    return c.json({ message: 'Failed to resend code' }, 500);
  }
});

export default auth;