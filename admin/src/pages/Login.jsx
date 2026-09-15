import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore, checkIsAdmin } from '../store/useAuthStore';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { Eye, EyeOff, Lock, Mail, Loader2, Compass, Sun, Moon, ShieldAlert } from 'lucide-react';
import { ToastContainer } from '../components/common/ToastContainer';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/access-denied', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await authApi.login(values.email, values.password);

      // Support live backend schema response: response.data.session.access_token & response.data.user
      const resData = response?.data || response;

      const token =
        resData?.session?.access_token ||
        resData?.access_token ||
        resData?.token ||
        response?.access_token;

      const user =
        resData?.user ||
        response?.user;

      if (!token) {
        throw new Error('Authentication failed: Bearer token was missing from backend response.');
      }

      if (!user) {
        throw new Error('Authentication failed: User profile object was missing from backend response.');
      }

      login(user, token);

      const hasAdminPrivileges = checkIsAdmin(user);

      if (!hasAdminPrivileges) {
        toast.error('Access Denied', `Account '${user.email || values.email}' does not possess ADMIN privileges.`);
        navigate('/access-denied', { replace: true });
      } else {
        toast.success('Welcome Back', `Logged in successfully as ${user.name || user.email || 'Admin'}`);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const detail = err.detail || err.message || 'Invalid email or password credentials.';
      setApiError(detail);
      toast.error('Authentication Failed', detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-zinc-50 dark:bg-slate-950 text-zinc-900 dark:text-zinc-100 font-sans relative">
      <ToastContainer />

      {/* Theme Toggle Floating Button */}
      <div className="absolute top-6 right-6 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Left Split: Minimal Soft Hero Branding */}
      <div className="lg:w-6/12 relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-orange-50 via-zinc-50 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-zinc-200/60 dark:border-slate-800/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Paryatanam Bharati</h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Admin Governance Portal</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
            Digital Tourism, Heritage & Marketplace Administration
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Centralized management for dynamic home layouts, vendor moderation, UNESCO destinations, divine prasad offerings, and skill academies.
          </p>
        </div>

        <div className="text-xs text-zinc-400">
          © 2026 Government of India • Paryatanam Admin
        </div>
      </div>

      {/* Right Split: Pure Backend Form */}
      <div className="lg:w-6/12 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex lg:hidden w-10 h-10 rounded-xl bg-orange-500 items-center justify-center text-white shadow-sm mb-2">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Admin Sign In</h2>
            <p className="text-xs text-zinc-500">Access the admin management console</p>
          </div>

          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="admin@paryatanam.gov.in"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-zinc-600 dark:text-zinc-400">Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
