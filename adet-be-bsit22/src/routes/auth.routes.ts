import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema, verifySchema, forgotPasswordSchema, resetPasswordSchema } from '../lib/validation';
import { sendOTPEmail, sendPasswordResetEmail } from '../lib/mail.service';
import crypto from 'crypto';

const auth = new Hono();

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');

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
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { email, password, displayName } = c.req.valid('json');

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

    // Dispatch the academic access code via the mail service
    await sendOTPEmail(emailLower, verificationToken);

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
auth.post('/verify', zValidator('json', verifySchema), async (c) => {
  try {
    const { email, code } = c.req.valid('json');

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

// POST /api/auth/resend-verify (Renamed from resend-code to match frontend service)
auth.post('/resend-verify', async (c) => {
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

    // Dispatch the fresh academic access code via the mail service
    await sendOTPEmail(emailLower, verificationToken);

    return c.json({ message: 'A fresh access code has been dispatched.' });
  } catch (error) {
    console.error('Resend Error:', error);
    return c.json({ message: 'Failed to resend code' }, 500);
  }
});

// POST /api/auth/forgot-password
auth.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  try {
    const { email } = c.req.valid('json');
    const user = await prisma.user.findUnique({ where: { email } });

    // For security, always return success even if email doesn't exist
    if (!user) return c.json({ message: 'If this email is registered, a reset link has been dispatched.' });

    // Institutional Security: Exclude admins from self-service archival restoration
    if (user.role === 'admin') {
      return c.json({ message: 'Administrative credentials must be restored by the System Custodian.' }, 403);
    }

    // Generate a 6-digit scholarly restoration code instead of a hex token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: verificationCode, // Reuse the token field for the OTP
        expiresAt
      }
    });

    await sendPasswordResetEmail(email, verificationCode);

    return c.json({ message: 'If this email is registered, a reset link has been dispatched.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return c.json({ message: 'System error during archival restoration.' }, 500);
  }
});

// POST /api/auth/reset-password
auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  try {
    const { token, password } = c.req.valid('json');

    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRequest || resetRequest.usedAt || resetRequest.expiresAt < new Date()) {
      return c.json({ message: 'Invalid or expired restoration token.' }, 400);
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    // Atomic update: Set new password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash }
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() }
      })
    ]);

    return c.json({ message: 'Credentials restored successfully. You may now log in.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return c.json({ message: 'System error during credential restoration.' }, 500);
  }
});

export default auth;