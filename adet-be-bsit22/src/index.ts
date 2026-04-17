import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes';
import apiRoutes from './routes/api/index';
import { verifyToken, AuthVariables } from './middleware/auth.middleware';

const app = new Hono<{ Variables: AuthVariables }>();

// 1. Global Middleware
const origin = process.env.FRONTEND_URL || 'http://localhost:4200';
app.use('*', cors({ 
  origin: origin,
  credentials: true 
}));

// 1.1 Serve Static Files (Post Images)
app.use('/api/uploads/*', serveStatic({ root: './public' }));

// 2. Public Authentication Routes
app.route('/api/auth', authRoutes);

// 3. Protected API Routes
// Middleware runs only for these routes
app.use('/api/v1/*', verifyToken); 
app.route('/api/v1', apiRoutes); 

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port: port }, () =>
  console.log(`Liceo Resource Hub API → http://localhost:${port}`)
);;