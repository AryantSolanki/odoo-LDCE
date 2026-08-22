import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        glass
          ? 'glass-panel shadow-subtle'
          : 'bg-white border-slate-200/80 shadow-card'
      } ${
        hoverEffect
          ? 'hover:-translate-y-1 hover:shadow-card-hover hover:border-slate-300'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`p-5 sm:p-6 border-b border-slate-100 flex flex-col space-y-1.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', as: Tag = 'h3', ...props }) => {
  return (
    <Tag
      className={`text-lg font-semibold tracking-tight text-slate-900 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p
      className={`text-xs sm:text-sm text-slate-500 font-normal leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-slate-100/60 mt-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
