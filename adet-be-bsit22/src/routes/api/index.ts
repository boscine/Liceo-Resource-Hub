import { Hono } from 'hono';
import { AuthVariables } from '../../middleware/auth.middleware';
import postsRoutes from './posts.routes';
import adminRoutes from './admin.routes';
import profileRoutes from './profile.routes';
import notificationsRoutes from './notifications.routes';
import categoriesRoutes from './categories.routes';
import uploadRoutes from './upload.routes';

const api = new Hono<{ Variables: AuthVariables }>();

api.route('/posts', postsRoutes);
api.route('/admin', adminRoutes);
api.route('/profile', profileRoutes);
api.route('/notifications', notificationsRoutes);
api.route('/categories', categoriesRoutes);
api.route('/upload', uploadRoutes);

export default api;
