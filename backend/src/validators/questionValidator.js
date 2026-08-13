import { z } from 'zod';

export const createQuestionSchema = z.object({
  body: z.object({
    text: z.string().min(3, 'Question text required').optional(),
    questionText: z.string().min(3, 'Question text required').optional(),
    marks: z.coerce.number().min(1, 'Marks must be at least 1').default(1),
    explanation: z.string().nullable().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'Easy', 'Medium', 'Hard']).optional().default('MEDIUM'),
    type: z.string().optional().default('MULTIPLE_CHOICE'),
    questionType: z.string().optional(),
    options: z.array(
      z.object({
        text: z.string().optional(),
        optionText: z.string().optional(),
        isCorrect: z.boolean().default(false),
      })
    ).min(2, 'At least two options are required'),
  }),
});
