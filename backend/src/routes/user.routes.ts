import { Hono } from 'hono';
import * as userController from '../controllers/userController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const userRoutes = new Hono();

userRoutes.get('/me/applications', authMiddleware, userController.getUserApplications);
userRoutes.get('/:id', userController.getUserProfile);
userRoutes.patch('/me', authMiddleware, userController.updateMe);

export default userRoutes;
