import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'success', 'danger', 'ghost', 'outline'
  size = 'md', // 'sm', 'md', 'lg'
  isLoading = false,
  isDisabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-ms transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-brand-cyan hover:bg-brand-cyanDark text-dark-bg font-semibold shadow-ms-glow hover:shadow-lg focus:ring-brand-cyan',
    secondary: 'bg-dark-elevated hover:bg-dark-borderLight text-slate-100 border border-dark-border focus:ring-slate-400',
    success: 'bg-brand-green hover:bg-emerald-600 text-dark-bg font-semibold shadow-sm focus:ring-brand-green',
    danger: 'bg-brand-red hover:bg-red-600 text-white font-medium shadow-sm focus:ring-brand-red',
    purple: 'bg-brand-purple hover:bg-purple-600 text-white font-semibold shadow-ms-glow-purple focus:ring-brand-purple',
    ghost: 'bg-transparent hover:bg-dark-card text-slate-300 hover:text-white focus:ring-slate-500',
    outline: 'bg-transparent border border-brand-cyan/40 hover:bg-brand-cyan/10 text-brand-cyanLight focus:ring-brand-cyan',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      disabled={isDisabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};
