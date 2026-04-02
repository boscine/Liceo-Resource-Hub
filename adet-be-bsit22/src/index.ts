import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';
import authRoutes from './routes/auth.routes';
import apiRoutes from './routes/api.routes';
import { verifyToken, AuthVariables } from './middleware/auth.middleware';

const app = new Hono<{ Variables: AuthVariables }>();

// 1. Global Middleware
app.use('*', cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// 2. Public Authentication Routes
app.route('/api/auth', authRoutes);

// 3. Protected API Routes
// Middleware runs only for these routes
app.use('/api/v1/*', verifyToken);
app.route('/api/v1', apiRoutes);

serve({ fetch: app.fetch, port: 3000 }, () =>
  console.log('Liceo Resource Hub API → http://localhost:3000')
);