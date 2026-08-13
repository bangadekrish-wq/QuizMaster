import React from 'react';

export const Badge = ({
  children,
  variant = 'cyan', // 'cyan', 'green', 'red', 'orange', 'purple', 'gray'
  size = 'md',
  className = '',
}) => {
  const variants = {
    cyan: 'bg-brand-cyan/15 text-brand-cyanLight border-brand-cyan/30',
    green: 'bg-brand-green/15 text-brand-greenLight border-brand-green/30',
    red: 'bg-brand-red/15 text-brand-redLight border-brand-red/30',
    orange: 'bg-brand-orange/15 text-brand-orangeLight border-brand-orange/30',
    purple: 'bg-brand-purple/15 text-brand-purpleLight border-brand-purple/30',
    gray: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.cyan} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
