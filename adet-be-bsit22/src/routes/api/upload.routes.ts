import { Hono } from 'hono';
import { AuthVariables } from '../../middleware/auth.middleware';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomBytes } from 'node:crypto';

const router = new Hono<{ Variables: AuthVariables }>();

// ── POST /api/v1/upload (Direct Image Upload) ────────────────────────────────
router.post('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ message: 'Unauthorized' }, 401);

  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || typeof file === 'string') {
      return c.json({ message: 'No file provided.' }, 400);
    }

    // ── Validation ────────────────────────────────────────────────────────────
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json({ message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are permitted.' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE_BYTES) {
      return c.json({ message: 'File exceeds the 5MB institutional archive limit.' }, 400);
    }

    // ── Persistence ───────────────────────────────────────────────────────────
    const ext = extname(file.name) || '.jpg';
    const uniqueName = `${randomBytes(16).toString('hex')}${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'api', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, uniqueName), Buffer.from(arrayBuffer));

    return c.json({ url: `/api/uploads/${uniqueName}` }, 201);
  } catch (error) {
    console.error('Upload failed:', error);
    return c.json({ message: 'Internal server error during upload.' }, 500);
  }
});

export default router;
