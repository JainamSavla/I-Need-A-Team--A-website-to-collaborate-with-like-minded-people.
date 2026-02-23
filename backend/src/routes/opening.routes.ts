import { Hono } from 'hono';
import * as openingController from '../controllers/openingController.ts';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/authMiddleware.ts';

const openingRoutes = new Hono();

openingRoutes.get('/', optionalAuthMiddleware, openingController.getOpenings);
openingRoutes.get('/:id', optionalAuthMiddleware, openingController.getOpeningById);
openingRoutes.post('/', authMiddleware, openingController.createOpening);
openingRoutes.patch('/:id', authMiddleware, openingController.updateOpening);
openingRoutes.delete('/:id', authMiddleware, openingController.deleteOpening);

export default openingRoutes;
