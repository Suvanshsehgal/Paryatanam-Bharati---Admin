import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import { marketplaceApi } from '../api/marketplaceApi';
import { travelApi } from '../api/travelApi';
import { wellnessApi } from '../api/wellnessApi';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/formatters';

// The statuses each kind of record can be set to. The backend checks every
// change against its own rules, so an invalid choice shows the reason.
const TABS = [
  {
    key: 'orders',
    label: 'Shop Orders',
    statuses: ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
    hasPayment: true,
  },
  {
    key: 'travel',
    label: 'Tour Bookings',
    statuses: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    hasPayment: false,
  },
  {
    key: 'wellness',
    label: 'Wellness Bookings',
    statuses: ['CONFIRMED', 'COMPLETED', 'CANCELLED'],
    hasPayment: false,
  },
];

const PAYMENT_STATUSES = ['PENDING', 'PAID', 'PAY_ON_COLLECTION', 'FAILED', 'REFUNDED'];

const pretty = (value) => (value ? String(value).replace(/_/g, ' ').toLowerCase() : '—');

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Each list comes back in a slightly different shape, so every record is turned
// into the same row before it reaches the table.
const toRow = (kind, raw) => {
  if (kind === 'orders') {
    const items = Array.isArray(raw.items) ? raw.items : [];
    const first = items[0]?.product_name || 'Order';
    return {
      id: raw.id,
      kind,
      reference: raw.order_reference || raw.id,
      customer: raw.user?.name || raw.customer_name || '—',
      title: items.length > 1 ? `${first} +${items.length - 1} more` : first,
      status: raw.status,
      payment: raw.payment_status,
      amount: raw.total_amount,
      date: raw.created_at,
    };
  }
  if (kind === 'travel') {
    return {
      id: raw.id,
      kind,
      reference: raw.booking_reference || raw.id,
      customer: raw.user?.name || raw.user_name || '—',
      title: raw.tour?.title || raw.tour_title || '—',
      status: raw.status,
      payment: null,
      amount: raw.total_amount,
      date: raw.created_at,
    };
  }
  return {
    id: raw.id,
    kind,
    reference: raw.booking_reference || String(raw.id || '').slice(0, 8),
    customer: raw.user?.name || raw.user_name || '—',
    title: raw.service?.name || raw.service_name || '—',
    status: raw.status,
    payment: null,
    amount: raw.total_amount ?? raw.price,
    date: raw.created_at,
  };
};

const loadRows = async (kind) => {
  if (kind === 'orders') {
    const rows = await marketplaceApi.getOrders({ limit: 100 });
    return rows.map((r) => toRow(kind, r));
  }
  if (kind === 'travel') {
    const rows = await travelApi.getAdminBookings({ limit: 100 });
    return rows.map((r) => toRow(kind, r));
  }
  const result = await wellnessApi.getAdminBookings({ limit: 100 });
  return (result.data || []).map((r) => toRow(kind, r));
};

export const OrderTrackingPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabKey, setTabKey] = useState('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editing, setEditing] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPayment, setNewPayment] = useState('');

  const tab = TABS.find((t) => t.key === tabKey);

  const { data: rows = [], isLoading, isError, error } = useQuery({
    queryKey: ['order-tracking', tabKey],
    queryFn: () => loadRows(tabKey),
    staleTime: 30 * 1000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['order-tracking'] });

  const statusMutation = useMutation({
    mutationFn: ({ kind, id, status }) => {
      if (kind === 'orders') return marketplaceApi.updateOrderStatus(id, status);
      if (kind === 'travel') return travelApi.updateBookingStatus(id, status);
      return wellnessApi.updateBookingStatus(id, status);
    },
    onSuccess: (_, vars) => {
      toast.success('Status updated', `Now ${pretty(vars.status)}.`);
      refresh();
    },
    onError: (err) => toast.error('Could not update status', err.detail || err.message),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, paymentStatus }) => marketplaceApi.updateOrderPaymentStatus(id, paymentStatus),
    onSuccess: (_, vars) => {
      toast.success('Payment status updated', `Now ${pretty(vars.paymentStatus)}.`);
      refresh();
    },
    onError: (err) => toast.error('Could not update payment', err.detail || err.message),
  });

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
      if (!q) return true;
      return [row.reference, row.customer, row.title].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  const openEditor = (row) => {
    setEditing(row);
    setNewStatus(row.status);
    setNewPayment(row.payment || '');
  };

  const closeEditor = () => {
    if (statusMutation.isPending || paymentMutation.isPending) return;
    setEditing(null);
  };

  const saveStatus = () => {
    if (!editing || newStatus === editing.status) return;
    statusMutation.mutate(
      { kind: editing.kind, id: editing.id, status: newStatus },
      { onSuccess: () => setEditing((cur) => (cur ? { ...cur, status: newStatus } : cur)) }
    );
  };

  const savePayment = () => {
    if (!editing || !newPayment || newPayment === editing.payment) return;
    paymentMutation.mutate(
      { id: editing.id, paymentStatus: newPayment },
      { onSuccess: () => setEditing((cur) => (cur ? { ...cur, payment: newPayment } : cur)) }
    );
  };

  const busy = statusMutation.isPending || paymentMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order Tracking</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Follow every shop order and booking, and update its status and payment status.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTabKey(t.key);
              setStatusFilter('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tabKey === t.key
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, customer or item"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="ALL">All statuses</option>
          {tab.statuses.map((s) => (
            <option key={s} value={s}>
              {pretty(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              {tab.hasPayment && <th className="px-4 py-3">Payment</th>}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-rose-600">
                  Could not load this list. {error?.detail || error?.message || ''}
                </td>
              </tr>
            )}
            {!isLoading && !isError && visibleRows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Nothing matches these filters.
                </td>
              </tr>
            )}
            {visibleRows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                <td className="px-4 py-3">{row.customer}</td>
                <td className="px-4 py-3 max-w-[220px] truncate">{row.title}</td>
                <td className="px-4 py-3">{formatDate(row.date)}</td>
                <td className="px-4 py-3">{row.amount != null ? formatCurrency(row.amount) : '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                {tab.hasPayment && <td className="px-4 py-3">{pretty(row.payment)}</td>}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEditor(row)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={Boolean(editing)}
        onClose={closeEditor}
        title={editing ? `Update ${editing.reference}` : 'Update'}
        subtitle={editing ? `${editing.customer} • ${editing.title}` : ''}
      >
        {editing && (
          <div className="space-y-6">
            <section className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Order status</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={editing.status} />
                <span className="text-xs text-slate-400">current</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                >
                  {tab.statuses.map((s) => (
                    <option key={s} value={s}>
                      {pretty(s)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={saveStatus}
                  disabled={busy || newStatus === editing.status}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {statusMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save status
                </button>
              </div>
              {newStatus === 'CANCELLED' && editing.status !== 'CANCELLED' && (
                <p className="text-xs text-rose-600">Cancelling tells the customer and returns stock where it was taken.</p>
              )}
            </section>

            {tab.hasPayment && (
              <section className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Payment status</p>
                <div className="flex items-center gap-2 text-sm">
                  <span>{pretty(editing.payment)}</span>
                  <span className="text-xs text-slate-400">current</span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={newPayment}
                    onChange={(e) => setNewPayment(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                  >
                    <option value="" disabled>
                      Choose a payment status
                    </option>
                    {PAYMENT_STATUSES.map((p) => (
                      <option key={p} value={p}>
                        {pretty(p)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={savePayment}
                    disabled={busy || !newPayment || newPayment === editing.payment}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2"
                  >
                    {paymentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save payment
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
