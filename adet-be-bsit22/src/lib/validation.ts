import { z } from 'zod';

// ── Auth Schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid institutional email format.').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid institutional email format.')
    .regex(/^[a-zA-Z0-9._%+-]+@liceo\.edu\.ph$/, 'Only @liceo.edu.ph emails are permitted.')
    .toLowerCase(),
  password: z.string().min(8, 'Scholarly security requires at least 8 characters.'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters.').max(50),
  phone: z.string().min(10, 'Contact number is too short.').max(20)
});

export const verifySchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6, 'Verification code must be exactly 6 digits.')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format.').toLowerCase()
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid institutional email format.').toLowerCase(),
  token: z.string().min(1, 'Token is required.'),
  password: z.string().min(8, 'Scholarly security requires at least 8 characters.')
});

// ── API Schemas ─────────────────────────────────────────────────────────────

export const postSchema = z.object({
  title: z.string().min(3, 'Title is too short.').max(255, 'Title exceeds institutional archive limits (255 chars).'),
  categoryId: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().int().positive('Invalid category selected.')),
  description: z.string().min(10, 'Please provide a more detailed scholarly description.').max(500),
  imageUrl: z.string().optional().refine(val => !val || val.trim() === '' || /^https?:\/\//.test(val) || /^\/api\/uploads\//.test(val), { message: 'Invalid image URL format.' })
});

export const updatePostSchema = postSchema.partial().extend({
  status: z.enum(['open', 'fulfilled', 'closed', 'removed']).optional(),
  isFlagged: z.boolean().optional(),
  moderationReason: z.string().max(255).optional()
});

export const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters.').max(50),
  password: z.string().min(8, 'Scholarly security requires at least 8 characters.').optional().or(z.literal('')),
  contacts: z.array(z.object({
    type: z.enum(['messenger', 'phone', 'telegram', 'whatsapp', 'instagram', 'viber', 'other']),
    value: z.string().min(1, 'Contact value cannot be empty.').max(255)
  })).max(5, 'Maximum of 5 contact methods allowed.')
});
export const reportSchema = z.object({
  reason: z.enum(['inappropriate', 'spam', 'misleading', 'not_educational', 'duplicate', 'fake_contact', 'other']),
  details: z.string().max(500).optional()
});
