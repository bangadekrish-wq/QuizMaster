import React from 'react';

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-400 min-h-[200px]">
      <div
        className={`${sizes[size]} border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin`}
      />
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
    </div>
  );
};
