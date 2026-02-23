import { Hono } from 'hono';
import * as applicationController from '../controllers/applicationController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const applicationRoutes = new Hono();

applicationRoutes.post('/openings/:id/apply', authMiddleware, applicationController.applyToOpening);
applicationRoutes.get('/openings/:id/applications', authMiddleware, applicationController.getApplicationsForOpening);
applicationRoutes.patch('/applications/:id/status', authMiddleware, applicationController.updateApplicationStatus);

export default applicationRoutes;
