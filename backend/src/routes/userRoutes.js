import { Router } from 'express';
import { getUsers, getUserById, updateUserStatus, deleteUser, updateProfile } from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.put('/profile', updateProfile);

router.get('/', requireAdmin, getUsers);
router.get('/:id', requireAdmin, getUserById);
router.patch('/:id/status', requireAdmin, updateUserStatus);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
