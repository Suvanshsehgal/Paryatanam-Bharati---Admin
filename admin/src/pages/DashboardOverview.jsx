import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import { marketplaceApi } from '../api/marketplaceApi';
import { travelApi } from '../api/travelApi';
import { prasadApi } from '../api/prasadApi';
import { wellnessApi } from '../api/wellnessApi';
import {
  Users,
  ShoppingBag,
  MapPin,
  Sparkles,
  GraduationCap,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';

export const DashboardOverview = () => {
  const navigate = useNavigate();

  const { data: usersRes } = useQuery({
    queryKey: ['users', 1, ''],
    queryFn: () => usersApi.getUsers({ page: 1, limit: 100 }),
  });

  const { data: pendingProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['pendingProducts'],
    queryFn: () => marketplaceApi.getPendingProducts(),
  });

  const { data: pendingTours, isLoading: loadingTours } = useQuery({
    queryKey: ['pendingTours'],
    queryFn: () => travelApi.getPendingTours(),
  });

  const { data: temples } = useQuery({
    queryKey: ['temples'],
    queryFn: () => prasadApi.getTemples(),
  });

  const { data: wellnessProviders } = useQuery({
    queryKey: ['wellnessProviders'],
    queryFn: () => wellnessApi.getProviders(),
  });

  const stats = [
    {
      title: 'Platform Users',
      value: usersRes?.pagination?.total_records ?? usersRes?.data?.length ?? 0,
      icon: Users,
      path: '/dashboard/users',
      subtitle: 'Registered accounts',
    },
    {
      title: 'Pending Products',
      value: pendingProducts?.length ?? 0,
      icon: ShoppingBag,
      path: '/dashboard/marketplace',
      subtitle: 'Awaiting moderation',
    },
    {
      title: 'Pending Tours',
      value: pendingTours?.filter((t) => !t.is_published)?.length ?? 0,
      icon: MapPin,
      path: '/dashboard/travel',
      subtitle: 'Circuits for approval',
    },
    {
      title: 'Active Shrines',
      value: temples?.length ?? 0,
      icon: Sparkles,
      path: '/dashboard/prasad',
      subtitle: 'Registered temples',
    },
    {
      title: 'Wellness Academies',
      value: wellnessProviders?.length ?? 0,
      icon: GraduationCap,
      path: '/dashboard/wellness',
      subtitle: 'Training institutes',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Soft Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Overview & Quick Actions
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Paryatanam Admin Governance Console — Manage moderation queues, SDUI home layouts, and vendor certifications.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(stat.path)}
              className="cursor-pointer bg-white dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800/80 rounded-2xl p-4 hover:border-orange-500/40 transition-all duration-200 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </div>

              <div className="mt-3">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{stat.title}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketplace Queue Preview */}
        <div className="bg-white dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Vendor Moderation Queue
              </h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/marketplace')}
              className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
            >
              View All
            </button>
          </div>

          {loadingProducts ? (
            <LoadingSkeleton count={2} />
          ) : !pendingProducts || pendingProducts.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No products pending review.</p>
          ) : (
            <div className="space-y-2.5">
              {pendingProducts.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-50/60 dark:bg-slate-800/40 border border-zinc-100 dark:border-slate-800"
                >
                  <img
                    src={product.primary_image}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold truncate text-zinc-800 dark:text-zinc-200">{product.name}</h4>
                    <p className="text-[11px] text-zinc-500">₹{product.price} • Stock: {product.stock_quantity}</p>
                  </div>
                  <StatusBadge status={product.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tours Preview */}
        <div className="bg-white dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pending Tour Package Approvals
              </h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/travel')}
              className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
            >
              View All
            </button>
          </div>

          {loadingTours ? (
            <LoadingSkeleton count={2} />
          ) : !pendingTours || pendingTours.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No tour packages pending approval.</p>
          ) : (
            <div className="space-y-2.5">
              {pendingTours.slice(0, 3).map((tour) => (
                <div
                  key={tour.id}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-50/60 dark:bg-slate-800/40 border border-zinc-100 dark:border-slate-800"
                >
                  <img
                    src={tour.cover_image}
                    alt={tour.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold truncate text-zinc-800 dark:text-zinc-200">{tour.title}</h4>
                    <p className="text-[11px] text-zinc-500">{tour.operator_name} • {tour.duration_days} Days</p>
                  </div>
                  <StatusBadge status={tour.is_published ? 'APPROVED' : 'PENDING'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
