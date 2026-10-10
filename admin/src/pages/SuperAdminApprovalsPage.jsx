import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ClipboardCheck, Loader2, X } from 'lucide-react';
import { oversightApi } from '../api/oversightApi';
import { DataTable } from '../components/common/DataTable';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { useToast } from '../context/ToastContext';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '');

const TYPE_LABELS = {
  TEMPLE_REQUEST: 'Temple Request',
  PRODUCT_CERTIFICATION: 'GoAmrit Certification',
};

/**
 * Super Admin: one tab aggregating every pending decision an Admin alone
 * would otherwise handle on its own module page (temple addition requests,
 * GoAmrit certification requests, ...) so the Super Admin can directly
 * accept or reject each — the one place Super Admin acts above Admin
 * rather than just observing.
 */
export const SuperAdminApprovalsPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pendingActionId, setPendingActionId] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['oversight', 'approvals', page, limit],
    queryFn: () => oversightApi.getApprovals({ page, limit }),
    staleTime: 10 * 1000,
  });

  const decideMutation = useMutation({
    mutationFn: ({ type, id, decision }) => oversightApi.decideApproval({ type, id, decision }),
    onMutate: ({ id }) => setPendingActionId(id),
    onSuccess: (result, { decision }) => {
      toast.success(
        decision === 'ACCEPT' ? 'Accepted' : 'Rejected',
        `The request was ${decision === 'ACCEPT' ? 'accepted' : 'rejected'}.`
      );
      queryClient.invalidateQueries({ queryKey: ['oversight', 'approvals'] });
    },
    onError: (err) => toast.error('Action Failed', err.detail || err.message),
    onSettled: () => setPendingActionId(null),
  });

  const columns = [
    {
      header: 'Requested',
      accessorKey: 'requested_at',
      cell: (r) => <span className="text-xs text-zinc-500 whitespace-nowrap">{formatDateTime(r.requested_at)}</span>,
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (r) => <StatusBadge status={TYPE_LABELS[r.type] || r.type} className="text-[10px]" />,
    },
    {
      header: 'Request',
      accessorKey: 'title',
      cell: (r) => (
        <div>
          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{r.title}</div>
          <div className="text-[11px] text-zinc-500 line-clamp-1">{r.summary}</div>
        </div>
      ),
    },
    {
      header: 'Requested By',
      accessorKey: 'requested_by_name',
      cell: (r) => <span className="text-xs text-zinc-600 dark:text-zinc-300">{r.requested_by_name || '—'}</span>,
    },
    {
      header: '',
      key: 'actions',
      cell: (r) => {
        const isBusy = decideMutation.isPending && pendingActionId === r.id;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => decideMutation.mutate({ type: r.type, id: r.id, decision: 'REJECT' })}
              disabled={decideMutation.isPending}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 flex items-center space-x-1"
            >
              {isBusy && decideMutation.variables?.decision === 'REJECT' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>Reject</span>
            </button>
            <button
              onClick={() => decideMutation.mutate({ type: r.type, id: r.id, decision: 'ACCEPT' })}
              disabled={decideMutation.isPending}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center space-x-1"
            >
              {isBusy && decideMutation.variables?.decision === 'ACCEPT' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Accept</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-orange-600" />
          Admin Approvals
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Everything currently awaiting an Admin decision — temple addition requests and GoAmrit
          certification requests — in one place. Accepting or rejecting here applies the exact
          same action an Admin would take on the item's own page.
        </p>
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
          emptyTitle="Nothing pending"
          emptyDescription="There are no temple requests or certification requests awaiting a decision."
        />
      )}
    </div>
  );
};
