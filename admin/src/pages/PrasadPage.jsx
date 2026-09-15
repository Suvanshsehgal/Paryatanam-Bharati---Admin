import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prasadApi } from '../api/prasadApi';
import { useToast } from '../context/ToastContext';
import { INDIAN_STATES } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { ImagePreviewUpload } from '../components/common/ImagePreviewUpload';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Sparkles,
  Plus,
  Clock,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  PackageCheck,
  Loader2,
  Navigation
} from 'lucide-react';

export const PrasadPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('shrines'); // 'shrines' | 'offerings' | 'orders'
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'DISPATCHED' | 'DELIVERED'

  // Modals state
  const [isTempleModalOpen, setIsTempleModalOpen] = useState(false);
  const [activeOfferingTemple, setActiveOfferingTemple] = useState(null);

  // Temple Form
  const [templeForm, setTempleForm] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    address: '',
    city: '',
    state: 'Punjab',
    country: 'India',
    region: 'NORTH_INDIA',
    latitude: 31.62,
    longitude: 74.8765,
    open_time: '03:00:00',
    close_time: '23:00:00',
    is_featured: true,
    is_published: true,
    is_active: true,
  });

  // Offering Form
  const [offeringForm, setOfferingForm] = useState({
    name: '',
    short_description: '',
    price: 150.0,
    items_count: 2,
    daily_capacity: 250,
    image_url: '',
    is_featured: true,
    is_published: true,
    is_active: true,
  });

  // Queries
  const { data: temples, isLoading: loadingTemples } = useQuery({
    queryKey: ['temples'],
    queryFn: () => prasadApi.getTemples(),
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['prasadOrders', orderStatusFilter],
    queryFn: () => prasadApi.getPrasadOrders({ status: orderStatusFilter }),
  });

  // Mutations
  const createTempleMutation = useMutation({
    mutationFn: (data) => prasadApi.createTemple(data),
    onSuccess: () => {
      toast.success('Temple Shrine Registered', 'New sacred shrine added to Prasad database.');
      queryClient.invalidateQueries({ queryKey: ['temples'] });
      setIsTempleModalOpen(false);
    },
    onError: (err) => toast.error('Creation Failed', err.detail || err.message),
  });

  const addOfferingMutation = useMutation({
    mutationFn: ({ templeId, data }) => prasadApi.addOffering(templeId, data),
    onSuccess: () => {
      toast.success('Offering Added', 'Prasadam offering pack added to temple.');
      queryClient.invalidateQueries({ queryKey: ['temples'] });
      setActiveOfferingTemple(null);
    },
    onError: (err) => toast.error('Add Offering Failed', err.detail || err.message),
  });

  const handleSaveTemple = (e) => {
    e.preventDefault();
    createTempleMutation.mutate(templeForm);
  };

  const handleSaveOffering = (e) => {
    e.preventDefault();
    if (!activeOfferingTemple) return;
    addOfferingMutation.mutate({ templeId: activeOfferingTemple.id, data: offeringForm });
  };

  // Order columns
  const orderColumns = [
    {
      header: 'Order Reference',
      accessorKey: 'order_number',
      cell: (order) => (
        <div>
          <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{order.order_number}</span>
          <p className="text-[11px] text-slate-500">{formatDate(order.created_at)}</p>
        </div>
      ),
    },
    {
      header: 'Customer Details',
      accessorKey: 'user_name',
      cell: (order) => (
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100">{order.user_name}</h4>
          <p className="text-xs text-slate-500 font-mono">{order.user_email}</p>
        </div>
      ),
    },
    {
      header: 'Temple Shrine & Pack',
      accessorKey: 'temple_name',
      cell: (order) => (
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{order.temple_name}</h4>
          <p className="text-xs text-slate-500">{order.offering_name} (x{order.quantity})</p>
        </div>
      ),
    },
    {
      header: 'Total Price',
      accessorKey: 'total_amount',
      cell: (order) => <span className="font-bold text-xs">{formatCurrency(order.total_amount)}</span>,
    },
    {
      header: 'Fulfillment Status',
      accessorKey: 'status',
      cell: (order) => <StatusBadge status={order.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Divine Prasad Shrines & Offerings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage sacred Indian temples, official prasadam items, and inspect fulfillment orders.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('shrines')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shrines'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Temple Shrines ({temples?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Prasadam Orders
          </button>
        </div>
      </div>

      {/* TAB 1: Temple Shrines */}
      {activeTab === 'shrines' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsTempleModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Temple Shrine</span>
            </button>
          </div>

          {loadingTemples ? (
            <LoadingSkeleton count={3} className="h-44" />
          ) : !temples || temples.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No shrines registered. Click 'Add Temple Shrine'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {temples.map((temple) => (
                <div
                  key={temple.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {temple.region || 'SACRED SHRINE'}
                      </span>
                      <StatusBadge status={temple.is_published ? 'APPROVED' : 'DRAFT'} />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{temple.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{temple.short_description}</p>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span>{temple.city}, {temple.state}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{temple.open_time} - {temple.close_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      GPS: {temple.latitude}, {temple.longitude}
                    </span>
                    <button
                      onClick={() => setActiveOfferingTemple(temple)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400 hover:bg-orange-100 transition-colors flex items-center space-x-1 border border-orange-200 dark:border-orange-800/60"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Offering</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Prasadam Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {['ALL', 'PENDING', 'DISPATCHED', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  orderStatusFilter === st
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <DataTable
            columns={orderColumns}
            data={orders || []}
            isLoading={loadingOrders}
            emptyTitle="No orders found"
            emptyDescription="No prasadam fulfillment orders matched your active filter."
          />
        </div>
      )}

      {/* Add Shrine Modal */}
      <Modal
        isOpen={isTempleModalOpen}
        onClose={() => setIsTempleModalOpen(false)}
        title="Add Temple Shrine"
        subtitle="Register new holy temple with GPS coordinates and daily visiting hours."
      >
        <form onSubmit={handleSaveTemple} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Temple Name</label>
            <input
              type="text"
              required
              value={templeForm.name}
              onChange={(e) =>
                setTempleForm({
                  ...templeForm,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              placeholder="e.g. Golden Temple (Sri Harmandir Sahib)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                required
                value={templeForm.city}
                onChange={(e) => setTempleForm({ ...templeForm, city: e.target.value })}
                placeholder="Amritsar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <select
                value={templeForm.state}
                onChange={(e) => setTempleForm({ ...templeForm, state: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS Coordinates Picker */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="any"
                required
                value={templeForm.latitude}
                onChange={(e) => setTempleForm({ ...templeForm, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="any"
                required
                value={templeForm.longitude}
                onChange={(e) => setTempleForm({ ...templeForm, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Short Summary</label>
            <input
              type="text"
              value={templeForm.short_description}
              onChange={(e) => setTempleForm({ ...templeForm, short_description: e.target.value })}
              placeholder="Sacred central gurdwara of Sikhism surrounded by Amrit Sarovar lake."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsTempleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTempleMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {createTempleMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Temple Shrine</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Offering Modal */}
      <Modal
        isOpen={Boolean(activeOfferingTemple)}
        onClose={() => setActiveOfferingTemple(null)}
        title="Add Prasadam Offering Pack"
        subtitle={`Shrine: ${activeOfferingTemple?.name}`}
      >
        <form onSubmit={handleSaveOffering} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Offering Name</label>
            <input
              type="text"
              required
              value={offeringForm.name}
              onChange={(e) => setOfferingForm({ ...offeringForm, name: e.target.value })}
              placeholder="e.g. Amritsar Karah Prasad Pack & Rumala Sahib"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={offeringForm.price}
                onChange={(e) => setOfferingForm({ ...offeringForm, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Items Count</label>
              <input
                type="number"
                value={offeringForm.items_count}
                onChange={(e) => setOfferingForm({ ...offeringForm, items_count: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Daily Cap</label>
              <input
                type="number"
                value={offeringForm.daily_capacity}
                onChange={(e) => setOfferingForm({ ...offeringForm, daily_capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <ImagePreviewUpload
            value={offeringForm.image_url}
            onChange={(url) => setOfferingForm({ ...offeringForm, image_url: url })}
            label="Prasadam Photo URL"
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveOfferingTemple(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addOfferingMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {addOfferingMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Offering Pack</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
