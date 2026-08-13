import { Router } from 'express';
import { getAttempts, getAttemptResult } from '../controllers/attemptController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAttempts);
router.get('/:id', getAttemptResult);

export default router;
