import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Play, Sparkles, Clock, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroBanner = ({ quiz }) => {
  const navigate = useNavigate();

  if (!quiz) return null;

  return (
    <div className="relative w-full rounded-ms-xl overflow-hidden bg-gradient-to-r from-slate-900 via-dark-card to-dark-bg border border-dark-borderLight shadow-2xl p-6 md:p-8 flex flex-col justify-end min-h-[280px] group">
      {/* Background Graphic Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-cyan/20 to-transparent pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full bg-brand-cyan/10 blur-3xl pointer-events-none" />

      {/* Featured Pill */}
      <div className="relative z-10 flex items-center gap-2 mb-3">
        <Badge variant="cyan" size="sm" className="bg-brand-cyan text-dark-bg font-extrabold shadow-ms-glow">
          <Sparkles className="w-3 h-3 mr-1 inline" /> FEATURED ASSESSMENT
        </Badge>
        <Badge variant="purple" size="sm">
          {quiz.category}
        </Badge>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight group-hover:text-brand-cyanLight transition-colors">
          {quiz.title}
        </h2>
        <p className="text-sm text-slate-300 mt-2 line-clamp-2 leading-relaxed">
          {quiz.description}
        </p>

        {/* Info stats */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 bg-dark-bg/60 px-3 py-1 rounded-full border border-dark-border">
            <HelpCircle className="w-3.5 h-3.5 text-brand-cyan" /> {quiz.questionsCount || 15} Questions
          </span>
          <span className="flex items-center gap-1.5 bg-dark-bg/60 px-3 py-1 rounded-full border border-dark-border">
            <Clock className="w-3.5 h-3.5 text-brand-purpleLight" /> {quiz.duration} Mins
          </span>
        </div>

        {/* Action CTA */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Play}
            onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
          >
            Start Quiz Now
          </Button>
        </div>
      </div>
    </div>
  );
};
