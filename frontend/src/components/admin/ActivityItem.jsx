import React from 'react';
import { UserPlus, CheckCircle2, Award, FileText, PlusCircle } from 'lucide-react';

export const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'registration':
        return <UserPlus className="w-4 h-4 text-brand-cyan" />;
      case 'published':
        return <CheckCircle2 className="w-4 h-4 text-brand-green" />;
      case 'passed':
        return <Award className="w-4 h-4 text-brand-purple" />;
      case 'attempt':
        return <FileText className="w-4 h-4 text-brand-blue" />;
      case 'question':
        return <PlusCircle className="w-4 h-4 text-brand-orange" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-brand-cyan" />;
    }
  };

  return (
    <div className="flex items-center gap-3.5 p-3 rounded-ms bg-dark-bg/40 border border-dark-border/60 hover:bg-dark-cardHover transition-colors">
      <div className="p-2 rounded-ms bg-dark-card border border-dark-border flex-shrink-0">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-100 truncate">{activity.title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{activity.user}</p>
      </div>
      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{activity.timestamp}</span>
    </div>
  );
};
