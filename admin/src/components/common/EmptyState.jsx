import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No data available', description = 'There are no records to display at this time.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 mb-3">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
