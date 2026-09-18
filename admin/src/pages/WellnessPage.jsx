import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wellnessApi } from '../api/wellnessApi';
import { useToast } from '../context/ToastContext';
import { INDIAN_STATES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { ImagePreviewUpload } from '../components/common/ImagePreviewUpload';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  GraduationCap,
  Plus,
  Clock,
  Phone,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  Star,
  Edit,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  User,
  Check
} from 'lucide-react';

export const WellnessPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Active Supervision Tab
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'providers' | 'services' | 'bookings'

  // ---------------------------------------------------------------------------
  // 1. Categories State & Queries
  // ---------------------------------------------------------------------------
  const [catPage, setCatPage] = useState(1);
  const [catLimit, setCatLimit] = useState(10);
  const [isCreateCatOpen, setIsCreateCatOpen] = useState(false);
  const [isEditCatOpen, setIsEditCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deletingCat, setDeletingCat] = useState(null);

  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon_url: '',
    display_order: 0,
    is_active: true,
  });

  const { data: catRes, isLoading: loadingCats } = useQuery({
    queryKey: ['wellnessCategories', catPage, catLimit],
    queryFn: () => wellnessApi.getCategories({ page: catPage, limit: catLimit }),
  });

  // ---------------------------------------------------------------------------
  // 2. Providers State & Queries
  // ---------------------------------------------------------------------------
  const [provPage, setProvPage] = useState(1);
  const [provLimit, setProvLimit] = useState(10);
  const [provCity, setProvCity] = useState('');
  const [provState, setProvState] = useState('');
  const [provPublished, setProvPublished] = useState('');
  const [provActive, setProvActive] = useState('');
  const [provFeatured, setProvFeatured] = useState('');

  const [viewingProvId, setViewingProvId] = useState(null);
  const [isEditProvOpen, setIsEditProvOpen] = useState(false);
  const [isCreateProvOpen, setIsCreateProvOpen] = useState(false);
  const [editingProv, setEditingProv] = useState(null);
  const [deletingProv, setDeletingProv] = useState(null);

  const [provForm, setProvForm] = useState({
    name: '',
    city: '',
    state: 'Uttarakhand',
    country: 'India',
    address: '',
    pincode: '',
    phone: '',
    cover_image_url: '',
    short_description: '',
    description: '',
    rating: 4.5,
    is_featured: false,
    is_active: true,
    is_published: true,
  });

  const { data: provRes, isLoading: loadingProvs } = useQuery({
    queryKey: ['wellnessProviders', provPage, provLimit, provCity, provState, provPublished, provActive, provFeatured],
    queryFn: () =>
      wellnessApi.getProviders({
        page: provPage,
        limit: provLimit,
        city: provCity || undefined,
        state: provState || undefined,
        is_published: provPublished !== '' ? provPublished === 'true' : undefined,
        is_active: provActive !== '' ? provActive === 'true' : undefined,
        is_featured: provFeatured !== '' ? provFeatured === 'true' : undefined,
      }),
  });

  const { data: provDetail, isLoading: loadingProvDetail } = useQuery({
    queryKey: ['wellnessProviderDetail', viewingProvId],
    queryFn: () => wellnessApi.getProviderDetail(viewingProvId),
    enabled: !!viewingProvId,
  });

  // ---------------------------------------------------------------------------
  // 3. Services State & Queries
  // ---------------------------------------------------------------------------
  const [servPage, setServPage] = useState(1);
  const [servLimit, setServLimit] = useState(10);
  const [servCategoryId, setServCategoryId] = useState('');
  const [servProviderId, setServProviderId] = useState('');
  const [servPublished, setServPublished] = useState('');
  const [servActive, setServActive] = useState('');
  const [servFeatured, setServFeatured] = useState('');

  const [viewingServId, setViewingServId] = useState(null);
  const [isEditServOpen, setIsEditServOpen] = useState(false);
  const [isCreateServOpen, setIsCreateServOpen] = useState(false);
  const [editingServ, setEditingServ] = useState(null);
  const [deletingServ, setDeletingServ] = useState(null);

  const [servForm, setServForm] = useState({
    provider_id: '',
    category_id: '',
    name: '',
    slug: '',
    short_description: '',
    description: '',
    price: '',
    duration_minutes: '',
    is_featured: false,
    is_active: true,
    is_published: true,
  });

  const { data: servRes, isLoading: loadingServs } = useQuery({
    queryKey: ['wellnessServices', servPage, servLimit, servCategoryId, servProviderId, servPublished, servActive, servFeatured],
    queryFn: () =>
      wellnessApi.getServices({
        page: servPage,
        limit: servLimit,
        category_id: servCategoryId || undefined,
        provider_id: servProviderId || undefined,
        is_published: servPublished !== '' ? servPublished === 'true' : undefined,
        is_active: servActive !== '' ? servActive === 'true' : undefined,
        is_featured: servFeatured !== '' ? servFeatured === 'true' : undefined,
      }),
  });

  const { data: servDetail, isLoading: loadingServDetail } = useQuery({
    queryKey: ['wellnessServiceDetail', viewingServId],
    queryFn: () => wellnessApi.getServiceDetail(viewingServId),
    enabled: !!viewingServId,
  });

  // Fetch all categories & providers for selects
  const { data: allCategories } = useQuery({
    queryKey: ['allWellnessCategories'],
    queryFn: () => wellnessApi.getCategories({ page: 1, limit: 100 }),
  });

  const { data: allProviders } = useQuery({
    queryKey: ['allWellnessProviders'],
    queryFn: () => wellnessApi.getProviders({ page: 1, limit: 100 }),
  });

  // ---------------------------------------------------------------------------
  // 4. Bookings State & Queries
  // ---------------------------------------------------------------------------
  const [bookPage, setBookPage] = useState(1);
  const [bookLimit, setBookLimit] = useState(10);
  const [bookStatus, setBookStatus] = useState('');
  const [bookDate, setBookDate] = useState('');

  const [viewingBookId, setViewingBookId] = useState(null);
  const [statusBookItem, setStatusBookItem] = useState(null);
  const [targetStatus, setTargetStatus] = useState('CONFIRMED');

  const { data: bookRes, isLoading: loadingBooks } = useQuery({
    queryKey: ['wellnessBookings', bookPage, bookLimit, bookStatus, bookDate],
    queryFn: () =>
      wellnessApi.getAdminBookings({
        page: bookPage,
        limit: bookLimit,
        status: bookStatus || undefined,
        booking_date: bookDate || undefined,
      }),
  });

  const { data: bookDetail, isLoading: loadingBookDetail } = useQuery({
    queryKey: ['wellnessBookingDetail', viewingBookId],
    queryFn: () => wellnessApi.getBookingDetail(viewingBookId),
    enabled: !!viewingBookId,
  });

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  // Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data) => wellnessApi.createCategory(data),
    onSuccess: () => {
      toast.success('Category Created', 'Master wellness category registered successfully.');
      queryClient.invalidateQueries({ queryKey: ['wellnessCategories'] });
      setIsCreateCatOpen(false);
    },
    onError: (err) => toast.error('Category Error', err.detail || err.message),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => wellnessApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category Updated', 'Wellness category updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['wellnessCategories'] });
      setIsEditCatOpen(false);
    },
    onError: (err) => toast.error('Update Error', err.detail || err.message),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => wellnessApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category Deleted', 'Unused category removed.');
      queryClient.invalidateQueries({ queryKey: ['wellnessCategories'] });
      setDeletingCat(null);
    },
    onError: (err) => toast.error('Delete Error', err.detail || err.message),
  });

  // Provider Mutations
  const createProviderMutation = useMutation({
    mutationFn: (data) => wellnessApi.createProvider(data),
    onSuccess: () => {
      toast.success('Center Created', 'Wellness center registered successfully.');
      queryClient.invalidateQueries({ queryKey: ['wellnessProviders'] });
      queryClient.invalidateQueries({ queryKey: ['allWellnessProviders'] });
      setIsCreateProvOpen(false);
    },
    onError: (err) => toast.error('Creation Error', err.detail || err.message),
  });

  const updateProviderMutation = useMutation({
    mutationFn: ({ id, data }) => wellnessApi.updateProvider(id, data),
    onSuccess: () => {
      toast.success('Center Updated', 'Provider curation flags and details updated.');
      queryClient.invalidateQueries({ queryKey: ['wellnessProviders'] });
      setIsEditProvOpen(false);
    },
    onError: (err) => toast.error('Update Error', err.detail || err.message),
  });

  const publishProviderMutation = useMutation({
    mutationFn: (id) => wellnessApi.publishProvider(id),
    onSuccess: () => {
      toast.success('Center Published', 'Provider published on public platform.');
      queryClient.invalidateQueries({ queryKey: ['wellnessProviders'] });
    },
    onError: (err) => toast.error('Publish Error', err.detail || err.message),
  });

  const unpublishProviderMutation = useMutation({
    mutationFn: (id) => wellnessApi.unpublishProvider(id),
    onSuccess: () => {
      toast.success('Center Unpublished', 'Provider moved to draft state.');
      queryClient.invalidateQueries({ queryKey: ['wellnessProviders'] });
    },
    onError: (err) => toast.error('Unpublish Error', err.detail || err.message),
  });

  const deleteProviderMutation = useMutation({
    mutationFn: (id) => wellnessApi.deleteProvider(id),
    onSuccess: () => {
      toast.success('Center Deleted', 'Wellness provider removed.');
      queryClient.invalidateQueries({ queryKey: ['wellnessProviders'] });
      setDeletingProv(null);
    },
    onError: (err) => toast.error('Delete Error', err.detail || err.message),
  });

  // Service Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data) => wellnessApi.addService(data),
    onSuccess: () => {
      toast.success('Service Created', 'Wellness service added successfully.');
      queryClient.invalidateQueries({ queryKey: ['wellnessServices'] });
      setIsCreateServOpen(false);
    },
    onError: (err) => toast.error('Creation Error', err.detail || err.message),
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => wellnessApi.updateService(id, data),
    onSuccess: () => {
      toast.success('Service Updated', 'Service price and curation flags updated.');
      queryClient.invalidateQueries({ queryKey: ['wellnessServices'] });
      setIsEditServOpen(false);
    },
    onError: (err) => toast.error('Update Error', err.detail || err.message),
  });

  const publishServiceMutation = useMutation({
    mutationFn: (id) => wellnessApi.publishService(id),
    onSuccess: () => {
      toast.success('Service Published', 'Treatment service published on platform.');
      queryClient.invalidateQueries({ queryKey: ['wellnessServices'] });
    },
    onError: (err) => toast.error('Publish Error', err.detail || err.message),
  });

  const unpublishServiceMutation = useMutation({
    mutationFn: (id) => wellnessApi.unpublishService(id),
    onSuccess: () => {
      toast.success('Service Unpublished', 'Treatment service changed to draft.');
      queryClient.invalidateQueries({ queryKey: ['wellnessServices'] });
    },
    onError: (err) => toast.error('Unpublish Error', err.detail || err.message),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => wellnessApi.deleteService(id),
    onSuccess: () => {
      toast.success('Service Deleted', 'Treatment service deleted.');
      queryClient.invalidateQueries({ queryKey: ['wellnessServices'] });
      setDeletingServ(null);
    },
    onError: (err) => toast.error('Delete Error', err.detail || err.message),
  });

  // Booking Mutations
  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ id, status }) => wellnessApi.updateBookingStatus(id, status),
    onSuccess: () => {
      toast.success('Status Updated', `Booking status changed to ${targetStatus}.`);
      queryClient.invalidateQueries({ queryKey: ['wellnessBookings'] });
      setStatusBookItem(null);
    },
    onError: (err) => toast.error('Status Error', err.detail || err.message),
  });

  // ---------------------------------------------------------------------------
  // Column Definitions
  // ---------------------------------------------------------------------------

  // 1. Categories Columns
  const categoryColumns = [
    {
      header: 'Category Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold flex-shrink-0">
            {row.icon_url ? (
              <img src={row.icon_url} alt="" className="w-5 h-5 object-contain" />
            ) : (
              <Tag className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
            <div className="text-[11px] font-mono text-slate-400">{row.slug}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs line-clamp-2">{row.description || 'No description'}</p>
      ),
    },
    {
      header: 'Order',
      accessorKey: 'display_order',
      cell: (row) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400">#{row.display_order ?? 0}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (row) => <StatusBadge status={row.is_active ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingCat(row);
              setCatForm({
                name: row.name || '',
                slug: row.slug || '',
                description: row.description || '',
                icon_url: row.icon_url || '',
                display_order: row.display_order ?? 0,
                is_active: row.is_active ?? true,
              });
              setIsEditCatOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingCat(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // 2. Providers Columns
  const providerColumns = [
    {
      header: 'Center Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          {row.cover_image_url ? (
            <img src={row.cover_image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-orange-500" />
              <span>{row.city}, {row.state}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone / Contact',
      accessorKey: 'phone',
      cell: (row) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Curation & Rating',
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{row.rating ?? row.average_rating ?? '4.5'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {row.is_featured && (
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                FEATURED
              </span>
            )}
            {!row.is_active && (
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                DISABLED
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Publish Status',
      accessorKey: 'is_published',
      cell: (row) => <StatusBadge status={row.is_published ? 'APPROVED' : 'DRAFT'} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setViewingProvId(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingProv(row);
              setProvForm({
                name: row.name || '',
                city: row.city || '',
                state: row.state || 'Uttarakhand',
                country: row.country || 'India',
                address: row.address || '',
                pincode: row.pincode || '',
                phone: row.phone || '',
                cover_image_url: row.cover_image_url || '',
                short_description: row.short_description || '',
                description: row.description || '',
                rating: row.rating ?? row.average_rating ?? 4.5,
                is_featured: row.is_featured ?? false,
                is_active: row.is_active ?? true,
                is_published: row.is_published ?? true,
              });
              setIsEditProvOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Update Curation Flags"
          >
            <Edit className="w-4 h-4" />
          </button>
          {row.is_published ? (
            <button
              onClick={() => unpublishProviderMutation.mutate(row.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Unpublish Center"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => publishProviderMutation.mutate(row.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Publish Center"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setDeletingProv(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete Center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // 3. Services Columns
  const serviceColumns = [
    {
      header: 'Service Name',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{row.provider_name || 'Wellness Center'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category_name',
      cell: (row) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.category_name || 'General Wellness'}
        </span>
      ),
    },
    {
      header: 'Price & Duration',
      cell: (row) => (
        <div>
          <div className="font-extrabold text-xs text-orange-600 dark:text-orange-400">
            {formatCurrency(row.price)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{row.duration_minutes || 60} Mins</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Curation',
      cell: (row) => (
        <div className="flex items-center space-x-1">
          {row.is_featured && (
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              FEATURED
            </span>
          )}
          {!row.is_active && (
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              DISABLED
            </span>
          )}
          {row.is_active && !row.is_featured && (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'is_published',
      cell: (row) => <StatusBadge status={row.is_published ? 'APPROVED' : 'DRAFT'} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setViewingServId(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingServ(row);
              setServForm({
                provider_id: row.provider_id || '',
                category_id: row.category_id || '',
                name: row.name || '',
                slug: row.slug || '',
                short_description: row.short_description || '',
                description: row.description || '',
                price: row.price ?? '',
                duration_minutes: row.duration_minutes ?? '',
                is_featured: row.is_featured ?? false,
                is_active: row.is_active ?? true,
                is_published: row.is_published ?? true,
              });
              setIsEditServOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Service & Price"
          >
            <Edit className="w-4 h-4" />
          </button>
          {row.is_published ? (
            <button
              onClick={() => unpublishServiceMutation.mutate(row.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Unpublish Service"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => publishServiceMutation.mutate(row.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Publish Service"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setDeletingServ(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete Service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // 4. Bookings Columns
  const bookingColumns = [
    {
      header: 'Booking Ref',
      accessorKey: 'booking_reference',
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
            {row.booking_reference || row.id?.slice(0, 8)}
          </div>
          <div className="text-[10px] text-slate-400">
            {row.created_at ? new Date(row.created_at).toLocaleDateString() : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'User',
      accessorKey: 'user_name',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.user_name || row.user_email || 'Customer'}</div>
            <div className="text-[10px] text-slate-400">{row.user_phone || row.user_email || ''}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Center & Service',
      cell: (row) => (
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{row.service_name || 'Treatment Service'}</div>
          <div className="text-[11px] text-slate-400">{row.provider_name || 'Wellness Center'}</div>
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
            <span>{row.booking_date}</span>
          </div>
          <div className="text-[10px] text-slate-400">{row.slot_time || row.start_time || 'Scheduled Slot'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setViewingBookId(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setStatusBookItem(row);
              setTargetStatus(row.status === 'CONFIRMED' ? 'COMPLETED' : 'CONFIRMED');
            }}
            className="px-2.5 py-1 text-xs font-bold rounded-lg text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
          >
            Change Status
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Wellness & Healing Platform Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nationwide wellness center supervision, category curation, service pricing, and appointment bookings.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Master Categories
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'providers'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Wellness Centers
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'services'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Treatment Services
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Platform Bookings
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: MASTER CATEGORIES */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Wellness Master Categories List
            </h2>
            <button
              onClick={() => {
                setCatForm({
                  name: '',
                  slug: '',
                  description: '',
                  icon_url: '',
                  display_order: 0,
                  is_active: true,
                });
                setIsCreateCatOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>

          <DataTable
            columns={categoryColumns}
            data={catRes?.data || []}
            pagination={catRes?.pagination || { page: 1, limit: 10, total_records: 0, total_pages: 1 }}
            onPageChange={setCatPage}
            onLimitChange={setCatLimit}
            isLoading={loadingCats}
            emptyTitle="No wellness categories found"
            emptyDescription="Create standard categories like Yoga, Ayurveda, Naturopathy, or Meditation."
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: WELLNESS CENTERS (PROVIDERS) SUPERVISION */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[160px]">
              <input
                type="text"
                placeholder="Filter by city..."
                value={provCity}
                onChange={(e) => setProvCity(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="w-40">
              <select
                value={provState}
                onChange={(e) => setProvState(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <select
                value={provPublished}
                onChange={(e) => setProvPublished(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value="">Status: All</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>

            <div className="w-36">
              <select
                value={provFeatured}
                onChange={(e) => setProvFeatured(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value="">Curated: All</option>
                <option value="true">Featured</option>
                <option value="false">Regular</option>
              </select>
            </div>

            <button
              onClick={() => {
                setProvForm({
                  name: '',
                  city: '',
                  state: 'Uttarakhand',
                  country: 'India',
                  address: '',
                  pincode: '',
                  phone: '',
                  cover_image_url: '',
                  short_description: '',
                  description: '',
                  rating: 4.5,
                  is_featured: false,
                  is_active: true,
                  is_published: true,
                });
                setIsCreateProvOpen(true);
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md flex items-center space-x-1.5 ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Register Center</span>
            </button>
          </div>

          <DataTable
            columns={providerColumns}
            data={provRes?.data || []}
            pagination={provRes?.pagination || { page: 1, limit: 10, total_records: 0, total_pages: 1 }}
            onPageChange={setProvPage}
            onLimitChange={setProvLimit}
            isLoading={loadingProvs}
            emptyTitle="No wellness centers registered"
            emptyDescription="No institutes match the selected city/state or publish filter."
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: WELLNESS TREATMENT SERVICES SUPERVISION */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
            <div className="w-48">
              <select
                value={servCategoryId}
                onChange={(e) => setServCategoryId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value="">All Categories</option>
                {allCategories?.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-56">
              <select
                value={servProviderId}
                onChange={(e) => setServProviderId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 truncate"
              >
                <option value="">All Centers</option>
                {allProviders?.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <select
                value={servPublished}
                onChange={(e) => setServPublished(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value="">Status: All</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>

            <button
              onClick={() => {
                setServForm({
                  provider_id: allProviders?.data?.[0]?.id || '',
                  category_id: allCategories?.data?.[0]?.id || '',
                  name: '',
                  slug: '',
                  short_description: '',
                  description: '',
                  price: '',
                  duration_minutes: 60,
                  is_featured: false,
                  is_active: true,
                  is_published: true,
                });
                setIsCreateServOpen(true);
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md flex items-center space-x-1.5 ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>

          <DataTable
            columns={serviceColumns}
            data={servRes?.data || []}
            pagination={servRes?.pagination || { page: 1, limit: 10, total_records: 0, total_pages: 1 }}
            onPageChange={setServPage}
            onLimitChange={setServLimit}
            isLoading={loadingServs}
            emptyTitle="No wellness services found"
            emptyDescription="No services listed under the selected category or provider filter."
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 4: PLATFORM-WIDE BOOKINGS SUPERVISION */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
            <div className="w-44">
              <select
                value={bookStatus}
                onChange={(e) => setBookStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="w-44">
              <input
                type="date"
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            {bookDate && (
              <button
                onClick={() => setBookDate('')}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                Clear Date
              </button>
            )}
          </div>

          <DataTable
            columns={bookingColumns}
            data={bookRes?.data || []}
            pagination={bookRes?.pagination || { page: 1, limit: 10, total_records: 0, total_pages: 1 }}
            onPageChange={setBookPage}
            onLimitChange={setBookLimit}
            isLoading={loadingBooks}
            emptyTitle="No platform bookings found"
            emptyDescription="Appointment bookings across clinics will appear here."
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS & DRAWERS */}
      {/* ===================================================================== */}

      {/* 1. Create Category Modal */}
      <Modal
        isOpen={isCreateCatOpen}
        onClose={() => setIsCreateCatOpen(false)}
        title="Create Master Wellness Category"
        subtitle="Define top-level classification for platform wellness services."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCategoryMutation.mutate({
              ...catForm,
              display_order: Number(catForm.display_order) || 0,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
            <input
              type="text"
              required
              value={catForm.name}
              onChange={(e) =>
                setCatForm({
                  ...catForm,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              placeholder="e.g. Yoga & Holistic Healing"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                placeholder="yoga-holistic-healing"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
              <input
                type="number"
                value={catForm.display_order}
                onChange={(e) => setCatForm({ ...catForm, display_order: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              placeholder="Traditional institutes offering certified yoga training and retreats..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <ImagePreviewUpload
            value={catForm.icon_url}
            onChange={(url) => setCatForm({ ...catForm, icon_url: url })}
            label="Category Icon / Asset URL"
          />

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="catActiveCheck"
              checked={catForm.is_active}
              onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="catActiveCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active & Enabled on Platform
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateCatOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {createCategoryMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit Category Modal */}
      <Modal
        isOpen={isEditCatOpen}
        onClose={() => setIsEditCatOpen(false)}
        title="Edit Master Wellness Category"
        subtitle={`Updating details for category #${editingCat?.id?.slice(0, 8)}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateCategoryMutation.mutate({
              id: editingCat.id,
              data: {
                ...catForm,
                display_order: Number(catForm.display_order) || 0,
              },
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
            <input
              type="text"
              required
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
              <input
                type="number"
                value={catForm.display_order}
                onChange={(e) => setCatForm({ ...catForm, display_order: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <ImagePreviewUpload
            value={catForm.icon_url}
            onChange={(url) => setCatForm({ ...catForm, icon_url: url })}
            label="Category Icon / Asset URL"
          />

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="editCatActiveCheck"
              checked={catForm.is_active}
              onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="editCatActiveCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active & Enabled on Platform
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditCatOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateCategoryMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {updateCategoryMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Update Category</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Register Provider Modal */}
      <Modal
        isOpen={isCreateProvOpen}
        onClose={() => setIsCreateProvOpen(false)}
        title="Register Wellness Center"
        subtitle="Add a new nationwide certified wellness & healing center."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createProviderMutation.mutate(provForm);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Center Name</label>
            <input
              type="text"
              required
              value={provForm.name}
              onChange={(e) => setProvForm({ ...provForm, name: e.target.value })}
              placeholder="e.g. Parmarth Niketan Yoga & Wellness Center"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                required
                value={provForm.city}
                onChange={(e) => setProvForm({ ...provForm, city: e.target.value })}
                placeholder="Rishikesh"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <select
                value={provForm.state}
                onChange={(e) => setProvForm({ ...provForm, state: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address & Phone</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={provForm.address}
                onChange={(e) => setProvForm({ ...provForm, address: e.target.value })}
                placeholder="Swargashram, Tapovan"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
              <input
                type="text"
                value={provForm.phone}
                onChange={(e) => setProvForm({ ...provForm, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <ImagePreviewUpload
            value={provForm.cover_image_url}
            onChange={(url) => setProvForm({ ...provForm, cover_image_url: url })}
            label="Cover Image URL"
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateProvOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProviderMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {createProviderMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Center</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Edit Provider & Curation Flags Modal */}
      <Modal
        isOpen={isEditProvOpen}
        onClose={() => setIsEditProvOpen(false)}
        title="Update Provider & Platform Curation Flags"
        subtitle={`Managing curation settings for ${editingProv?.name}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProviderMutation.mutate({
              id: editingProv.id,
              data: {
                ...provForm,
                rating: Number(provForm.rating) || 4.5,
              },
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Center Name</label>
            <input
              type="text"
              required
              value={provForm.name}
              onChange={(e) => setProvForm({ ...provForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                required
                value={provForm.city}
                onChange={(e) => setProvForm({ ...provForm, city: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Platform Rating Override</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={provForm.rating}
                onChange={(e) => setProvForm({ ...provForm, rating: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-amber-600"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 space-y-2">
            <h4 className="text-xs font-bold text-orange-800 dark:text-orange-300">Curation Toggles</h4>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300">Featured Center (Promoted on Discovery)</label>
              <input
                type="checkbox"
                checked={provForm.is_featured}
                onChange={(e) => setProvForm({ ...provForm, is_featured: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300">Active & Operable</label>
              <input
                type="checkbox"
                checked={provForm.is_active}
                onChange={(e) => setProvForm({ ...provForm, is_active: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>

          <ImagePreviewUpload
            value={provForm.cover_image_url}
            onChange={(url) => setProvForm({ ...provForm, cover_image_url: url })}
            label="Cover Image URL"
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditProvOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProviderMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {updateProviderMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Curation Flags</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Provider Detail Drawer / Modal */}
      <Modal
        isOpen={!!viewingProvId}
        onClose={() => setViewingProvId(null)}
        title="Wellness Center Details"
        subtitle="Platform supervision and complete metadata"
        maxWidth="max-w-2xl"
      >
        {loadingProvDetail ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
            <p className="text-xs text-slate-400 mt-2">Loading center details...</p>
          </div>
        ) : provDetail ? (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start space-x-4">
              {provDetail.cover_image_url && (
                <img
                  src={provDetail.cover_image_url}
                  alt=""
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{provDetail.name}</h3>
                  <StatusBadge status={provDetail.is_published ? 'APPROVED' : 'DRAFT'} />
                </div>
                <p className="text-slate-500 mt-1">{provDetail.address}, {provDetail.city}, {provDetail.state}</p>
                <div className="flex items-center space-x-4 mt-2 font-mono text-[11px] text-slate-400">
                  <span>Phone: {provDetail.phone || 'N/A'}</span>
                  <span>Rating: ⭐ {provDetail.rating ?? provDetail.average_rating ?? '4.5'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">About Center</h4>
              <p className="text-slate-500 leading-relaxed">{provDetail.description || provDetail.short_description || 'No detailed description.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Curated Services ({provDetail.services?.length || 0})</span>
                <ul className="space-y-1">
                  {provDetail.services?.map((s) => (
                    <li key={s.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 flex justify-between">
                      <span>{s.name}</span>
                      <span className="font-bold text-orange-600">{formatCurrency(s.price)}</span>
                    </li>
                  )) || <li className="text-slate-400">No services created yet</li>}
                </ul>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Practitioners ({provDetail.practitioners?.length || 0})</span>
                <ul className="space-y-1">
                  {provDetail.practitioners?.map((p) => (
                    <li key={p.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 flex justify-between">
                      <span>{p.full_name || p.name}</span>
                      <span className="text-slate-400">{p.specialization || 'Healer'}</span>
                    </li>
                  )) || <li className="text-slate-400">No practitioners linked</li>}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Center not found.</p>
        )}
      </Modal>

      {/* 6. Create Service Modal */}
      <Modal
        isOpen={isCreateServOpen}
        onClose={() => setIsCreateServOpen(false)}
        title="Add Treatment Service"
        subtitle="Register new wellness service under provider."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createServiceMutation.mutate({
              ...servForm,
              price: Number(servForm.price) || 0,
              duration_minutes: Number(servForm.duration_minutes) || 60,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Wellness Provider / Center</label>
            <select
              required
              value={servForm.provider_id}
              onChange={(e) => setServForm({ ...servForm, provider_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              {allProviders?.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={servForm.category_id}
              onChange={(e) => setServForm({ ...servForm, category_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              <option value="">Select Category...</option>
              {allCategories?.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Title</label>
            <input
              type="text"
              required
              value={servForm.name}
              onChange={(e) =>
                setServForm({
                  ...servForm,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              placeholder="e.g. Abhyanga Full Body Herbal Oil Massage"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={servForm.price}
                onChange={(e) => setServForm({ ...servForm, price: e.target.value })}
                placeholder="2500"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                value={servForm.duration_minutes}
                onChange={(e) => setServForm({ ...servForm, duration_minutes: e.target.value })}
                placeholder="60"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Short Summary</label>
            <input
              type="text"
              value={servForm.short_description}
              onChange={(e) => setServForm({ ...servForm, short_description: e.target.value })}
              placeholder="Traditional Ayurvedic full body oil massage for deep relaxation."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateServOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createServiceMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {createServiceMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Service</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Edit Service & Curation Flags Modal */}
      <Modal
        isOpen={isEditServOpen}
        onClose={() => setIsEditServOpen(false)}
        title="Update Treatment Service & Price"
        subtitle={`Updating details for ${editingServ?.name}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateServiceMutation.mutate({
              id: editingServ.id,
              data: {
                ...servForm,
                price: Number(servForm.price) || 0,
                duration_minutes: Number(servForm.duration_minutes) || 60,
              },
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Title</label>
            <input
              type="text"
              required
              value={servForm.name}
              onChange={(e) => setServForm({ ...servForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={servForm.price}
                onChange={(e) => setServForm({ ...servForm, price: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-orange-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                value={servForm.duration_minutes}
                onChange={(e) => setServForm({ ...servForm, duration_minutes: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 space-y-2">
            <h4 className="text-xs font-bold text-orange-800 dark:text-orange-300">Curation Toggles</h4>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300">Featured Service</label>
              <input
                type="checkbox"
                checked={servForm.is_featured}
                onChange={(e) => setServForm({ ...servForm, is_featured: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-700 dark:text-slate-300">Active & Enabled</label>
              <input
                type="checkbox"
                checked={servForm.is_active}
                onChange={(e) => setServForm({ ...servForm, is_active: e.target.checked })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditServOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateServiceMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {updateServiceMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Service Detail Modal */}
      <Modal
        isOpen={!!viewingServId}
        onClose={() => setViewingServId(null)}
        title="Treatment Service Details"
        subtitle="Platform supervision and metadata"
      >
        {loadingServDetail ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
            <p className="text-xs text-slate-400 mt-2">Loading service details...</p>
          </div>
        ) : servDetail ? (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{servDetail.name}</h3>
              <StatusBadge status={servDetail.is_published ? 'APPROVED' : 'DRAFT'} />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Price: <strong className="text-orange-600">{formatCurrency(servDetail.price)}</strong></span>
                <span>Duration: <strong>{servDetail.duration_minutes} Mins</strong></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Provider: {servDetail.provider_name || 'Wellness Center'}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Description</h4>
              <p className="text-slate-500 leading-relaxed">{servDetail.description || servDetail.short_description || 'No description provided.'}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Service details not found.</p>
        )}
      </Modal>

      {/* 9. Booking Detail Modal */}
      <Modal
        isOpen={!!viewingBookId}
        onClose={() => setViewingBookId(null)}
        title="Appointment Booking Details"
        subtitle="Full appointment record and status summary"
      >
        {loadingBookDetail ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
            <p className="text-xs text-slate-400 mt-2">Loading booking details...</p>
          </div>
        ) : bookDetail ? (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">BOOKING REF</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{bookDetail.booking_reference || bookDetail.id}</span>
              </div>
              <StatusBadge status={bookDetail.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Customer Info</span>
                <div>{bookDetail.user_name || 'Customer'}</div>
                <div className="text-slate-400">{bookDetail.user_email || ''}</div>
                <div className="text-slate-400">{bookDetail.user_phone || ''}</div>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Appointment Slot</span>
                <div className="font-semibold text-orange-600">{bookDetail.booking_date}</div>
                <div className="text-slate-400">{bookDetail.slot_time || 'Scheduled Slot'}</div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Service & Center</span>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{bookDetail.service_name}</div>
              <div className="text-slate-400">{bookDetail.provider_name}</div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Booking details not found.</p>
        )}
      </Modal>

      {/* 10. Change Booking Status Modal */}
      <Modal
        isOpen={!!statusBookItem}
        onClose={() => setStatusBookItem(null)}
        title="Update Appointment Status"
        subtitle={`Change status for booking #${statusBookItem?.booking_reference || statusBookItem?.id?.slice(0, 8)}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Select the new status for this wellness appointment booking:
          </p>

          <div className="grid grid-cols-3 gap-3">
            {['CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setTargetStatus(st)}
                className={`p-3 rounded-xl border text-center font-bold transition-all ${
                  targetStatus === st
                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStatusBookItem(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updateBookingStatusMutation.isPending}
              onClick={() =>
                updateBookingStatusMutation.mutate({
                  id: statusBookItem.id,
                  status: targetStatus,
                })
              }
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {updateBookingStatusMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Status</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 11. Delete Confirmations */}
      <ConfirmationModal
        isOpen={!!deletingCat}
        onClose={() => setDeletingCat(null)}
        onConfirm={() => deleteCategoryMutation.mutate(deletingCat.id)}
        title="Delete Wellness Category"
        description={`Are you sure you want to delete category "${deletingCat?.name}"? Category must not be referenced by existing services.`}
        isDanger
        isLoading={deleteCategoryMutation.isPending}
      />

      <ConfirmationModal
        isOpen={!!deletingProv}
        onClose={() => setDeletingProv(null)}
        onConfirm={() => deleteProviderMutation.mutate(deletingProv.id)}
        title="Delete Wellness Center"
        description={`Are you sure you want to delete provider "${deletingProv?.name}"? Center must not have active services.`}
        isDanger
        isLoading={deleteProviderMutation.isPending}
      />

      <ConfirmationModal
        isOpen={!!deletingServ}
        onClose={() => setDeletingServ(null)}
        onConfirm={() => deleteServiceMutation.mutate(deletingServ.id)}
        title="Delete Treatment Service"
        description={`Are you sure you want to delete service "${deletingServ?.name}"? Associated media and links will cascade.`}
        isDanger
        isLoading={deleteServiceMutation.isPending}
      />
    </div>
  );
};
