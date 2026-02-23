import { errorHandler } from './middlewares/error.ts';
import ApiError from './utils/ApiError.ts';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

import authRoutes from './routes/auth.routes.ts';
import openingRoutes from './routes/opening.routes.ts';
import teamRoutes from './routes/team.routes.ts';
import applicationRoutes from './routes/application.routes.ts';
import userRoutes from './routes/user.routes.ts';
import chatRoutes from './routes/chat.routes.ts';

const app = new Hono();

// set security HTTP headers only in production
if (process.env.NODE_ENV === 'production') app.use(secureHeaders());

// Note: compress() middleware is intentionally NOT used as it blocks streaming responses
// If you need compression for non-streaming routes, apply it selectively per route

// enable cors
app.use(cors());

app.get('/', c => {
    return c.text('Server is up and running');
});

app.get('/version.json', c => {
    return c.json({ version: parseInt(process.env.VERSION || '0') });
});

app.get('/health', c => {
    return c.text('OK');
});

// Mount routes
app.route('/auth', authRoutes);
app.route('/openings', openingRoutes);
app.route('/applications', applicationRoutes);
app.route('/users', userRoutes);
app.route('/teams', teamRoutes);
app.route('/chat', chatRoutes);

// send back a 404 error for any unknown api request
app.notFound(() => {
    throw new ApiError(404, 'Not found');
});

// handle error
app.onError((err, c) => {
    return errorHandler(err, c);
});

export default app;
