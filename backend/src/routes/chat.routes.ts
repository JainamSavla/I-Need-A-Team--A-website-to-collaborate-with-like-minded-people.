import { Hono } from 'hono';
import * as directMessageController from '../controllers/directMessageController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const chatRoutes = new Hono();

chatRoutes.get('/direct/:userId', authMiddleware, directMessageController.getDirectMessages);
chatRoutes.post('/direct/:userId', authMiddleware, directMessageController.sendDirectMessage);
chatRoutes.get('/conversations', authMiddleware, directMessageController.getConversations);

export default chatRoutes;
