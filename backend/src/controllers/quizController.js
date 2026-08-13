import { db } from '../config/db.js';
import { importRandomQuestionsFromExcel, generateExcelTemplateBuffer } from '../services/excelService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getQuizzes = async (req, res, next) => {
  try {
    const { search, category, difficulty, status } = req.query;
    const isStudent = !req.user || req.user.role === 'STUDENT';

    let query = db.from('quizzes').select('*, categories(name)').order('created_at', { ascending: false });

    // Students only see PUBLISHED quizzes
    if (isStudent) {
      query = query.eq('status', 'PUBLISHED');
    } else if (status && status !== 'All') {
      query = query.eq('status', status.toUpperCase());
    }

    if (difficulty && difficulty !== 'All') {
      query = query.eq('difficulty', difficulty.toUpperCase());
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: quizzes, error } = await query;
    if (error) throw error;

    // Filter by Category name if provided
    let filteredQuizzes = quizzes || [];
    if (category && category !== 'All') {
      filteredQuizzes = filteredQuizzes.filter(
        (q) => q.categories?.name === category || q.category === category
      );
    }

    // Enhance each quiz with questionsCount and attemptsCount
    const enhanced = await Promise.all(
      filteredQuizzes.map(async (q) => {
        const [{ count: questionsCount }, { count: attemptsCount }] = await Promise.all([
          db.from('questions').select('id', { count: 'exact', head: true }).eq('quiz_id', q.id),
          db.from('attempts').select('id', { count: 'exact', head: true }).eq('quiz_id', q.id),
        ]);

        return {
          id: q.id,
          title: q.title,
          description: q.description,
          category: q.categories?.name || 'General',
          category_id: q.category_id,
          difficulty: q.difficulty === 'EASY' ? 'Easy' : q.difficulty === 'HARD' ? 'Hard' : 'Medium',
          duration: q.duration_minutes,
          duration_minutes: q.duration_minutes,
          passingPercentage: q.passing_score,
          passing_score: q.passing_score,
          maxAttempts: q.max_attempts,
          max_attempts: q.max_attempts,
          questionsCount: questionsCount || 0,
          attemptsCount: attemptsCount || 0,
          status: q.status === 'PUBLISHED' ? 'Published' : q.status === 'DRAFT' ? 'Draft' : 'Unpublished',
          thumbnail: q.thumbnail_url,
          thumbnail_url: q.thumbnail_url,
          createdAt: q.created_at,
        };
      })
    );

    return successResponse(res, enhanced, 'Quizzes retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: quiz, error } = await db
      .from('quizzes')
      .select('*, categories(name)')
      .eq('id', id)
      .single();

    if (error || !quiz) {
      return errorResponse(res, 'Quiz not found', 'QUIZ_NOT_FOUND', 404);
    }

    const isStudent = !req.user || req.user.role === 'STUDENT';
    if (isStudent && quiz.status !== 'PUBLISHED') {
      return errorResponse(res, 'Quiz is not currently available', 'QUIZ_UNAVAILABLE', 403);
    }

    const [{ count: questionsCount }, { count: userAttemptsCount }] = await Promise.all([
      db.from('questions').select('id', { count: 'exact', head: true }).eq('quiz_id', quiz.id),
      req.user
        ? db
            .from('attempts')
            .select('id', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id)
            .eq('user_id', req.user.id)
        : Promise.resolve({ count: 0 }),
    ]);

    const attemptsRemaining = Math.max(0, (quiz.max_attempts || 3) - (userAttemptsCount || 0));

    return successResponse(
      res,
      {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.categories?.name || 'General',
        category_id: quiz.category_id,
        difficulty: quiz.difficulty === 'EASY' ? 'Easy' : quiz.difficulty === 'HARD' ? 'Hard' : 'Medium',
        duration: quiz.duration_minutes,
        duration_minutes: quiz.duration_minutes,
        passingPercentage: quiz.passing_score,
        passing_score: quiz.passing_score,
        maxAttempts: quiz.max_attempts,
        max_attempts: quiz.max_attempts,
        questionsCount: questionsCount || 0,
        attemptsRemaining,
        status: quiz.status === 'PUBLISHED' ? 'Published' : quiz.status === 'DRAFT' ? 'Draft' : 'Unpublished',
        thumbnail: quiz.thumbnail_url,
        thumbnail_url: quiz.thumbnail_url,
        instructions: [
          'Timer starts immediately once you click Start Quiz.',
          'The quiz will automatically submit when the duration timer reaches 00:00.',
          'Answers are saved during the attempt.',
          'Maximum attempts apply.',
        ],
      },
      'Quiz details retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category_id,
      category,
      difficulty = 'MEDIUM',
      duration_minutes,
      duration,
      passing_score = 70,
      passingPercentage,
      max_attempts = 3,
      maxAttempts,
      status = 'DRAFT',
      thumbnail_url,
      thumbnail,
      questions,
    } = req.body;

    let targetCategoryId = category_id;

    if (!targetCategoryId && category) {
      let { data: cat } = await db.from('categories').select('id').eq('name', category).single();
      if (!cat) {
        const { data: newCat } = await db.from('categories').insert([{ name: category, description: `${category} topic` }]).select().single();
        cat = newCat;
      }
      targetCategoryId = cat?.id;
    }

    if (!targetCategoryId) {
      const { data: defaultCat } = await db.from('categories').select('id').limit(1).single();
      targetCategoryId = defaultCat?.id;
    }

    const finalDuration = duration_minutes || duration || 20;
    const finalPassing = passing_score || passingPercentage || 70;
    const finalMaxAttempts = max_attempts || maxAttempts || 3;
    const finalDifficulty = String(difficulty).toUpperCase();
    const finalStatus = String(status).toUpperCase();

    const { data: newQuiz, error } = await db
      .from('quizzes')
      .insert([
        {
          title,
          description,
          category_id: targetCategoryId,
          difficulty: finalDifficulty,
          duration_minutes: finalDuration,
          passing_score: finalPassing,
          max_attempts: finalMaxAttempts,
          status: finalStatus,
          thumbnail_url: thumbnail_url || thumbnail || null,
          created_by: req.user?.id || null,
        },
      ])
      .select()
      .single();

    if (error || !newQuiz) {
      throw error || new Error('Quiz creation failed');
    }

    // 1. If file attached in createQuiz request
    if (req.file) {
      await importRandomQuestionsFromExcel(newQuiz.id, req.file.buffer, 20);
    }

    // 2. If inline questions array provided (e.g. 20 dynamic slots)
    let parsedQuestions = questions;
    if (typeof questions === 'string') {
      try {
        parsedQuestions = JSON.parse(questions);
      } catch (e) {
        parsedQuestions = [];
      }
    }

    if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
      for (const q of parsedQuestions) {
        const qText = q.questionText || q.text;
        if (!qText || !qText.trim()) continue;

        const { data: createdQ } = await db
          .from('questions')
          .insert([
            {
              quiz_id: newQuiz.id,
              question_text: qText.trim(),
              marks: Number(q.marks) > 0 ? Number(q.marks) : 1,
              explanation: q.explanation || null,
              difficulty: q.difficulty ? String(q.difficulty).toUpperCase() : finalDifficulty,
              question_type: 'MULTIPLE_CHOICE',
            },
          ])
          .select()
          .single();

        if (createdQ && Array.isArray(q.options) && q.options.length > 0) {
          const optionRecords = q.options
            .filter((opt) => (opt.text || opt.optionText || '').trim() !== '')
            .map((opt) => ({
              question_id: createdQ.id,
              option_text: (opt.text || opt.optionText).trim(),
              is_correct: Boolean(opt.isCorrect),
            }));

          if (optionRecords.length > 0) {
            await db.from('options').insert(optionRecords);
          }
        }
      }
    }

    return successResponse(res, newQuiz, 'Quiz created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const payload = {};
    if (body.title !== undefined) payload.title = body.title;
    if (body.description !== undefined) payload.description = body.description;
    if (body.duration_minutes || body.duration) payload.duration_minutes = body.duration_minutes || body.duration;
    if (body.passing_score || body.passingPercentage) payload.passing_score = body.passing_score || body.passingPercentage;
    if (body.max_attempts || body.maxAttempts) payload.max_attempts = body.max_attempts || body.maxAttempts;
    if (body.difficulty) payload.difficulty = String(body.difficulty).toUpperCase();
    if (body.status) payload.status = String(body.status).toUpperCase();
    if (body.thumbnail_url || body.thumbnail) payload.thumbnail_url = body.thumbnail_url || body.thumbnail;
    payload.updated_at = new Date().toISOString();

    const { data: updated, error } = await db
      .from('quizzes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return errorResponse(res, 'Quiz update failed', 'QUIZ_UPDATE_FAILED', 400);
    }

    return successResponse(res, updated, 'Quiz updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('quizzes').delete().eq('id', id);
    if (error) throw error;

    return successResponse(res, { id }, 'Quiz deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const publishQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const dbStatus = String(status).toUpperCase();

    const { data: updated, error } = await db
      .from('quizzes')
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return errorResponse(res, 'Failed to update publish status', 'PUBLISH_FAILED', 400);
    }

    return successResponse(res, updated, `Quiz status updated to ${dbStatus}`);
  } catch (err) {
    next(err);
  }
};

// Import Excel Endpoint: Pick 20 Random Questions
export const importExcelQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    if (!req.file) {
      return errorResponse(res, 'No Excel spreadsheet (.xlsx / .csv) file uploaded', 'FILE_REQUIRED', 400);
    }

    const result = await importRandomQuestionsFromExcel(quizId, req.file.buffer, 20);
    return successResponse(
      res,
      result,
      `Successfully selected and imported ${result.selectedCount} random questions from ${result.totalInSheet} total questions in the Excel spreadsheet.`
    );
  } catch (err) {
    return errorResponse(res, err.message || 'Excel processing failed', 'EXCEL_IMPORT_ERROR', 400);
  }
};

// Download Sample Excel Template Endpoint
export const downloadExcelTemplate = async (req, res) => {
  const buffer = generateExcelTemplateBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="QuizMaster_Questions_Template.xlsx"');
  return res.send(buffer);
};
