import { Router } from 'express';
import multer from 'multer';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  importExcelQuestions,
  downloadExcelTemplate,
} from '../controllers/quizController.js';
import { getQuestionsByQuizId, createQuestion } from '../controllers/questionController.js';
import { startQuiz, submitQuiz } from '../controllers/attemptController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();

// Public & Authenticated Quizzes
router.get('/', getQuizzes);
router.get('/excel-template', downloadExcelTemplate);
router.get('/:id', getQuizById);

// Admin Quiz CRUD & Excel Import
router.post('/', authenticate, requireAdmin, upload.single('excelFile'), createQuiz);
router.put('/:id', authenticate, requireAdmin, updateQuiz);
router.delete('/:id', authenticate, requireAdmin, deleteQuiz);
router.patch('/:id/publish', authenticate, requireAdmin, publishQuiz);
router.post('/:quizId/import-excel', authenticate, requireAdmin, upload.single('excelFile'), importExcelQuestions);

// Question Management under Quiz
router.get('/:quizId/questions', authenticate, getQuestionsByQuizId);
router.post('/:quizId/questions', authenticate, requireAdmin, createQuestion);

// Quiz Execution & Attempt APIs (Accessible to all authenticated users)
router.post('/:quizId/start', authenticate, startQuiz);
router.post('/:quizId/submit', authenticate, submitQuiz);

export default router;
