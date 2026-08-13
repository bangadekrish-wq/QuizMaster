import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import { useToast } from '../../context/ToastContext';
import { Timer } from '../../components/quiz/Timer';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import { QuestionNavigator } from '../../components/quiz/QuestionNavigator';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ChevronLeft, ChevronRight, Send, GraduationCap, ArrowLeft } from 'lucide-react';

export const QuizAttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [attemptSession, setAttemptSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Attempt State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOptionId }
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializeAttempt = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await attemptService.startQuiz(id);
        const data = res.data || res;
        setAttemptSession(data);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(true);
        setErrorMessage(
          err.response?.data?.message || 'Unable to start quiz session. Please make sure you have attempts remaining.'
        );
      } finally {
        setLoading(false);
      }
    };
    initializeAttempt();
  }, [id]);

  const handleSelectOption = (optionValue) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionValue,
    }));
  };

  const handleFinalSubmit = async () => {
    if (!attemptSession) return;
    setSubmitting(true);
    try {
      const formattedAnswers = questions.map((q, idx) => ({
        questionId: q.id,
        selectedOptionId: answers[idx] || null,
      }));

      const res = await attemptService.submitQuiz(id, {
        attemptId: attemptSession.attemptId,
        answers: formattedAnswers,
      });

      const result = res.data || res;
      addToast('Quiz submitted successfully!', 'success');
      navigate(`/student/attempts/${result.id}/result`, { state: { result } });
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting quiz attempt.', 'error');
    } finally {
      setSubmitting(false);
      setConfirmModalOpen(false);
    }
  };

  if (loading) return <LoadingSpinner label="Initializing assessment session..." size="lg" />;

  if (error || !attemptSession || questions.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col items-center justify-center p-6">
        <ErrorState
          title="Quiz Session Error"
          message={errorMessage || 'No questions available for this assessment.'}
          onRetry={() => window.location.reload()}
        />
        <div className="mt-4">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/student/quizzes')}>
            Return to Explore Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Calculate remaining seconds from backend expiresAt
  const remainingSeconds = attemptSession.expiresAt
    ? Math.max(0, Math.floor((new Date(attemptSession.expiresAt).getTime() - Date.now()) / 1000))
    : (attemptSession.durationMinutes || 20) * 60;

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col font-sans">
      {/* Top Distraction-Free Bar */}
      <header className="h-16 bg-dark-sidebar/90 border-b border-dark-border sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-ms bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 line-clamp-1">{attemptSession.quizTitle}</h1>
            <span className="text-xs text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Timer initialSeconds={remainingSeconds} onTimeUp={handleFinalSubmit} />
          <Button variant="danger" size="sm" icon={Send} onClick={() => setConfirmModalOpen(true)}>
            Submit Quiz
          </Button>
        </div>
      </header>

      {/* Main Attempt Body */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Area */}
        <div className="lg:col-span-2 space-y-6">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedOption={answers[currentIndex]}
            onSelectOption={handleSelectOption}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              isDisabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              icon={ChevronLeft}
            >
              Previous Question
            </Button>

            {isLastQuestion ? (
              <Button
                variant="success"
                icon={Send}
                iconPosition="right"
                onClick={() => setConfirmModalOpen(true)}
              >
                Submit Assessment
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                icon={ChevronRight}
                iconPosition="right"
              >
                Next Question
              </Button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div>
          <QuestionNavigator
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
          />
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleFinalSubmit}
        title="Submit Quiz Attempt?"
        message={`You have answered ${Object.keys(answers).length} out of ${questions.length} questions. Are you sure you want to finalize your submission?`}
        confirmText="Yes, Submit Now"
        variant="primary"
        isLoading={submitting}
      />
    </div>
  );
};
