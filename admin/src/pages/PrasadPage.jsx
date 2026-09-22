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
  Navigation,
  User,
  Calendar
} from 'lucide-react';

export const PrasadPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('shrines');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Modals state
  const [isTempleModalOpen, setIsTempleModalOpen] = useState(false);
  const [activeOfferingTemple, setActiveOfferingTemple] = useState(null);
  const [activeMediaTemple, setActiveMediaTemple] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);

  // Temple Form
  const [templeForm, setTempleForm] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    region: 'NORTH_INDIA',
    latitude: '',
    longitude: '',
    open_time: '',
    close_time: '',
    is_featured: false,
    is_active: true,
  });

  // Offering Form
  const [offeringForm, setOfferingForm] = useState({
    name: '',
    short_description: '',
    price: '',
    items_count: '',
    daily_capacity: '',
    image_url: '',
    is_featured: false,
    is_active: true,
  });

  // Queries
  const { data: temples, isLoading: loadingTemples } = useQuery({
    queryKey: ['temples'],
    queryFn: () => prasadApi.getTemples(),
  });

  const { data: offerings, isLoading: loadingOfferings } = useQuery({
    queryKey: ['offerings'],
    queryFn: () => prasadApi.getOfferings(),
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['prasadOrders', orderStatusFilter],
    queryFn: () => prasadApi.getPrasadOrders({ status: orderStatusFilter }),
  });

  // Mutations
  const createTempleMutation = useMutation({
    mutationFn: async (data) => {
      return await prasadApi.createTemple(data);
    },
    onSuccess: () => {
      toast.success('Temple Shrine Registered', 'New sacred shrine added as Draft.');
      queryClient.invalidateQueries({ queryKey: ['temples'] });
      setIsTempleModalOpen(false);
    },
    onError: (err) => toast.error('Creation Failed', err.detail || err.message),
  });

  const publishTempleMutation = useMutation({
    mutationFn: async (id) => prasadApi.publishTemple(id),
    onSuccess: () => {
      toast.success('Temple Published', 'Temple is now live.');
      queryClient.invalidateQueries({ queryKey: ['temples'] });
    },
    onError: (err) => toast.error('Publish Failed', err.detail || err.message),
  });

  const addOfferingMutation = useMutation({
    mutationFn: async ({ templeId, data }) => {
      return await prasadApi.addOffering(templeId, data);
    },
    onSuccess: () => {
      toast.success('Offering Added', 'Prasadam offering pack added as Draft.');
      queryClient.invalidateQueries({ queryKey: ['offerings'] });
      setActiveOfferingTemple(null);
    },
    onError: (err) => toast.error('Add Offering Failed', err.detail || err.message),
  });

  const publishOfferingMutation = useMutation({
    mutationFn: async (id) => prasadApi.publishOffering(id),
    onSuccess: () => {
      toast.success('Offering Published', 'Offering is now live.');
      queryClient.invalidateQueries({ queryKey: ['offerings'] });
    },
    onError: (err) => toast.error('Publish Failed', err.detail || err.message),
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async ({ id, file }) => prasadApi.uploadTempleMedia(id, file),
    onSuccess: () => {
      toast.success('Media Uploaded', 'Temple photo uploaded successfully.');
      queryClient.invalidateQueries({ queryKey: ['temples'] });
      setActiveMediaTemple(null);
      setMediaFile(null);
    },
    onError: (err) => toast.error('Upload Failed', err.detail || err.message),
  });

  const handleSaveTemple = (e) => {
    e.preventDefault();
    const payload = { ...templeForm };
    if (!payload.open_time) delete payload.open_time;
    else if (payload.open_time.length === 5) payload.open_time += ':00';

    if (!payload.close_time) delete payload.close_time;
    else if (payload.close_time.length === 5) payload.close_time += ':00';
    
    createTempleMutation.mutate(payload);
  };

  const handleSaveOffering = (e) => {
    e.preventDefault();
    if (!activeOfferingTemple) return;
    addOfferingMutation.mutate({ templeId: activeOfferingTemple.id, data: offeringForm });
  };

  // Offering columns
  const offeringColumns = [
    {
      header: 'Offering Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          {row?.image_url && (
            <img src={row.image_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-800" />
          )}
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
        </div>
      ),
    },
    {
      header: 'Temple',
      accessorKey: 'temple_name',
      cell: (row) => <div className="text-xs text-slate-600 dark:text-slate-400">{row.temple?.name || 'N/A'}</div>,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: (row) => <span className="font-bold text-xs">{formatCurrency(row.price)}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'is_published',
      cell: (row) => <StatusBadge status={row.is_published ? 'APPROVED' : 'DRAFT'} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          {!row.is_published && (
            <button
              onClick={() => {
                if (!row.price || row.price <= 0) {
                  toast.error('Cannot publish', 'Offering price must be greater than 0.');
                  return;
                }
                publishOfferingMutation.mutate(row.id);
              }}
              disabled={publishOfferingMutation.isPending}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors border ${
                !row.price || row.price <= 0
                  ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed'
                  : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              Publish
            </button>
          )}
        </div>
      ),
    },
  ];

  // Order columns
  const orderColumns = [
    {
      header: 'Booking Reference',
      accessorKey: 'booking_reference',
      cell: (order) => (
        <div>
          <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{order.booking_reference}</span>
          <p className="text-[11px] text-slate-500">{formatDate(order.created_at)}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'user.name',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{row?.user?.name || 'Customer'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Center & Service',
      cell: (row) => (
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{row?.service?.name || 'Treatment Service'}</div>
          <div className="text-[11px] text-slate-400">{row?.provider?.name || 'Wellness Center'}</div>
        </div>
      ),
    },
    {
      header: 'Appointment Date',
      accessorKey: 'booking_date',
      cell: (row) => (
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <div className="font-semibold flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-orange-500" />
            <span>{row?.booking_date || 'N/A'}</span>
          </div>
          <div className="text-[10px] text-slate-400">{row?.start_time || 'Scheduled Slot'}{row?.end_time ? ` - ${row.end_time}` : ''}</div>
        </div>
      ),
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
            onClick={() => setActiveTab('offerings')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'offerings'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Offerings ({offerings?.length || 0})
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
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={temple.is_published ? 'APPROVED' : 'DRAFT'} />
                        {!temple.is_published && (
                          <button
                            onClick={() => {
                              // Backend strict requirement check
                              const hasImages = temple.media && temple.media.length > 0;
                              if (!temple.city || !temple.state || !temple.description || !hasImages) {
                                toast.error(
                                  'Cannot publish yet', 'Please edit the temple to add a City, State, Description, and upload at least one Photo.'
                                );
                                return;
                              }
                              publishTempleMutation.mutate(temple.id);
                            }}
                            disabled={publishTempleMutation.isPending}
                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                              !temple.city || !temple.state || !temple.description || !temple.media || temple.media.length === 0
                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                          >
                            Publish
                          </button>
                        )}
                      </div>
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
                        <span>{temple.open_time || 'N/A'} - {temple.close_time || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      GPS: {temple.latitude}, {temple.longitude}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveMediaTemple(temple)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400 hover:bg-sky-100 transition-colors flex items-center space-x-1 border border-sky-200 dark:border-sky-800/60"
                      >
                        <span>Media</span>
                      </button>
                      <button
                        onClick={() => setActiveOfferingTemple(temple)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400 hover:bg-orange-100 transition-colors flex items-center space-x-1 border border-orange-200 dark:border-orange-800/60"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Offering</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Offerings */}
      {activeTab === 'offerings' && (
        <div className="space-y-4">
          <DataTable
            columns={offeringColumns}
            data={offerings || []}
            isLoading={loadingOfferings}
            emptyTitle="No offerings found"
            emptyDescription="No prasadam offerings registered."
          />
        </div>
      )}

      {/* TAB 3: Prasadam Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Region</label>
              <select
                value={templeForm.region}
                onChange={(e) => setTempleForm({ ...templeForm, region: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value="NORTH_INDIA">North India</option>
                <option value="SOUTH_INDIA">South India</option>
                <option value="EAST_INDIA">East India</option>
                <option value="WEST_INDIA">West India</option>
                <option value="CENTRAL_INDIA">Central India</option>
                <option value="NORTHEAST_INDIA">Northeast India</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text" value={templeForm.city}
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
                <option value="">-- Select State --</option> {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Open Time</label>
              <input
                type="time"
                value={templeForm.open_time}
                onChange={(e) => setTempleForm({ ...templeForm, open_time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Close Time</label>
              <input
                type="time"
                value={templeForm.close_time}
                onChange={(e) => setTempleForm({ ...templeForm, close_time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
            <textarea value={templeForm.description}
              onChange={(e) => setTempleForm({ ...templeForm, description: e.target.value })}
              placeholder="Full historical and spiritual description of the temple..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              rows={3}
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

      {/* Upload Media Modal */}
      <Modal
        isOpen={Boolean(activeMediaTemple)}
        onClose={() => { setActiveMediaTemple(null); setMediaFile(null); }}
        title="Upload Temple Photo"
        subtitle={`Shrine: ${activeMediaTemple?.name}`}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!mediaFile) return;
          uploadMediaMutation.mutate({ id: activeMediaTemple.id, file: mediaFile });
        }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Image File</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setMediaFile(e.target.files[0])}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveMediaTemple(null); setMediaFile(null); }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMediaMutation.isPending || !mediaFile}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              {uploadMediaMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Upload Photo</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

