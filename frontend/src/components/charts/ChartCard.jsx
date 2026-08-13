import React from 'react';
import { Card } from '../common/Card';

export const ChartCard = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <Card className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="w-full flex-1 min-h-[260px]">{children}</div>
    </Card>
  );
};
