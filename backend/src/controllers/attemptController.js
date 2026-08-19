import { db } from '../config/db.js';
import { calculateAttemptScore } from '../services/scoringService.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

export const startQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    // 1. Fetch Quiz
    const { data: quiz, error: qErr } = await db
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (qErr || !quiz) {
      return errorResponse(res, 'Quiz not found', 'QUIZ_NOT_FOUND', 404);
    }

    if (quiz.status !== 'PUBLISHED') {
      return errorResponse(res, 'Quiz is not currently available for taking', 'QUIZ_UNAVAILABLE', 403);
    }

    // 2. Check for an Active, Non-Expired IN_PROGRESS Attempt First (Session Reuse)
    const { data: activeAttempt } = await db
      .from('attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .eq('status', 'IN_PROGRESS')
      .gt('expires_at', new Date().toISOString())
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let attempt = activeAttempt;

    if (!attempt) {
      // 3. Check Maximum Completed Attempts Limit
      const { count: completedCount } = await db
        .from('attempts')
        .select('id', { count: 'exact', head: true })
        .eq('quiz_id', quizId)
        .eq('user_id', userId)
        .eq('status', 'COMPLETED');

      if (completedCount && completedCount >= quiz.max_attempts) {
        return errorResponse(
          res,
          `Maximum attempt limit reached (${quiz.max_attempts} attempts allowed)`,
          'MAX_ATTEMPTS_REACHED',
          400
        );
      }

      // 4. Calculate Started At and Expires At
      const startedAt = new Date();
      const durationMinutes = quiz.duration_minutes || 20;
      const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

      // Create new attempt record
      const { data: newAttempt, error: aErr } = await db
        .from('attempts')
        .insert([
          {
            quiz_id: quizId,
            user_id: userId,
            status: 'IN_PROGRESS',
            started_at: startedAt.toISOString(),
            expires_at: expiresAt.toISOString(),
          },
        ])
        .select()
        .single();

      if (aErr || !newAttempt) {
        return errorResponse(res, 'Failed to initialize quiz attempt session', 'ATTEMPT_CREATION_FAILED', 500);
      }
      attempt = newAttempt;
    }

    // 5. Fetch Questions & Options WITHOUT is_correct
    const { data: questions, error: questErr } = await db
      .from('questions')
      .select('id, question_text, marks, difficulty, question_type, options(id, option_text)')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });

    if (questErr) {
      return errorResponse(res, 'Failed to load assessment question set', 'DATABASE_ERROR', 500);
    }

    if (!questions || questions.length === 0) {
      return errorResponse(res, 'This quiz has no questions available', 'QUIZ_HAS_NO_QUESTIONS', 400);
    }

    const sanitizedQuestions = (questions || []).map((q) => ({
      id: q.id,
      text: q.question_text,
      marks: q.marks,
      difficulty: q.difficulty === 'EASY' ? 'Easy' : q.difficulty === 'HARD' ? 'Hard' : 'Medium',
      options: (q.options || []).map((opt) => ({
        id: opt.id,
        text: opt.option_text,
      })),
    }));

    return successResponse(
      res,
      {
        attemptId: attempt.id,
        quizId: quiz.id,
        quizTitle: quiz.title,
        startedAt: attempt.started_at,
        expiresAt: attempt.expires_at,
        durationMinutes: quiz.duration_minutes,
        questions: sanitizedQuestions,
      },
      'Quiz attempt initialized successfully',
      200
    );
  } catch (err) {
    next(err);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { attemptId, answers } = req.body;
    const userId = req.user.id;

    if (!attemptId) {
      return errorResponse(res, 'Attempt ID is required for submission', 'VALIDATION_ERROR', 400);
    }

    const result = await calculateAttemptScore(attemptId, answers, userId);
    return successResponse(res, result, 'Quiz attempt evaluated successfully');
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.message, err.code, err.statusCode);
    }
    next(err);
  }
};

export const getAttempts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'All';

    let query = db
      .from('attempts')
      .select('*, users(name, email), quizzes(title, category_id, categories(name))', { count: 'exact' });

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    if (status && status !== 'All') {
      if (status === 'Passed' || status === 'Failed') {
        // Handled via filter
      } else {
        query = query.eq('status', status.toUpperCase());
      }
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('started_at', { ascending: false });

    const { data: attempts, count, error } = await query;
    if (error) throw error;

    let formatted = (attempts || []).map((a) => {
      const isPassed = Number(a.percentage) >= 70;
      return {
        id: a.id,
        studentName: a.users?.name || 'Student',
        studentEmail: a.users?.email || '',
        studentId: a.user_id,
        quizId: a.quiz_id,
        quizTitle: a.quizzes?.title || 'Assessment',
        category: a.quizzes?.categories?.name || 'General',
        date: a.completed_at || a.started_at,
        score: a.score || 0,
        totalMarks: a.total_marks || 25,
        percentage: Number(a.percentage) || 0,
        status: isPassed ? 'Passed' : 'Failed',
        timeTaken: a.time_taken_seconds || 0,
      };
    });

    if (search) {
      const q = search.toLowerCase();
      formatted = formatted.filter(
        (a) => a.studentName.toLowerCase().includes(q) || a.quizTitle.toLowerCase().includes(q)
      );
    }

    if (status === 'Passed' || status === 'Failed') {
      formatted = formatted.filter((a) => a.status === status);
    }

    return paginatedResponse(res, formatted, { page, limit, total: count || 0 });
  } catch (err) {
    next(err);
  }
};

export const getAttemptResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const { data: attempt, error } = await db
      .from('attempts')
      .select('*, users(name, email), quizzes(title, category_id, categories(name))')
      .eq('id', id)
      .single();

    if (error || !attempt) {
      return errorResponse(res, 'Attempt record not found', 'ATTEMPT_NOT_FOUND', 404);
    }

    if (!isAdmin && attempt.user_id !== userId) {
      return errorResponse(res, 'Forbidden: You cannot view another student\'s attempt', 'FORBIDDEN', 403);
    }

    // Fetch Answers & Questions Breakdown for Review
    const { data: answers } = await db
      .from('answers')
      .select('*, questions(*, options(*)), options(*)')
      .eq('attempt_id', id);

    const review = (answers || []).map((ans) => {
      const correctOpt = ans.questions?.options?.find((opt) => opt.is_correct);
      return {
        questionId: ans.question_id,
        text: ans.questions?.question_text || 'Question',
        studentAnswer: ans.options ? ans.options.option_text : 'Not Answered',
        correctAnswer: correctOpt ? correctOpt.option_text : 'N/A',
        explanation: ans.questions?.explanation || '',
        isCorrect: ans.is_correct,
      };
    });

    const percentage = Number(attempt.percentage) || 0;
    const isPassed = percentage >= (attempt.quizzes?.passing_score || 70);

    return successResponse(
      res,
      {
        id: attempt.id,
        quizId: attempt.quiz_id,
        quizTitle: attempt.quizzes?.title || 'Assessment',
        studentName: attempt.users?.name,
        date: attempt.completed_at || attempt.started_at,
        score: attempt.score || 0,
        totalMarks: attempt.total_marks || 25,
        percentage,
        status: isPassed ? 'Passed' : 'Failed',
        timeTaken: attempt.time_taken_seconds || 0,
        correctCount: attempt.correct_answers || 0,
        incorrectCount: attempt.incorrect_answers || 0,
        unansweredCount: attempt.unanswered || 0,
        review,
      },
      'Attempt result retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};
