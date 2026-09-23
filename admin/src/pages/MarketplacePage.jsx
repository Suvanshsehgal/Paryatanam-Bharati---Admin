import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '../api/marketplaceApi';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { DataTable } from '../components/common/DataTable';
import { ImagePreviewUpload } from '../components/common/ImagePreviewUpload';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatCurrency } from '../utils/formatters';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Award,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Layers,
  Sparkles
} from 'lucide-react';

export const MarketplacePage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'categories'
  const [moderationFilter, setModerationFilter] = useState('PENDING_QUEUE'); // 'PENDING_QUEUE' | 'APPROVED' | 'REJECTED' | 'all'

  // Moderation state
  const [moderateProduct, setModerateProduct] = useState(null); // product object
  const [moderateAction, setModerateAction] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [rejectionReason, setRejectionReason] = useState('');

  // Category CRUD state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCatId, setDeletingCatId] = useState(null);
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  });

  // Queries
  const { data: pendingProducts, isLoading: loadingPending } = useQuery({
    queryKey: ['pendingProducts', moderationFilter],
    queryFn: () => marketplaceApi.getPendingProducts(moderationFilter),
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => marketplaceApi.getCategories(),
  });

  // Moderation Mutation
  const moderateMutation = useMutation({
    mutationFn: ({ productId, action, rejection_reason }) =>
      marketplaceApi.moderateProduct(productId, { action, rejection_reason }),
    onSuccess: (res) => {
      toast.success('Product Moderated', res.message);
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      setModerateProduct(null);
      setRejectionReason('');
    },
    onError: (err) => {
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('already'))) {
        toast.info('Status Synchronized', 'This product is already approved.');
        queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
        setModerateProduct(null);
      } else {
        toast.error('Moderation Error', err.detail || err.message);
      }
    },
  });

  // Certification Mutation
  const certifyMutation = useMutation({
    mutationFn: ({ productId, certification_status }) =>
      marketplaceApi.certifyProduct(productId, { certification_status }),
    onSuccess: (res) => {
      toast.success('Certification Updated', res.message);
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
    },
    onError: (err) => toast.error('Certification Error', err.detail || err.message),
  });

  // Category Mutations
  const createCatMutation = useMutation({
    mutationFn: (data) => marketplaceApi.createCategory(data),
    onSuccess: () => {
      toast.success('Category Created', 'New shop category added.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCatModalOpen(false);
    },
    onError: (err) => toast.error('Creation Failed', err.detail || err.message),
  });

  const updateCatMutation = useMutation({
    mutationFn: ({ id, data }) => marketplaceApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category Updated', 'Shop category saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCatModalOpen(false);
    },
    onError: (err) => toast.error('Update Failed', err.detail || err.message),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id) => marketplaceApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category Deleted', 'Category removed from store.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeletingCatId(null);
    },
    onError: (err) => toast.error('Deletion Failed', err.detail || err.message),
  });

  const handleOpenModerate = (product, action) => {
    setModerateProduct(product);
    setModerateAction(action);
    setRejectionReason('');
  };

  const handleConfirmModerate = () => {
    if (!moderateProduct) return;
    if (moderateAction === 'REJECTED' && !rejectionReason.trim()) {
      toast.error('Validation Error', 'Rejection reason is mandatory when rejecting vendor items.');
      return;
    }
    moderateMutation.mutate({
      productId: moderateProduct.id,
      action: moderateAction,
      rejection_reason: moderateAction === 'REJECTED' ? rejectionReason : null,
    });
  };

  const handleToggleCertify = (product) => {
    const nextCert = product.certification_status === 'CERTIFIED' ? 'NONE' : 'CERTIFIED';
    certifyMutation.mutate({ productId: product.id, certification_status: nextCert });
  };

  const handleOpenCatModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCatForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image_url: category.image_url || '',
        display_order: category.display_order || 1,
        is_active: category.is_active ?? true,
      });
    } else {
      setEditingCategory(null);
      setCatForm({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        display_order: (categories?.length || 0) + 1,
        is_active: true,
      });
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCatMutation.mutate({ id: editingCategory.id, data: catForm });
    } else {
      createCatMutation.mutate(catForm);
    }
  };

  // Category Columns
  const catColumns = [
    {
      header: 'Category Name',
      accessorKey: 'name',
      cell: (cat) => (
        <div className="flex items-center space-x-3">
          {cat.image_url ? (
            <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Layers className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">{cat.name}</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{cat.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (cat) => <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm truncate">{cat.description || 'N/A'}</p>,
    },
    {
      header: 'Order',
      accessorKey: 'display_order',
      cell: (cat) => <span className="text-xs font-mono font-semibold">#{cat.display_order}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (cat) => <StatusBadge status={cat.is_active ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      cell: (cat) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenCatModal(cat)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingCatId(cat.id)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950 dark:hover:bg-rose-950"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            GoAmrit Shop & Product Moderation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review vendor submissions, issue GoAmrit authentic organic certifications, and manage categories.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'moderation'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Vendor Queue ({pendingProducts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Shop Categories
          </button>
        </div>
      </div>

      {/* TAB 1: Vendor Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {/* Moderation Queue Sub-Filter Bar */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setModerationFilter('PENDING_QUEUE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                moderationFilter === 'PENDING_QUEUE'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Pending Reviews
            </button>
            <button
              onClick={() => setModerationFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                moderationFilter === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Approved & Live
            </button>
            <button
              onClick={() => setModerationFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                moderationFilter === 'REJECTED'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setModerationFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                moderationFilter === 'all'
                  ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Submissions
            </button>
          </div>

          {loadingPending ? (
            <LoadingSkeleton count={3} className="h-40" />
          ) : !pendingProducts || pendingProducts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h3 className="text-base font-bold">Queue Empty</h3>
              <p className="text-xs text-slate-500 mt-1">No products found for the selected moderation status filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(pendingProducts || []).filter(Boolean).map((product, idx) => {
                const isCertified = product?.certification_status === 'CERTIFIED';
                const isActionable = ['PENDING_APPROVAL', 'PENDING_REVIEW', 'UPDATE_PENDING_APPROVAL'].includes(product?.status);

                return (
                  <div
                    key={product?.id || idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <img
                        src={product?.primary_image || product?.image_url || 'https://via.placeholder.com/150'}
                        alt={product?.name || 'Unknown Product'}
                        className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <StatusBadge status={product?.status || 'UNKNOWN'} />
                          <button
                            onClick={() => handleToggleCertify(product)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all flex items-center space-x-1 ${
                              isCertified
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-400/30'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                            title="Toggle Organic Certification"
                          >
                            <Award className="w-3 h-3" />
                            <span>{isCertified ? 'GoAmrit Certified' : 'Certify Organic'}</span>
                          </button>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {product?.name || 'Unnamed Product'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Vendor: {product?.vendor?.name || 'Unknown Vendor'}</p>
                        
                        <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(product?.price || 0)}
                          </span>
                          <span className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            <ShoppingBag className="w-3 h-3 text-slate-500" />
                            <span>{product?.stock_quantity || 0} left</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Moderation Controls */}
                    <div className="flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                      {isActionable ? (
                        <>
                          <button
                            onClick={() => handleOpenModerate(product, 'REJECTED')}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors flex items-center space-x-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject Item</span>
                          </button>
                          <button
                            onClick={() => handleOpenModerate(product, 'APPROVED')}
                            className="px-5 py-2 text-xs font-extrabold uppercase tracking-wide rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/50 ring-offset-2 dark:ring-offset-slate-900 flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve Product</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved & Synchronized</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Shop Category Manager */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenCatModal()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Shop Category</span>
            </button>
          </div>

          <DataTable
            columns={catColumns}
            data={categories || []}
            isLoading={loadingCategories}
            emptyTitle="No shop categories"
            emptyDescription="Create your first marketplace product category to organize vendor goods."
          />
        </div>
      )}

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={Boolean(moderateProduct)}
        onClose={() => setModerateProduct(null)}
        title={moderateAction === 'APPROVED' ? 'Approve Vendor Product' : 'Reject Vendor Submission'}
        subtitle={`Product: ${moderateProduct?.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {moderateAction === 'APPROVED'
              ? 'Approving this item will immediately publish it to the GoAmrit Marketplace storefront.'
              : 'Please specify the audit reason for rejecting this vendor item.'}
          </p>

          {moderateAction === 'REJECTED' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rejection Reason (Required)
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Fails organic packaging standard verification, missing mandatory batch label."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setModerateProduct(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmModerate}
              disabled={moderateMutation.isPending}
              className={`px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white rounded-xl flex items-center space-x-2 transition-all ${
                moderateAction === 'APPROVED' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/50 ring-offset-2 dark:ring-offset-slate-900' 
                  : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/30 ring-2 ring-rose-500/50 ring-offset-2 dark:ring-offset-slate-900'
              }`}
            >
              {moderateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{moderateAction === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Category Modal (Create / Edit) */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCategory ? 'Edit Shop Category' : 'Create Shop Category'}
        subtitle="Manage marketplace category hierarchy and banners."
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
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
              placeholder="e.g. Regional Culinary & Spices"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Slug</label>
            <input
              type="text"
              required
              value={catForm.slug}
              onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              placeholder="Authentic regional Indian spice blends and thali kits."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <ImagePreviewUpload
            value={catForm.image_url}
            onChange={(url) => setCatForm({ ...catForm, image_url: url })}
            label="Category Cover Image"
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCatMutation.isPending || updateCatMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {(createCatMutation.isPending || updateCatMutation.isPending) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deletingCatId)}
        onClose={() => setDeletingCatId(null)}
        onConfirm={() => deleteCatMutation.mutate(deletingCatId)}
        title="Delete Shop Category"
        description="Are you sure you want to delete this shop category? Associated products may lose their category classification."
        confirmText="Delete Category"
        isDanger={true}
        isLoading={deleteCatMutation.isPending}
      />
    </div>
  );
};
