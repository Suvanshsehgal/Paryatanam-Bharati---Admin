import React from 'react';
import { cn } from '../../utils/cn';

export const LoadingSkeleton = ({ count = 3, className }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-10 w-full rounded-xl bg-slate-200/80 dark:bg-slate-800/60',
            className
          )}
        />
      ))}
    </div>
  );
};
