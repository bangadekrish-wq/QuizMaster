import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import { getAdminDashboardData, getStudentDashboardData } from './controllers/analyticsController.js';
import { authenticate, requireAdmin } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

app.use(helmet());

// CORS Configuration
const rawFrontendUrl = process.env.FRONTEND_URL || '';
const cleanFrontendUrl = rawFrontendUrl.trim().replace(/\/+$/, '');

const staticAllowedOrigins = [
  cleanFrontendUrl,
  'https://quiz-master-green-six.vercel.app',
  'https://quizmaster-7ot7.onrender.com',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      // Check if origin matches allowed origins, localhost, or Vercel quiz-master project domains
      const isAllowed =
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin) ||
        staticAllowedOrigins.some((allowed) => allowed === normalizedOrigin) ||
        /^https:\/\/quiz-master(-[a-z0-9-]+)?\.vercel\.app$/.test(normalizedOrigin) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(normalizedOrigin);

      if (isAllowed) {
        callback(null, true);
      } else {
        // Return callback(null, false) so cors middleware omits CORS headers without throwing an Express 500 error
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Root API Endpoint
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'QuizMaster API is running',
    version: '1.0.0',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'QuizMaster API is running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Direct Dashboard endpoints
app.get('/api/student/dashboard', authenticate, getStudentDashboardData);
app.get('/api/admin/dashboard', authenticate, requireAdmin, getAdminDashboardData);

// 404 Handler
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// Centralized Error Middleware
app.use(errorMiddleware);

export default app;
