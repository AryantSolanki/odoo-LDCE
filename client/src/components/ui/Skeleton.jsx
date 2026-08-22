import React from 'react';
import { Loader2 } from 'lucide-react';

export const SkeletonLine = ({ className = 'w-full h-4' }) => (
  <div className={`bg-slate-200/70 animate-pulse rounded-lg ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-subtle ${className}`}>
    <div className="w-full h-40 bg-slate-200/70 animate-pulse rounded-xl" />
    <SkeletonLine className="w-3/4 h-5" />
    <SkeletonLine className="w-1/2 h-4" />
    <div className="pt-2 flex justify-between items-center">
      <SkeletonLine className="w-1/4 h-6" />
      <SkeletonLine className="w-1/5 h-8 rounded-lg" />
    </div>
  </div>
);

export const SkeletonMetrics = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-subtle">
        <div className="flex justify-between items-center">
          <SkeletonLine className="w-24 h-4" />
          <div className="w-8 h-8 rounded-lg bg-slate-200/70 animate-pulse" />
        </div>
        <SkeletonLine className="w-32 h-7" />
        <SkeletonLine className="w-20 h-3" />
      </div>
    ))}
  </div>
);

export const PageSpinner = ({ message = 'Loading GlobeTrotter...' }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
    <p className="text-xs font-medium text-slate-500 tracking-wide">{message}</p>
  </div>
);
