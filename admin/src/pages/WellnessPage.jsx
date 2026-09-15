import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wellnessApi } from '../api/wellnessApi';
import { useToast } from '../context/ToastContext';
import { INDIAN_STATES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { ImagePreviewUpload } from '../components/common/ImagePreviewUpload';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  GraduationCap,
  Plus,
  Clock,
  Phone,
  Loader2
} from 'lucide-react';

export const WellnessPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('centers'); // 'centers' | 'courses'

  // Modals state
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Forms
  const [centerForm, setCenterForm] = useState({
    name: '',
    slug: '',
    short_description: '',
    address: '',
    city: '',
    state: 'Uttarakhand',
    country: 'India',
    pincode: '249192',
    phone: '+919812345678',
    cover_image_url: '',
    is_featured: true,
    is_published: true,
  });

  const [courseForm, setCourseForm] = useState({
    provider_id: '',
    category_id: 'e9e9e88d-1180-4b2c-870c-28f733c89f98',
    name: '',
    slug: '',
    short_description: '',
    description: '',
    price: 4999.0,
    duration_minutes: 240,
    is_featured: true,
    is_published: true,
  });

  // Queries
  const { data: providers, isLoading: loadingProviders } = useQuery({
    queryKey: ['wellnessProviders'],
    queryFn: () => wellnessApi.getProviders(),
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['wellnessServices'],
    queryFn: () => wellnessApi.getServices(),
  });

  // Mutations
  const createCenterMutation = useMutation({
    mutationFn: (data) => wellnessApi.createProvider(data),
    onSuccess: () => {
      toast.success('Skill Academy Created', 'New wellness & heritage skill center registered.');
      queryClient.invalidateQueries({ queryKey: ['wellnessProviders'] });
      setIsCenterModalOpen(false);
    },
    onError: (err) => toast.error('Creation Error', err.detail || err.message),
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) => wellnessApi.addService(data),
    onSuccess: () => {
      toast.success('Certification Course Added', 'Course published under academy.');
      queryClient.invalidateQueries({ queryKey: ['wellnessServices'] });
      setIsCourseModalOpen(false);
    },
    onError: (err) => toast.error('Add Course Error', err.detail || err.message),
  });

  const handleSaveCenter = (e) => {
    e.preventDefault();
    createCenterMutation.mutate(centerForm);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    const finalProviderId = courseForm.provider_id || (providers && providers.length > 0 ? providers[0].id : '');
    const payload = {
      ...courseForm,
      provider_id: finalProviderId,
    };
    createCourseMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Wellness & Skill Training Academy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage tourist guide skill certifications, yoga institutes, and regional heritage centers.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('centers')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'centers'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Skill Centers ({providers?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Certification Courses ({services?.length || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: Skill Centers */}
      {activeTab === 'centers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsCenterModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill Center</span>
            </button>
          </div>

          {loadingProviders ? (
            <LoadingSkeleton count={3} className="h-44" />
          ) : !providers || providers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No skill centers registered. Click 'Add Skill Center'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map((center) => (
                <div
                  key={center.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start space-x-4">
                    {center.cover_image_url ? (
                      <img
                        src={center.cover_image_url}
                        alt={center.name}
                        className="w-24 h-24 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={center.is_published ? 'APPROVED' : 'DRAFT'} />
                        <span className="text-[11px] font-mono text-slate-400">{center.city}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                        {center.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{center.short_description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-orange-500" />
                      <span>{center.phone}</span>
                    </div>
                    <span>{center.state}, India</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Certification Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (providers && providers.length > 0) {
                  setCourseForm((prev) => ({ ...prev, provider_id: providers[0].id }));
                }
                setIsCourseModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification Course</span>
            </button>
          </div>

          {loadingServices ? (
            <LoadingSkeleton count={3} className="h-36" />
          ) : !services || services.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No student certification courses registered.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                        SKILL COURSE
                      </span>
                      <span className="font-extrabold text-xs text-orange-600 dark:text-orange-400">
                        {formatCurrency(course.price)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{course.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{course.short_description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.duration_minutes} Mins Duration</span>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{course.provider_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Skill Center Modal */}
      <Modal
        isOpen={isCenterModalOpen}
        onClose={() => setIsCenterModalOpen(false)}
        title="Add Skill & Heritage Center"
        subtitle="Register certified tourism skill development and holistic institute."
      >
        <form onSubmit={handleSaveCenter} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Center / Academy Name</label>
            <input
              type="text"
              required
              value={centerForm.name}
              onChange={(e) =>
                setCenterForm({
                  ...centerForm,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              placeholder="e.g. Paryatanam Skill & Heritage Academy"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                required
                value={centerForm.city}
                onChange={(e) => setCenterForm({ ...centerForm, city: e.target.value })}
                placeholder="Rishikesh"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <select
                value={centerForm.state}
                onChange={(e) => setCenterForm({ ...centerForm, state: e.target.value })}
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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address & Pincode</label>
            <input
              type="text"
              value={centerForm.address}
              onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
              placeholder="Badrinath Road, Tapovan, Rishikesh, Uttarakhand 249192"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <ImagePreviewUpload
            value={centerForm.cover_image_url}
            onChange={(url) => setCenterForm({ ...centerForm, cover_image_url: url })}
            label="Institute Cover Image"
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCenterModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCenterMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {createCenterMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Skill Center</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Add Student Certification Course"
        subtitle="Publish vocational training program for regional tourist guides."
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Skill Academy</label>
            <select
              value={courseForm.provider_id}
              onChange={(e) => setCourseForm({ ...courseForm, provider_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            >
              {providers?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Title</label>
            <input
              type="text"
              required
              value={courseForm.name}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              placeholder="e.g. Certified Tourist Guide Skill Development Program"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Course Price (₹)</label>
              <input
                type="number"
                required
                value={courseForm.price}
                onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                value={courseForm.duration_minutes}
                onChange={(e) => setCourseForm({ ...courseForm, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Short Summary</label>
            <input
              type="text"
              value={courseForm.short_description}
              onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })}
              placeholder="6-Week comprehensive skill course for aspiring regional tourist guides."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md flex items-center space-x-2"
            >
              {createCourseMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Course</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
