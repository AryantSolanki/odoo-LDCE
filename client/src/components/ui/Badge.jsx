import React from 'react';

const variantClasses = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-brand-50 text-brand-700 border-brand-200/60',
  accent: 'bg-travel-50 text-travel-700 border-travel-200/60',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
  outline: 'bg-transparent text-slate-600 border-slate-300',
};

const dotClasses = {
  default: 'bg-slate-500',
  primary: 'bg-brand-600',
  accent: 'bg-travel-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  outline: 'bg-slate-400',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  showDot = false,
  className = '',
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${
        variantClasses[variant] || variantClasses.default
      } ${sizeClass} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotClasses[variant] || dotClasses.default
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
