import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { travelApi } from '../api/travelApi';
import { useToast } from '../context/ToastContext';
import { INDIAN_STATES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { ImagePreviewUpload } from '../components/common/ImagePreviewUpload';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  MapPin,
  Compass,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Calendar,
  Globe
} from 'lucide-react';

export const TravelPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'tours'

  // Destination Modal state
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [destForm, setDestForm] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    state: 'Karnataka',
    country: 'India',
    location: '',
    primary_image_url: '',
    is_published: true,
    is_active: true,
  });

  // Queries
  const { data: destinations, isLoading: loadingDestinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => travelApi.getDestinations(),
  });

  const { data: tours, isLoading: loadingTours } = useQuery({
    queryKey: ['pendingTours'],
    queryFn: () => travelApi.getPendingTours(),
  });

  // Destination Mutations
  const createDestMutation = useMutation({
    mutationFn: (data) => travelApi.createDestination(data),
    onSuccess: () => {
      toast.success('Destination Created', 'New heritage destination added to database.');
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      setIsDestModalOpen(false);
    },
    onError: (err) => toast.error('Creation Error', err.detail || err.message),
  });

  const updateDestMutation = useMutation({
    mutationFn: ({ id, data }) => travelApi.updateDestination(id, data),
    onSuccess: () => {
      toast.success('Destination Saved', 'Destination updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      setIsDestModalOpen(false);
    },
    onError: (err) => toast.error('Update Error', err.detail || err.message),
  });

  // Tour Moderation Mutation
  const moderateTourMutation = useMutation({
    mutationFn: ({ tourId, is_published, is_active }) =>
      travelApi.moderateTour(tourId, { is_published, is_active }),
    onSuccess: (res) => {
      toast.success('Tour Moderated', res.message);
      queryClient.invalidateQueries({ queryKey: ['pendingTours'] });
    },
    onError: (err) => toast.error('Moderation Error', err.detail || err.message),
  });

  const handleOpenDestModal = (dest = null) => {
    if (dest) {
      setEditingDest(dest);
      setDestForm({
        name: dest.name,
        slug: dest.slug,
        description: dest.description || '',
        short_description: dest.short_description || '',
        state: dest.state || 'Karnataka',
        country: dest.country || 'India',
        location: dest.location || '',
        primary_image_url: dest.primary_image_url || '',
        is_published: dest.is_published ?? true,
        is_active: dest.is_active ?? true,
      });
    } else {
      setEditingDest(null);
      setDestForm({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        state: 'Karnataka',
        country: 'India',
        location: '',
        primary_image_url: '',
        is_published: true,
        is_active: true,
      });
    }
    setIsDestModalOpen(true);
  };

  const handleSaveDest = (e) => {
    e.preventDefault();
    if (editingDest) {
      updateDestMutation.mutate({ id: editingDest.id, data: destForm });
    } else {
      createDestMutation.mutate(destForm);
    }
  };

  const handleToggleTourPublish = (tour) => {
    const nextPublished = !tour.is_published;
    moderateTourMutation.mutate({
      tourId: tour.id,
      is_published: nextPublished,
      is_active: tour.is_active ?? true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Travel & Destination Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Govern Indian heritage destinations, monuments, and moderate operator tour packages.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'destinations'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Destinations ({destinations?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tours'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tour Package Approvals ({tours?.length || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: Destinations */}
      {activeTab === 'destinations' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenDestModal()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Destination</span>
            </button>
          </div>

          {loadingDestinations ? (
            <LoadingSkeleton count={3} className="h-44" />
          ) : !destinations || destinations.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No destinations registered. Click 'Add Destination'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start space-x-4">
                    {dest.primary_image_url ? (
                      <img
                        src={dest.primary_image_url}
                        alt={dest.name}
                        className="w-24 h-24 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <MapPin className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                          {dest.state}
                        </span>
                        <StatusBadge status={dest.is_published ? 'APPROVED' : 'DRAFT'} />
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{dest.short_description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                    <span className="text-slate-500 font-mono">{dest.location || `${dest.state}, India`}</span>
                    <button
                      onClick={() => handleOpenDestModal(dest)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-orange-500" />
                      <span>Edit Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Tour Approvals */}
      {activeTab === 'tours' && (
        <div className="space-y-4">
          {loadingTours ? (
            <LoadingSkeleton count={3} className="h-36" />
          ) : !tours || tours.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No pending operator tour packages awaiting moderation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={tour.cover_image}
                      alt={tour.title}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={tour.is_published ? 'APPROVED' : 'PENDING'} />
                        <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(tour.price)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                        {tour.title}
                      </h3>
                      <p className="text-xs text-slate-500">Operator: {tour.operator_name}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Duration: {tour.duration_days} Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button
                      onClick={() => handleToggleTourPublish(tour)}
                      disabled={moderateTourMutation.isPending}
                      className={`px-4 py-1.5 text-xs font-bold rounded-xl text-white shadow-sm flex items-center space-x-1.5 ${
                        tour.is_published ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {tour.is_published ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Unpublish Circuit</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Publish Circuit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Destination Editor Modal */}
      <Modal
        isOpen={isDestModalOpen}
        onClose={() => setIsDestModalOpen(false)}
        title={editingDest ? 'Edit Destination Record' : 'Create New Destination'}
        subtitle="Add cultural/heritage location to the national Paryatanam database."
      >
        <form onSubmit={handleSaveDest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Destination Name</label>
            <input
              type="text"
              required
              value={destForm.name}
              onChange={(e) =>
                setDestForm({
                  ...destForm,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              placeholder="e.g. Hampi UNESCO Ruins"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <select
                value={destForm.state}
                onChange={(e) => setDestForm({ ...destForm, state: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location Details</label>
              <input
                type="text"
                value={destForm.location}
                onChange={(e) => setDestForm({ ...destForm, location: e.target.value })}
                placeholder="e.g. Hampi, Karnataka"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
            <input
              type="text"
              value={destForm.short_description}
              onChange={(e) => setDestForm({ ...destForm, short_description: e.target.value })}
              placeholder="Stone chariot & ruins of Vijayanagara Empire."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Detailed Overview</label>
            <textarea
              rows={3}
              value={destForm.description}
              onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
              placeholder="Ancient capital of Vijayanagara Empire featuring stone chariot monuments."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <ImagePreviewUpload
            value={destForm.primary_image_url}
            onChange={(url) => setDestForm({ ...destForm, primary_image_url: url })}
            label="Primary Destination Cover Photo"
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDestMutation.isPending || updateDestMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {(createDestMutation.isPending || updateDestMutation.isPending) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>Save Destination</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
