import React, { forwardRef } from 'react';

export const Select = forwardRef(({
  label,
  options = [],
  error,
  icon: Icon = null,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          ref={ref}
          className={`w-full bg-dark-bg/80 border text-slate-100 rounded-ms text-sm py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan/60 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-8 appearance-none cursor-pointer ${
            error ? 'border-brand-red focus:ring-brand-red/50' : 'border-dark-border focus:border-brand-cyan'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-dark-card text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>
      {error && <span className="text-xs text-brand-red font-medium">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
