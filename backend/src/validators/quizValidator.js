import { z } from 'zod';

export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(5, 'Description is required'),
    category_id: z.string().uuid('Valid Category ID is required').optional(),
    category: z.string().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'Easy', 'Medium', 'Hard']).default('MEDIUM'),
    duration_minutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
    duration: z.coerce.number().optional(),
    passing_score: z.coerce.number().min(0).max(100).optional().default(70),
    passingPercentage: z.coerce.number().optional(),
    max_attempts: z.coerce.number().min(1).optional().default(3),
    maxAttempts: z.coerce.number().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'Draft', 'Published', 'Unpublished']).optional().default('DRAFT'),
    thumbnail_url: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
  }),
});
