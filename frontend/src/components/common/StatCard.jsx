import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  isIncrease = true,
  changeText = 'vs last month',
  accentColor = 'cyan', // 'cyan', 'blue', 'green', 'orange', 'purple', 'red'
  className = '',
}) => {
  const accentStyles = {
    cyan: {
      bg: 'bg-brand-cyan/15 text-brand-cyanLight border-brand-cyan/30',
      glow: 'hover:shadow-ms-glow hover:border-brand-cyan/40',
      text: 'text-brand-cyanLight',
    },
    blue: {
      bg: 'bg-brand-blue/15 text-blue-400 border-brand-blue/30',
      glow: 'hover:border-brand-blue/40',
      text: 'text-blue-400',
    },
    green: {
      bg: 'bg-brand-green/15 text-brand-greenLight border-brand-green/30',
      glow: 'hover:border-brand-green/40',
      text: 'text-brand-greenLight',
    },
    orange: {
      bg: 'bg-brand-orange/15 text-brand-orangeLight border-brand-orange/30',
      glow: 'hover:border-brand-orange/40',
      text: 'text-brand-orangeLight',
    },
    purple: {
      bg: 'bg-brand-purple/15 text-brand-purpleLight border-brand-purple/30',
      glow: 'hover:shadow-ms-glow-purple hover:border-brand-purple/40',
      text: 'text-brand-purpleLight',
    },
    red: {
      bg: 'bg-brand-red/15 text-brand-redLight border-brand-red/30',
      glow: 'hover:border-brand-red/40',
      text: 'text-brand-redLight',
    },
  };

  const style = accentStyles[accentColor] || accentStyles.cyan;

  return (
    <Card className={`transition-all duration-200 ${style.glow} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`p-2.5 rounded-ms border ${style.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="text-3xl font-bold text-slate-100 tracking-tight">{value}</div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isIncrease ? 'bg-brand-green/15 text-brand-greenLight' : 'bg-brand-red/15 text-brand-redLight'
            }`}
          >
            {isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {changeText && <p className="text-xs text-slate-400 mt-2">{changeText}</p>}
    </Card>
  );
};
