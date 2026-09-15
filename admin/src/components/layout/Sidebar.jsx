import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  LayoutTemplate,
  ShoppingBag,
  MapPin,
  Sparkles,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  X,
  Compass
} from 'lucide-react';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'User Governance', path: '/dashboard/users', icon: Users },
  { name: 'SDUI Home Layout', path: '/dashboard/home-layout', icon: LayoutTemplate },
  { name: 'GoAmrit Marketplace', path: '/dashboard/marketplace', icon: ShoppingBag },
  { name: 'Destinations & Tours', path: '/dashboard/travel', icon: MapPin },
  { name: 'Temple Prasad', path: '/dashboard/prasad', icon: Sparkles },
  { name: 'Wellness Academy', path: '/dashboard/wellness', icon: GraduationCap },
];

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/40 dark:bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-zinc-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex flex-col',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white leading-none">
                  Paryatanam
                </span>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Admin Console
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive: linkActive }) =>
                  cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                    (isActive || linkActive)
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                      : 'text-zinc-600 dark:text-slate-400 hover:bg-zinc-100/70 dark:hover:bg-slate-800/50 hover:text-zinc-900 dark:hover:text-slate-100'
                  )
                }
              >
                <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 dark:text-slate-500')} />

                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate tracking-tight">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
