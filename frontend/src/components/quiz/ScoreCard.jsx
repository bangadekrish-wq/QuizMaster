import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Award, CheckCircle2, XCircle, Clock, HelpCircle, AlertCircle } from 'lucide-react';
import { formatTimeSeconds } from '../../utils/formatters';

export const ScoreCard = ({ result }) => {
  if (!result) return null;

  const isPassed = result.status === 'Passed';
  const percentage = Math.round(result.percentage || 0);

  return (
    <Card className="flex flex-col items-center p-8 text-center relative overflow-hidden">
      {/* Visual Accent Glow */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isPassed ? 'bg-brand-green' : 'bg-brand-red'
        }`}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Pass/Fail Status Badge */}
        <Badge variant={isPassed ? 'green' : 'red'} size="lg" className="mb-4 text-sm px-4 py-1.5">
          {isPassed ? 'QUIZ PASSED 🎉' : 'QUIZ FAILED'}
        </Badge>

        <h2 className="text-xl font-bold text-slate-100 mb-1">{result.quizTitle || 'Quiz Results'}</h2>
        <p className="text-xs text-slate-400 mb-6">Completed on {new Date(result.date || Date.now()).toLocaleDateString()}</p>

        {/* Large Score Radial / Badge Indicator */}
        <div
          className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center my-2 shadow-2xl transition-all ${
            isPassed
              ? 'border-brand-green bg-brand-green/10 shadow-ms-glow text-brand-greenLight'
              : 'border-brand-red bg-brand-red/10 text-brand-redLight'
          }`}
        >
          <span className="text-4xl font-extrabold tracking-tight">{percentage}%</span>
          <span className="text-xs font-semibold text-slate-300 mt-1">
            {result.score} / {result.totalMarks || 100} Marks
          </span>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-8 pt-6 border-t border-dark-border">
          <div className="flex flex-col items-center p-3 rounded-ms bg-dark-bg/60 border border-dark-border">
            <CheckCircle2 className="w-5 h-5 text-brand-green mb-1" />
            <span className="text-lg font-bold text-slate-100">{result.correctCount || 0}</span>
            <span className="text-xs text-slate-400">Correct</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-ms bg-dark-bg/60 border border-dark-border">
            <XCircle className="w-5 h-5 text-brand-red mb-1" />
            <span className="text-lg font-bold text-slate-100">{result.incorrectCount || 0}</span>
            <span className="text-xs text-slate-400">Incorrect</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-ms bg-dark-bg/60 border border-dark-border">
            <HelpCircle className="w-5 h-5 text-brand-orange mb-1" />
            <span className="text-lg font-bold text-slate-100">{result.unansweredCount || 0}</span>
            <span className="text-xs text-slate-400">Unanswered</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-ms bg-dark-bg/60 border border-dark-border">
            <Clock className="w-5 h-5 text-brand-cyan mb-1" />
            <span className="text-lg font-bold text-slate-100">{formatTimeSeconds(result.timeTaken || 0)}</span>
            <span className="text-xs text-slate-400">Time Taken</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
