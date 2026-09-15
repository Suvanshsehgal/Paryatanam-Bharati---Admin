import React from 'react';
import { cn } from '../../utils/cn';

export const StatusBadge = ({ status, className }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (['APPROVED', 'ACTIVE', 'CERTIFIED', 'DELIVERED', 'PUBLISHED'].includes(normalized)) {
    styles = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    if (normalized === 'CERTIFIED') {
      styles += ' ring-2 ring-emerald-400/30 dark:ring-emerald-500/30 shadow-sm';
    }
  } else if (['PENDING', 'PENDING_REVIEW', 'NONE', 'DRAFT'].includes(normalized)) {
    styles = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  } else if (['REJECTED', 'SUSPENDED', 'BLOCKED', 'INACTIVE'].includes(normalized)) {
    styles = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  } else if (['DISPATCHED', 'SHIPPED', 'PROCESSING'].includes(normalized)) {
    styles = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide transition-all',
        styles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {status}
    </span>
  );
};
