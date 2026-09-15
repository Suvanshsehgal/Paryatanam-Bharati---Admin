import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0',
              'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100',
              isSuccess && 'border-emerald-500/50 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100',
              isError && 'border-rose-500/50 bg-rose-50/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100',
              isWarning && 'border-amber-500/50 bg-amber-50/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100',
              !isSuccess && !isError && !isWarning && 'border-slate-200 dark:border-slate-700'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            </div>

            <div className="flex-1 text-sm">
              {toast.title && <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>}
              {toast.description && <p className="mt-1 text-xs opacity-90 leading-relaxed">{toast.description}</p>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
