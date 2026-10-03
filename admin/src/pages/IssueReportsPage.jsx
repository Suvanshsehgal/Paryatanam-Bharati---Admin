import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Flag, Loader2, MessageSquareReply } from 'lucide-react';
import { oversightApi } from '../api/oversightApi';
import { DataTable } from '../components/common/DataTable';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReportIssueModal } from '../components/oversight/ReportIssueModal';
import { useToast } from '../context/ToastContext';
import { useAuthStore } from '../store/useAuthStore';
import { ISSUE_STATUSES } from '../utils/constants';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '');

/**
 * Super Admin: raise issues and follow the Admin's responses.
 * Admin: review issues raised by the Super Admin, acknowledge or resolve them.
 */
export const IssueReportsPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isReadOnly } = useAuthStore();
  const isSuperAdminView = isReadOnly;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [response, setResponse] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['oversight', 'reports', isSuperAdminView ? 'super' : 'admin', page, limit, status],
    queryFn: () =>
      isSuperAdminView
        ? oversightApi.getSuperAdminReports({ page, limit, status })
        : oversightApi.getAdminReports({ page, limit, status }),
    staleTime: 15 * 1000,
  });

  const handleMutation = useMutation({
    mutationFn: ({ id, newStatus }) =>
      oversightApi.handleReport(id, { status: newStatus, admin_response: response || null }),
    onSuccess: (updated) => {
      toast.success('Report Updated', `Marked as ${updated?.status?.toLowerCase()}.`);
      queryClient.invalidateQueries({ queryKey: ['oversight'] });
      setViewing(null);
    },
    onError: (err) => toast.error('Update Failed', err.detail || err.message),
  });

  const openReport = (report) => {
    setViewing(report);
    setResponse(report.admin_response || '');
  };

  const columns = [
    {
      header: 'Reported',
      accessorKey: 'created_at',
      cell: (r) => <span className="text-xs text-zinc-500 whitespace-nowrap">{formatDateTime(r.created_at)}</span>,
    },
    {
      header: 'Issue',
      accessorKey: 'title',
      cell: (r) => (
        <div>
          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{r.title}</div>
          <div className="text-[11px] text-zinc-500 line-clamp-1">{r.description}</div>
        </div>
      ),
    },
    {
      header: 'Severity',
      accessorKey: 'severity',
      cell: (r) => <StatusBadge status={r.severity} className="text-[10px]" />,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (r) => <StatusBadge status={r.status} className="text-[10px]" />,
    },
    {
      header: '',
      key: 'actions',
      cell: (r) => (
        <button
          onClick={() => openReport(r)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-800"
        >
          {isSuperAdminView || r.status === 'RESOLVED' ? 'View' : 'Respond'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {isSuperAdminView ? 'Issues Reported to Admin' : 'Super Admin Reports'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSuperAdminView
              ? 'Track issues you raised and the Admin team’s responses.'
              : 'Issues flagged by the Super Admin that need your review.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          >
            <option value="">All statuses</option>
            {ISSUE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {isSuperAdminView && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-orange-600 text-white hover:bg-orange-700 flex items-center space-x-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
          )}
        </div>
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
          emptyTitle="No reports"
          emptyDescription={
            isSuperAdminView ? 'Issues you report to the Admin team will appear here.' : 'Nothing has been reported.'
          }
        />
      )}

      <Modal
        isOpen={Boolean(viewing)}
        onClose={() => !handleMutation.isPending && setViewing(null)}
        title={viewing?.title || 'Report'}
        subtitle={
          viewing ? `Reported by ${viewing.reporter_name || 'Super Admin'} · ${formatDateTime(viewing.created_at)}` : ''
        }
      >
        {viewing && (
          <div className="space-y-4 text-xs">
            <div className="flex gap-2">
              <StatusBadge status={viewing.severity} className="text-[10px]" />
              <StatusBadge status={viewing.status} className="text-[10px]" />
              {viewing.module && <span className="text-zinc-500 capitalize self-center">Area: {viewing.module}</span>}
            </div>
            <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{viewing.description}</p>

            {viewing.activity && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800">
                <p className="text-[10px] font-semibold uppercase text-zinc-400 mb-1">Related admin action</p>
                <p className="font-semibold">{viewing.activity.summary}</p>
                <p className="text-zinc-500 mt-0.5">
                  {viewing.activity.actor_name} · {formatDateTime(viewing.activity.created_at)}
                </p>
              </div>
            )}

            {isSuperAdminView ? (
              <div>
                <p className="text-[10px] font-semibold uppercase text-zinc-400 mb-1">Admin response</p>
                {viewing.admin_response ? (
                  <p className="whitespace-pre-wrap">
                    {viewing.admin_response}
                    <span className="block text-zinc-500 mt-1">— {viewing.handled_by_name}</span>
                  </p>
                ) : (
                  <p className="text-zinc-500">No response yet.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1 flex items-center space-x-1">
                    <MessageSquareReply className="w-3.5 h-3.5" />
                    <span>Response to Super Admin</span>
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    maxLength={5000}
                    disabled={viewing.status === 'RESOLVED'}
                    className="w-full min-h-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="What was changed or why no change is needed..."
                  />
                </div>
                {viewing.status !== 'RESOLVED' && (
                  <div className="flex justify-end gap-2">
                    {viewing.status === 'OPEN' && (
                      <button
                        onClick={() => handleMutation.mutate({ id: viewing.id, newStatus: 'ACKNOWLEDGED' })}
                        disabled={handleMutation.isPending}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => handleMutation.mutate({ id: viewing.id, newStatus: 'RESOLVED' })}
                      disabled={handleMutation.isPending}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center space-x-1.5"
                    >
                      {handleMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ReportIssueModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
