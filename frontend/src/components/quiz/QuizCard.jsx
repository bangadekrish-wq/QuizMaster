import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Clock, HelpCircle, Award, Play, ChevronRight } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export const QuizCard = ({ quiz, role = 'STUDENT', onEdit, onDelete }) => {
  const navigate = useNavigate();

  const difficultyColors = {
    Easy: 'green',
    Medium: 'orange',
    Hard: 'red',
  };

  const isDraft = quiz.status === 'Draft';

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full group relative overflow-hidden">
      <div>
        {/* Card Thumbnail / Hero Header */}
        <div className="relative h-40 w-full rounded-ms overflow-hidden mb-4 bg-dark-sidebar border border-dark-border">
          {quiz.thumbnail ? (
            <img
              src={quiz.thumbnail}
              alt={quiz.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-elevated to-brand-cyan/20 flex items-center justify-center">
              <Award className="w-12 h-12 text-brand-cyan/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              {quiz.category}
            </Badge>
            <Badge variant={difficultyColors[quiz.difficulty] || 'orange'} size="sm">
              {quiz.difficulty}
            </Badge>
          </div>

          {quiz.status && (
            <div className="absolute top-3 right-3">
              <Badge
                variant={quiz.status === 'Published' ? 'green' : quiz.status === 'Draft' ? 'orange' : 'gray'}
                size="sm"
              >
                {quiz.status}
              </Badge>
            </div>
          )}
        </div>

        {/* Quiz Title & Description */}
        <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-cyanLight transition-colors line-clamp-1">
          {quiz.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {quiz.description}
        </p>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-dark-border/60 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{quiz.questionsCount || quiz.questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-purpleLight" />
            <span>{formatDuration(quiz.duration)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-brand-greenLight" />
            <span>{quiz.passingPercentage}% Pass Rate</span>
          </div>
          {quiz.maxAttempts && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Attempts:</span>
              <span className="font-semibold text-slate-200">{quiz.maxAttempts} Max</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3 border-t border-dark-border/60 flex items-center justify-between gap-2">
        {role === 'ADMIN' ? (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/quizzes/${quiz.id}/edit`)}
            >
              Edit Quiz
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/admin/quizzes/${quiz.id}/questions`)}
            >
              Questions
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            icon={Play}
            onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
          >
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
};
