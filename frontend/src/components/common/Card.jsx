import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  gradientBorder = false,
  ...props
}) => {
  return (
    <div
      className={`bg-dark-card border border-dark-border rounded-ms-lg p-5 shadow-ms-card text-slate-100 ${
        hoverEffect ? 'ms-card-hover cursor-pointer' : ''
      } ${
        gradientBorder ? 'relative overflow-hidden before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-r before:from-brand-cyan/40 before:to-brand-purple/40 before:-z-10' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
