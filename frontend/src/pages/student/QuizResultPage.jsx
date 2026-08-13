import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import { Header } from '../../components/layout/Header';
import { ScoreCard } from '../../components/quiz/ScoreCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export const QuizResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!result) {
      const fetchResult = async () => {
        setLoading(true);
        try {
          const res = await attemptService.getAttemptResult(id);
          setResult(res);
        } catch (err) {
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    }
  }, [id, result]);

  if (loading) return <LoadingSpinner label="Evaluating score metrics..." size="lg" />;
  if (error || !result) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Header
        title="Assessment Result"
        subtitle={`Summary and detailed breakdown for ${result.quizTitle}`}
        action={
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/student/attempts')}>
              My Attempts
            </Button>
            <Button
              variant="primary"
              icon={RotateCcw}
              onClick={() => navigate(`/student/quizzes/${result.quizId || 'qz_1'}`)}
            >
              Retake Quiz
            </Button>
          </div>
        }
      />

      {/* Main Scorecard Indicator Component */}
      <ScoreCard result={result} />

      {/* Answer Review Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 border-b border-dark-border pb-2">
          Answer Review & Solutions
        </h3>

        {result.review?.map((item, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-dark-elevated text-xs font-bold flex items-center justify-center border border-dark-border text-slate-300">
                  #{idx + 1}
                </span>
                <Badge variant={item.isCorrect ? 'green' : 'red'}>
                  {item.isCorrect ? 'CORRECT' : 'INCORRECT'}
                </Badge>
              </div>
              {item.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-brand-green" />
              ) : (
                <XCircle className="w-5 h-5 text-brand-red" />
              )}
            </div>

            <p className="text-sm font-semibold text-slate-100 mb-4">{item.text}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3 rounded-ms border ${
                  item.isCorrect
                    ? 'bg-brand-green/10 border-brand-green/30 text-brand-greenLight font-semibold'
                    : 'bg-brand-red/10 border-brand-red/30 text-brand-redLight font-semibold'
                }`}
              >
                <span className="font-bold block mb-0.5 text-slate-300">Your Answer:</span>
                <span>{item.studentAnswer || 'Not Answered'}</span>
              </div>
              <div className="p-3 rounded-ms border bg-brand-green/10 border-brand-green/30 text-brand-greenLight font-semibold">
                <span className="font-bold block mb-0.5 text-slate-300">Correct Answer:</span>
                <span>{item.correctAnswer}</span>
              </div>
            </div>

            {item.explanation && (
              <div className="mt-3 pt-3 border-t border-dark-border/60 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Explanation: </span>
                {item.explanation}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
