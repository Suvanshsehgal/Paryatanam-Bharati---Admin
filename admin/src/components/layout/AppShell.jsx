import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/ToastContainer';
import { cn } from '../../utils/cn';

export const AppShell = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isReadOnly } = useAuthStore();

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-slate-950 text-zinc-900 dark:text-zinc-100 flex transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Topbar setIsMobileOpen={setIsMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
          {isReadOnly && (
            <div className="flex items-start space-x-2 p-3 rounded-xl border border-fuchsia-200 dark:border-fuchsia-900 bg-fuchsia-50 dark:bg-fuchsia-950/30 text-xs text-fuchsia-800 dark:text-fuchsia-200">
              <Eye className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Super Admin · read-only view.</strong> You can review everything the Admin manages. To request a
                change, use <strong>Report Issue</strong> so the Admin team can act on it.
              </span>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
