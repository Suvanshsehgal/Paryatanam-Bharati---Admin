import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Failed to load data',
  description = 'An error occurred while fetching information from the server.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 my-4">
      <div className="p-3.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 mb-3">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">{title}</h3>
      <p className="text-xs text-rose-700/80 dark:text-rose-300/70 mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
