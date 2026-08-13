import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
}) => {
  if (!question) return null;

  return (
    <Card className="flex flex-col gap-6 p-6">
      {/* Question Header */}
      <div className="flex items-center justify-between border-b border-dark-border pb-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-brand-cyan/15 text-brand-cyan font-bold rounded-ms text-xs border border-brand-cyan/30">
            Question {questionNumber} of {totalQuestions}
          </span>
          {question.difficulty && (
            <Badge variant={question.difficulty === 'Easy' ? 'green' : question.difficulty === 'Hard' ? 'red' : 'orange'}>
              {question.difficulty}
            </Badge>
          )}
        </div>
        {question.marks && (
          <span className="text-xs font-semibold text-slate-400">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
        )}
      </div>

      {/* Question Text */}
      <div className="text-base md:text-lg font-semibold text-slate-100 leading-relaxed">
        {question.text}
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-3 mt-2">
        {question.options?.map((option, idx) => {
          const optionText = typeof option === 'string' ? option : option.text;
          const isSelected = selectedOption === optionText || selectedOption === option.id;

          return (
            <label
              key={idx}
              onClick={() => onSelectOption(optionText)}
              className={`flex items-start gap-3.5 p-4 rounded-ms border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-brand-cyan/15 border-brand-cyan text-slate-100 shadow-ms-glow'
                  : 'bg-dark-bg/60 border-dark-border hover:border-slate-600 text-slate-300 hover:text-white hover:bg-dark-cardHover'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'border-brand-cyan bg-brand-cyan text-dark-bg font-bold'
                    : 'border-slate-600 bg-dark-bg'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-dark-bg" />}
              </div>
              <span className="text-sm font-medium leading-normal flex-1">
                {optionText}
              </span>
            </label>
          );
        })}
      </div>
    </Card>
  );
};
