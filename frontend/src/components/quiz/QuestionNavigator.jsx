import React from 'react';

export const QuestionNavigator = ({
  totalQuestions = 0,
  currentIndex = 0,
  answers = {},
  onSelectQuestion,
}) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-ms-lg p-4">
      <div className="flex items-center justify-between mb-3 border-b border-dark-border pb-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Question Palette
        </h4>
        <span className="text-xs text-slate-400">
          {Object.keys(answers).length} / {totalQuestions} Answered
        </span>
      </div>

      {/* Grid of Question Buttons */}
      <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[idx] !== undefined && answers[idx] !== null;

          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(idx)}
              className={`h-9 w-full rounded-ms text-xs font-bold transition-all flex items-center justify-center ${
                isCurrent
                  ? 'bg-brand-cyan text-dark-bg ring-2 ring-brand-cyanLight ring-offset-2 ring-offset-dark-bg font-extrabold shadow-ms-glow'
                  : isAnswered
                  ? 'bg-brand-green/20 text-brand-greenLight border border-brand-green/40 hover:bg-brand-green/30'
                  : 'bg-dark-bg text-slate-400 border border-dark-border hover:border-slate-500 hover:text-white'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
};
