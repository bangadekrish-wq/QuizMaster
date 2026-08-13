import { Router } from 'express';
import { getAdminDashboardData, getStudentDashboardData } from '../controllers/analyticsController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/admin-dashboard', requireAdmin, getAdminDashboardData);
router.get('/full', requireAdmin, getAdminDashboardData);
router.get('/student', getStudentDashboardData);

export default router;
