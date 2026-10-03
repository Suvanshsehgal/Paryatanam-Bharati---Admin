import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, Flag, Search, ShieldCheck, UserCog } from 'lucide-react';
import { oversightApi } from '../api/oversightApi';
import { DataTable } from '../components/common/DataTable';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReportIssueModal } from '../components/oversight/ReportIssueModal';
import { ACTIVITY_MODULES } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const StatTile = ({ icon: Icon, label, value, tone }) => (
  <div className="bg-white dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-black text-zinc-900 dark:text-white">{value ?? '—'}</p>
    </div>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? formatDate(value) : date.toLocaleString();
};

export const ActivityMonitorPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [actorRole, setActorRole] = useState('');
  const [module, setModule] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  const { data: summary } = useQuery({
    queryKey: ['oversight', 'summary'],
    queryFn: () => oversightApi.getActivitySummary(),
    staleTime: 30 * 1000,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['oversight', 'activity', page, limit, actorRole, module, search],
    queryFn: () => oversightApi.getActivity({ page, limit, actorRole, module, search }),
    staleTime: 15 * 1000,
  });

  const columns = [
    {
      header: 'When',
      accessorKey: 'created_at',
      cell: (row) => <span className="text-xs text-zinc-500 whitespace-nowrap">{formatDateTime(row.created_at)}</span>,
    },
    {
      header: 'Performed By',
      accessorKey: 'actor_name',
      cell: (row) => (
        <div className="space-y-1">
          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{row.actor_name || 'Unknown'}</div>
          <StatusBadge status={row.actor_role} className="text-[10px] py-0 px-2" />
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'summary',
      cell: (row) => (
        <div>
          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{row.summary}</div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
            {row.http_method} {row.path.replace(/^\/api\/v1/, '')}
          </div>
        </div>
      ),
    },
    {
      header: 'Module',
      accessorKey: 'module',
      cell: (row) => <span className="text-xs capitalize">{row.module}</span>,
    },
    {
      header: '',
      key: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelected(row)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-800"
          >
            Details
          </button>
          {row.actor_role !== 'SUPER_ADMIN' && (
            <button
              onClick={() => setReportTarget(row)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40 flex items-center space-x-1"
            >
              <Flag className="w-3 h-3" />
              <span>Report</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Admin Activity Monitor</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Every change made through the admin portal, with who made it and in which role.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={Activity} label="Total actions" value={summary?.total_actions} tone="bg-orange-50 text-orange-600 dark:bg-orange-950/50" />
        <StatTile icon={UserCog} label="By Admins" value={summary?.admin_actions} tone="bg-sky-50 text-sky-600 dark:bg-sky-950/50" />
        <StatTile icon={Clock} label="Last 24 hours" value={summary?.actions_last_24h} tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" />
        <StatTile icon={ShieldCheck} label="Open reports" value={summary?.open_reports} tone="bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/50" />
      </div>

      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by action, path or admin..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <select
          value={actorRole}
          onChange={(e) => {
            setActorRole(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
        >
          <option value="">All performers</option>
          <option value="ADMIN">Admin actions</option>
          <option value="SUPER_ADMIN">Super Admin actions</option>
          <option value="OWNER">Owner actions</option>
        </select>
        <select
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
        >
          <option value="">All modules</option>
          {ACTIVITY_MODULES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {isError ? (
        <ErrorState description={error?.message} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          pagination={data?.pagination || { page, limit, total_records: 0, total_pages: 1 }}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          isLoading={isLoading}
          emptyTitle="No admin activity yet"
          emptyDescription="Changes made through the admin portal will appear here."
        />
      )}

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.summary || 'Activity detail'}
        subtitle={selected ? `${selected.actor_name || 'Unknown'} · ${formatDateTime(selected.created_at)}` : ''}
      >
        {selected && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-zinc-400 font-semibold uppercase text-[10px]">Performed by</p>
                <p className="font-semibold">{selected.actor_name} ({selected.actor_email})</p>
                <StatusBadge status={selected.actor_role} className="mt-1 text-[10px]" />
              </div>
              <div>
                <p className="text-zinc-400 font-semibold uppercase text-[10px]">Request</p>
                <p className="font-mono break-all">
                  {selected.http_method} {selected.path}
                </p>
                <p className="text-zinc-500 mt-1">HTTP {selected.status_code}</p>
              </div>
            </div>
            <div>
              <p className="text-zinc-400 font-semibold uppercase text-[10px] mb-1">Submitted changes</p>
              {selected.changes ? (
                <pre className="bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-xl p-3 overflow-auto max-h-72 text-[11px]">
                  {JSON.stringify(selected.changes, null, 2)}
                </pre>
              ) : (
                <p className="text-zinc-500">No request body (e.g. publish, approve or delete action).</p>
              )}
            </div>
            {selected.actor_role !== 'SUPER_ADMIN' && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setReportTarget(selected);
                    setSelected(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center space-x-1.5"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report this to the Admin</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ReportIssueModal
        isOpen={Boolean(reportTarget)}
        activity={reportTarget}
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
};
