import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Play,
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export const QuizDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await quizService.getQuizById(id);
        setQuiz(res);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading assessment parameters..." />;
  if (error || !quiz) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Header
        title={quiz.title}
        subtitle={`${quiz.category} • ${quiz.difficulty} Level Assessment`}
        action={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/student/quizzes')}>
            Back to Quizzes
          </Button>
        }
      />

      {/* Main Details Banner Card */}
      <Card className="p-8 relative overflow-hidden border-dark-borderLight">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="cyan">{quiz.category}</Badge>
              <Badge variant={quiz.difficulty === 'Easy' ? 'green' : quiz.difficulty === 'Hard' ? 'red' : 'orange'}>
                {quiz.difficulty} Difficulty
              </Badge>
            </div>

            <h2 className="text-2xl font-bold text-slate-100">{quiz.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{quiz.description}</p>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dark-border">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-brand-cyan" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Questions</span>
                  <span className="text-sm font-bold text-slate-100">{quiz.questionsCount} Items</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-brand-purpleLight" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                  <span className="text-sm font-bold text-slate-100">{formatDuration(quiz.duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-brand-greenLight" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Passing Score</span>
                  <span className="text-sm font-bold text-slate-100">{quiz.passingPercentage}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-brand-orange" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Remaining</span>
                  <span className="text-sm font-bold text-slate-100">{quiz.attemptsRemaining || 3} Attempts</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="w-full md:w-auto flex flex-col items-center gap-3 bg-dark-bg p-6 rounded-ms-lg border border-dark-border shadow-ms-glow">
            <span className="text-xs font-bold text-slate-400">Ready to begin?</span>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-48 text-base py-3"
              icon={Play}
              onClick={() => navigate(`/student/quizzes/${quiz.id}/attempt`)}
            >
              Start Quiz
            </Button>
            <span className="text-[11px] text-slate-500 text-center max-w-[180px]">
              Timer begins immediately upon launch
            </span>
          </div>
        </div>
      </Card>

      {/* Assessment Instructions Section */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-100 border-b border-dark-border pb-3 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-brand-orange" /> Important Examination Guidelines
        </h3>
        <ul className="space-y-3 text-xs text-slate-300">
          {quiz.instructions?.map((inst, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
              <span>{inst}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
