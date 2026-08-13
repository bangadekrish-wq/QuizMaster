import { Router } from 'express';
import { updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
