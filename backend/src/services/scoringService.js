import { db } from '../config/db.js';

export const calculateAttemptScore = async (attemptId, submittedAnswers, userId) => {
  // 1. Fetch Attempt record
  const { data: attempt, error: attemptErr } = await db
    .from('attempts')
    .select('*, quizzes(*)')
    .eq('id', attemptId)
    .single();

  if (attemptErr || !attempt) {
    throw { message: 'Quiz attempt record not found', code: 'ATTEMPT_NOT_FOUND', statusCode: 404 };
  }

  if (attempt.user_id !== userId) {
    throw { message: 'Forbidden: You do not own this quiz attempt', code: 'FORBIDDEN', statusCode: 403 };
  }

  if (attempt.status === 'COMPLETED' || attempt.status === 'AUTO_SUBMITTED') {
    throw { message: 'Attempt has already been finalized', code: 'ATTEMPT_FINALIZED', statusCode: 400 };
  }

  // 2. Check Expiry
  const now = new Date();
  const expiresAt = new Date(attempt.expires_at);
  const isExpired = now > expiresAt;
  const finalStatus = isExpired ? 'AUTO_SUBMITTED' : 'COMPLETED';

  // 3. Fetch Questions & Correct Options from Database
  const { data: questions, error: qErr } = await db
    .from('questions')
    .select('*, options(*)')
    .eq('quiz_id', attempt.quiz_id);

  if (qErr) {
    throw { message: 'Failed to load quiz question key', code: 'DATABASE_ERROR', statusCode: 500 };
  }

  let totalMarks = 0;
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const answerRecords = [];
  const reviewPayload = [];

  const submissionMap = new Map();
  if (Array.isArray(submittedAnswers)) {
    submittedAnswers.forEach((ans) => {
      submissionMap.set(ans.questionId || ans.question_id, ans.selectedOptionId || ans.selected_option_id || ans.selectedAnswer);
    });
  }

  for (const q of questions) {
    totalMarks += (q.marks || 1);
    const correctOpt = q.options?.find((opt) => opt.is_correct);
    const submittedVal = submissionMap.get(q.id);

    let selectedOpt = null;
    if (submittedVal) {
      selectedOpt = q.options?.find(
        (opt) => opt.id === submittedVal || opt.option_text === submittedVal
      );
    }

    let isCorrect = false;
    let marksAwarded = 0;

    if (!selectedOpt) {
      unansweredCount++;
    } else if (correctOpt && selectedOpt.id === correctOpt.id) {
      isCorrect = true;
      marksAwarded = q.marks || 1;
      score += marksAwarded;
      correctCount++;
    } else {
      incorrectCount++;
    }

    answerRecords.push({
      attempt_id: attemptId,
      question_id: q.id,
      selected_option_id: selectedOpt ? selectedOpt.id : null,
      is_correct: isCorrect,
      marks_awarded: marksAwarded,
    });

    reviewPayload.push({
      questionId: q.id,
      text: q.question_text,
      studentAnswer: selectedOpt ? selectedOpt.option_text : 'Not Answered',
      correctAnswer: correctOpt ? correctOpt.option_text : 'N/A',
      explanation: q.explanation || '',
      isCorrect,
    });
  }

  const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
  const passingScore = attempt.quizzes?.passing_score || 70;
  const isPassed = percentage >= passingScore;

  const startedAt = new Date(attempt.started_at);
  const timeTakenSeconds = Math.max(1, Math.floor((now - startedAt) / 1000));

  // 4. Save Answers in Database
  if (answerRecords.length > 0) {
    await db.from('answers').insert(answerRecords);
  }

  // 5. Update Attempt Record in Database
  const { data: updatedAttempt, error: updateErr } = await db
    .from('attempts')
    .update({
      score,
      total_marks: totalMarks,
      percentage,
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
      unanswered: unansweredCount,
      time_taken_seconds: timeTakenSeconds,
      status: finalStatus,
      completed_at: now.toISOString(),
    })
    .eq('id', attemptId)
    .select()
    .single();

  if (updateErr) {
    throw { message: 'Failed to update attempt results', code: 'DATABASE_ERROR', statusCode: 500 };
  }

  return {
    id: updatedAttempt.id,
    quizId: attempt.quiz_id,
    quizTitle: attempt.quizzes?.title,
    date: updatedAttempt.completed_at,
    score,
    totalMarks,
    percentage,
    status: isPassed ? 'Passed' : 'Failed',
    timeTaken: timeTakenSeconds,
    correctCount,
    incorrectCount,
    unansweredCount,
    review: reviewPayload,
  };
};
