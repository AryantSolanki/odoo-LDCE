import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastConfig = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    iconClass: 'text-emerald-600',
  },
  error: {
    icon: AlertCircle,
    classes: 'bg-rose-50 border-rose-200 text-rose-900',
    iconClass: 'text-rose-600',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-50 border-amber-200 text-amber-900',
    iconClass: 'text-amber-600',
  },
  info: {
    icon: Info,
    classes: 'bg-brand-50 border-brand-200 text-brand-900',
    iconClass: 'text-brand-600',
  },
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const config = toastConfig[toast.type] || toastConfig.info;
        const IconComponent = config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-dropdown transition-all animate-slide-up ${config.classes}`}
            role="alert"
          >
            <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconClass}`} />

            <div className="flex-1 text-xs sm:text-sm">
              {toast.title && (
                <p className="font-semibold tracking-tight leading-snug">{toast.title}</p>
              )}
              {toast.message && (
                <p className="text-slate-600 mt-0.5 leading-normal">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded focus:outline-none"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
