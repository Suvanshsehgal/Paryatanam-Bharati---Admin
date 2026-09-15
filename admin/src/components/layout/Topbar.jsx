import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import { Search, Sun, Moon, LogOut, Menu, Bell, ChevronDown } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const Topbar = ({ setIsMobileOpen }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-slate-800/60 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-zinc-200/80 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Soft Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200/70 dark:border-slate-800 bg-zinc-50/80 dark:bg-slate-900 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-all shadow-2xs"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
                {user?.name || 'Administrator'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-slate-800">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{user?.name || 'Admin User'}</p>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {user?.roles?.map((r) => (
                    <StatusBadge key={r} status={r} className="text-[10px] py-0.5 px-2" />
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
