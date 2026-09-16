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
  } else if (normalized === 'ADMIN') {
    styles = 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/60';
  } else if (normalized === 'OWNER') {
    styles = 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
  } else if (normalized === 'USER') {
    styles = 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
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
