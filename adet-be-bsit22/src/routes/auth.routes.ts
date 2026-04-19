import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema, verifySchema, resendSchema, forgotPasswordSchema, resetPasswordSchema } from '../lib/validation';
import { sendOTPEmail, sendPasswordResetEmail } from '../lib/mail.service';
import { containsInappropriateContent } from '../lib/moderation';
import crypto from 'crypto';

const auth = new Hono();

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // 1. Check if user exists (Loophole Fix: Use generic message to prevent enumeration)
    const genericError = 'Invalid email or password';
    
    if (!user) {
      // Still perform a dummy hash comparison to prevent timing attacks
      bcrypt.compareSync(password, '$2a$10$75cbdc1eb7150937890ad5465d861175c6624711'); 
      return c.json({ message: genericError }, 401);
    }

    // 2. Check password
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json({ message: genericError }, 401);
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
    const { email, password, displayName, phone } = c.req.valid('json');

    // ── Moderation Check ───────────────────────────────────────────
    if (containsInappropriateContent(displayName)) {
      return c.json({ message: 'Scholarly Integrity Violation: The requested display name contains inappropriate content prohibited by HUB standards.' }, 400);
    }
    
    const emailLower = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    
    // Loophole Fix: If user exists, act like we sent a code to prevent enumeration
    if (existing) {
      return c.json({ 
        message: 'Registration successful. Verification code sent.',
        email: emailLower
      }, 201);
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const verificationToken = crypto.randomInt(100000, 999999).toString();
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
        verificationExpiresAt: expiresAt,
        verificationLastSent: new Date(),
        contacts: phone ? {
          create: {
            type: 'phone',
            value: phone
          }
        } : undefined
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
    return c.json({ message: 'Internal server error during registration' }, 500);
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

    // Loophole Fix: Brute force protection (Max 5 attempts)
    if (user.verificationAttempts >= 5) {
      return c.json({ message: 'Too many failed attempts. Please request a new code.' }, 403);
    }

    if (user.verificationToken !== code) {
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationAttempts: { increment: 1 } }
      });
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
        verificationExpiresAt: null,
        verificationAttempts: 0
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

    // Loophole Fix: Rate limiting (Wait 2 minutes between resends)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (user.verificationLastSent && user.verificationLastSent > twoMinutesAgo) {
      return c.json({ message: 'Please wait before requesting a new code.' }, 429);
    }

    const verificationToken = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        verificationToken, 
        verificationExpiresAt: expiresAt,
        verificationAttempts: 0, // Reset attempts on resend
        verificationLastSent: new Date()
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
    const emailLower = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    const genericMsg = 'If this email is registered, a reset link has been dispatched.';

    // Institutional Security: Silent Admin Block (Prevents User Enumeration)
    // If the user genuinely is an admin, we SILENTLY return the generic success message
    // without actually dispatching the Postmark email. This prevents attackers from 
    // confirming which emails belong to administrative staff.
    if (user && user.role === 'admin') {
      return c.json({ message: genericMsg });
    }

    // For security, always return success even if email doesn't exist
    if (!user) return c.json({ message: genericMsg });

    // Generate a secure restoration token instead of a 6-digit code for the email link flow
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(emailLower)}`;

    await sendPasswordResetEmail(email, user.displayName, resetLink);

    return c.json({ message: 'If this email is registered, a reset link has been dispatched.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return c.json({ message: 'System error during archival restoration.' }, 500);
  }
});

// POST /api/auth/reset-password
auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  try {
    const { email, token, password } = c.req.valid('json');

    // Scoped Restoration: Find the user first to link the restoration code
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return c.json({ message: 'Invalid or expired restoration token.' }, 400);
    }

    // Lookup token restricted to this specific user
    const resetRequest = await prisma.passwordReset.findFirst({
      where: { 
        token,
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRequest) {
      return c.json({ message: 'Invalid or expired restoration token.' }, 400);
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    // Atomic update: Set new password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
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