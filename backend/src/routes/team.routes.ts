import { Hono } from 'hono';
import * as teamController from '../controllers/teamController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const teamRoutes = new Hono();

teamRoutes.get('/', authMiddleware, teamController.getMyTeams);
teamRoutes.get('/:id/members', authMiddleware, teamController.getTeamMembers);
teamRoutes.get('/:id/chat', authMiddleware, teamController.getTeamMessages);
teamRoutes.post('/:id/chat', authMiddleware, teamController.sendMessage);

export default teamRoutes;
