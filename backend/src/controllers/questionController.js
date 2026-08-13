import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getQuestionsByQuizId = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { data: questions, error } = await db
      .from('questions')
      .select('*, options(*)')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const formatted = (questions || []).map((q) => ({
      id: q.id,
      quizId: q.quiz_id,
      text: q.question_text,
      marks: q.marks,
      difficulty: q.difficulty === 'EASY' ? 'Easy' : q.difficulty === 'HARD' ? 'Hard' : 'Medium',
      type: q.question_type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : q.question_type,
      explanation: q.explanation,
      options: (q.options || []).map((opt) => ({
        id: opt.id,
        text: opt.option_text,
        isCorrect: opt.is_correct,
      })),
    }));

    return successResponse(res, formatted, 'Questions retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { text, questionText, marks = 1, explanation, difficulty = 'MEDIUM', type, questionType, options } = req.body;

    const qText = text || questionText;
    const qType = String(type || questionType || 'MULTIPLE_CHOICE').toUpperCase();
    const qDiff = String(difficulty).toUpperCase();

    // Insert Question
    const { data: question, error: qErr } = await db
      .from('questions')
      .insert([
        {
          quiz_id: quizId,
          question_text: qText,
          marks: Number(marks) || 1,
          explanation: explanation || null,
          difficulty: qDiff,
          question_type: qType,
        },
      ])
      .select()
      .single();

    if (qErr || !question) {
      throw qErr || new Error('Question creation failed');
    }

    // Insert Options
    if (Array.isArray(options) && options.length > 0) {
      const optionRecords = options.map((opt) => ({
        question_id: question.id,
        option_text: opt.text || opt.optionText || 'Option',
        is_correct: Boolean(opt.isCorrect),
      }));

      const { data: createdOpts, error: optErr } = await db
        .from('options')
        .insert(optionRecords)
        .select();

      if (optErr) throw optErr;
      question.options = createdOpts;
    }

    return successResponse(res, question, 'Question created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, questionText, marks, explanation, difficulty, options } = req.body;

    const payload = {};
    if (text || questionText) payload.question_text = text || questionText;
    if (marks) payload.marks = Number(marks);
    if (explanation !== undefined) payload.explanation = explanation;
    if (difficulty) payload.difficulty = String(difficulty).toUpperCase();
    payload.updated_at = new Date().toISOString();

    const { data: updatedQuestion, error: qErr } = await db
      .from('questions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (qErr || !updatedQuestion) {
      return errorResponse(res, 'Question update failed', 'QUESTION_UPDATE_FAILED', 400);
    }

    // Replace options if provided
    if (Array.isArray(options) && options.length > 0) {
      await db.from('options').delete().eq('question_id', id);

      const optionRecords = options.map((opt) => ({
        question_id: id,
        option_text: opt.text || opt.optionText || 'Option',
        is_correct: Boolean(opt.isCorrect),
      }));

      await db.from('options').insert(optionRecords);
    }

    return successResponse(res, updatedQuestion, 'Question updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('questions').delete().eq('id', id);
    if (error) throw error;

    return successResponse(res, { id }, 'Question deleted successfully');
  } catch (err) {
    next(err);
  }
};
