import React from 'react';
import { Card } from '../common/Card';
import { Code, Atom, Terminal, Layout, Server, Database, BookOpen } from 'lucide-react';

export const CategoryCard = ({ category, onClick }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'code': return Code;
      case 'atom': return Atom;
      case 'terminal': return Terminal;
      case 'layout': return Layout;
      case 'server': return Server;
      case 'database': return Database;
      default: return BookOpen;
    }
  };

  const Icon = getIcon(category.icon);

  return (
    <Card
      hoverEffect
      onClick={onClick}
      className="flex items-center gap-4 p-4 border-dark-border/80 hover:border-brand-cyan/40 group"
    >
      <div className="p-3 rounded-ms-lg bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 border border-brand-cyan/30 text-brand-cyanLight group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-100 group-hover:text-brand-cyanLight transition-colors">
          {category.name}
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">{category.quizCount || 0} Available Quizzes</p>
      </div>
    </Card>
  );
};
