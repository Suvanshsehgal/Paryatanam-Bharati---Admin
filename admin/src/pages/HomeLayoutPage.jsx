import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeApi } from '../api/homeApi';
import { travelApi } from '../api/travelApi';
import { marketplaceApi } from '../api/marketplaceApi';
import { prasadApi } from '../api/prasadApi';
import { wellnessApi } from '../api/wellnessApi';
import { useToast } from '../context/ToastContext';
import { HOME_SECTION_TYPES, ACTION_TYPES, FLUTTER_SCREEN_DESTINATIONS } from '../utils/constants';
import { Modal } from '../components/common/Modal';
import { ImagePreviewUpload } from '../components/common/ImagePreviewUpload';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react';

// Sortable Item Component for Section Drag & Drop
const SortableSectionItem = ({ section, onAddSlide, onAddItem, onDeleteSection, onDeleteSlide }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isHero = section.section_type === 'HERO_CAROUSEL';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-slate-900 border border-zinc-200/70 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60">
                {section.section_type}
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{section.title}</h3>
            </div>
            {section.subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{section.subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-3 border-t sm:border-t-0 border-zinc-100 dark:border-slate-800 pt-2 sm:pt-0">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-zinc-400">Order: #{section.display_order}</span>
            <StatusBadge status={section.is_visible ? 'PUBLISHED' : 'DRAFT'} />
          </div>

          {isHero ? (
            <button
              onClick={() => onAddSlide(section)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-colors flex items-center space-x-1 border border-orange-200 dark:border-orange-800/60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          ) : (
            <button
              onClick={() => onAddItem(section)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-slate-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          )}

          {onDeleteSection && (
            <button
              onClick={() => onDeleteSection(section)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
              title="Delete Section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nested Hero Carousel Items */}
      {isHero && section.carousel_items && section.carousel_items.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-slate-800 pt-4">
          <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
            Hero Carousel Slides ({section.carousel_items.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.carousel_items.map((slide) => (
              <div
                key={slide.id}
                className="rounded-xl border border-zinc-200/60 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-950 p-2.5 flex items-center space-x-3 group relative"
              >
                {slide.image_url ? (
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-slate-800 flex items-center justify-center text-zinc-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-xs">
                  <h5 className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{slide.title}</h5>
                  <p className="text-[11px] text-zinc-500 truncate">{slide.subtitle}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-mono text-orange-600 dark:text-orange-400 truncate max-w-full">
                    {slide.action_target}
                  </span>
                </div>
                {onDeleteSlide && (
                  <button
                    onClick={() => onDeleteSlide(section.id, slide.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-all"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nested Card Grid Items */}
      {!isHero && section.items && section.items.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-slate-800 pt-4">
          <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
            Section Card Grid Items ({section.items.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-200/60 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-950 p-2.5 flex items-center space-x-3"
              >
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0 text-xs">
                  <h5 className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{item.title}</h5>
                  <p className="text-[11px] text-zinc-500 truncate">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const HomeLayoutPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Modals state
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [activeAddSlideSection, setActiveAddSlideSection] = useState(null);
  const [activeAddItemSection, setActiveAddItemSection] = useState(null);

  // Form states
  const [newSection, setNewSection] = useState({
    section_type: 'PROMOTIONS',
    title: '',
    subtitle: '',
    display_order: 1,
    is_visible: true,
    is_published: true,
  });

  const [navigationForm, setNavigationForm] = useState({
    title: '',
    subtitle: '',
    caption: '',
    image_url: '',
    action_type: 'DESTINATION',
    target_entity_id: null,
    action_target: '',
    display_order: 1,
    is_visible: true,
    is_published: true,
  });

  // Queries for Entity Selection Dropdowns (Parent Action Domain -> Child Entity Selector)
  const { data: sections, isLoading } = useQuery({
    queryKey: ['homeSections'],
    queryFn: () => homeApi.getSections(),
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => travelApi.getDestinations(),
  });

  const { data: tours } = useQuery({
    queryKey: ['pendingTours'],
    queryFn: () => travelApi.getPendingTours(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => marketplaceApi.getCategories(),
  });

  const { data: temples } = useQuery({
    queryKey: ['temples'],
    queryFn: () => prasadApi.getTemples(),
  });

  const { data: services } = useQuery({
    queryKey: ['wellnessServices'],
    queryFn: () => wellnessApi.getServices(),
  });

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mutations
  const reorderMutation = useMutation({
    mutationFn: (sectionOrders) => homeApi.reorderSections(sectionOrders),
    onSuccess: () => {
      toast.success('Section Order Saved', 'SDUI home layout reordering updated.');
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
    },
    onError: (err) => toast.error('Reorder Failed', err.detail || err.message),
  });

  const createSectionMutation = useMutation({
    mutationFn: (data) => homeApi.createSection(data),
    onSuccess: () => {
      toast.success('Section Created', 'New SDUI home layout block added.');
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      setIsCreateSectionOpen(false);
    },
    onError: (err) => toast.error('Creation Failed', err.detail || err.message),
  });

  const addSlideMutation = useMutation({
    mutationFn: ({ sectionId, data }) => homeApi.addCarouselSlide(sectionId, data),
    onSuccess: () => {
      toast.success('Slide Added', 'New slide added to Hero Carousel.');
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      setActiveAddSlideSection(null);
    },
    onError: (err) => toast.error('Add Slide Failed', err.detail || err.message),
  });

  const addItemMutation = useMutation({
    mutationFn: ({ sectionId, data }) => homeApi.addSectionItem(sectionId, data),
    onSuccess: () => {
      toast.success('Card Item Added', 'New card added to section grid.');
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
      setActiveAddItemSection(null);
    },
    onError: (err) => toast.error('Add Item Failed', err.detail || err.message),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId) => homeApi.deleteSection(sectionId),
    onSuccess: () => {
      toast.success('Section Deleted', 'Home layout block deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
    },
    onError: (err) => toast.error('Delete Section Failed', err.detail || err.message),
  });

  const deleteSlideMutation = useMutation({
    mutationFn: ({ sectionId, itemId }) => homeApi.deleteCarouselSlide(sectionId, itemId),
    onSuccess: () => {
      toast.success('Slide Deleted', 'Carousel slide deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['homeSections'] });
    },
    onError: (err) => toast.error('Delete Slide Failed', err.detail || err.message),
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !sections) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(sections, oldIndex, newIndex);
    const sectionOrders = reordered.map((sec, idx) => ({
      id: sec.id,
      display_order: idx + 1,
    }));

    queryClient.setQueryData(['homeSections'], reordered);
    reorderMutation.mutate(sectionOrders);
  };

  // Helper for Automated Navigation Workflow: Child Entity Selection
  const handleEntitySelect = (entityId, actionType) => {
    if (!entityId) {
      setNavigationForm((prev) => ({ ...prev, target_entity_id: null }));
      return;
    }

    if (actionType === 'DESTINATION') {
      const dest = destinations?.find((d) => d.id === entityId);
      if (dest) {
        const slug = dest.slug || dest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        setNavigationForm((prev) => ({
          ...prev,
          target_entity_id: dest.id,
          action_target: `/travel/destinations/${slug}`,
          title: prev.title || dest.name,
          subtitle: prev.subtitle || dest.short_description || dest.location,
          image_url: prev.image_url || dest.primary_image_url,
        }));
      }
    } else if (actionType === 'TOUR') {
      const tour = tours?.find((t) => t.id === entityId);
      if (tour) {
        const slug = tour.slug || tour.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        setNavigationForm((prev) => ({
          ...prev,
          target_entity_id: tour.id,
          action_target: `/travel/tours/${slug}`,
          title: prev.title || tour.title,
          subtitle: prev.subtitle || `Operator: ${tour.operator_name}`,
          image_url: prev.image_url || tour.cover_image,
        }));
      }
    } else if (actionType === 'CATEGORY') {
      const cat = categories?.find((c) => c.id === entityId);
      if (cat) {
        setNavigationForm((prev) => ({
          ...prev,
          target_entity_id: cat.id,
          action_target: `/marketplace/categories/${cat.slug}`,
          title: prev.title || cat.name,
          subtitle: prev.subtitle || cat.description,
          image_url: prev.image_url || cat.image_url,
        }));
      }
    } else if (actionType === 'TEMPLE') {
      const temple = temples?.find((t) => t.id === entityId);
      if (temple) {
        setNavigationForm((prev) => ({
          ...prev,
          target_entity_id: temple.id,
          action_target: `/prasad/temples/${temple.slug}`,
          title: prev.title || temple.name,
          subtitle: prev.subtitle || temple.short_description,
          image_url: prev.image_url || temple.image_url,
        }));
      }
    } else if (actionType === 'WELLNESS') {
      const srv = services?.find((s) => s.id === entityId);
      if (srv) {
        setNavigationForm((prev) => ({
          ...prev,
          target_entity_id: srv.id,
          action_target: `/wellness/services/${srv.slug}`,
          title: prev.title || srv.name,
          subtitle: prev.subtitle || srv.short_description,
        }));
      }
    }
  };

  const handleActionTypeChange = (type) => {
    setNavigationForm((prev) => ({
      ...prev,
      action_type: type,
      target_entity_id: null,
      action_target: type === 'EXTERNAL_URL' ? 'https://' : '',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            SDUI Home Layout Manager
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Server-Driven UI Layout Block Governance & Automated Navigation Selector.
          </p>
        </div>

        <button
          onClick={() => {
            setNewSection((prev) => ({ ...prev, display_order: (sections?.length || 0) + 1 }));
            setIsCreateSectionOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-xs flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Home Section</span>
        </button>
      </div>

      {/* Drag & Drop Section List */}
      {isLoading ? (
        <LoadingSkeleton count={3} className="h-32" />
      ) : !sections || sections.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200/70 dark:border-slate-800">
          <p className="text-xs text-zinc-500">No home sections found. Click 'Create Home Section'.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  onAddSlide={(sec) => {
                    setNavigationForm({
                      title: '',
                      subtitle: '',
                      caption: '',
                      image_url: '',
                      action_type: 'DESTINATION',
                      target_entity_id: null,
                      action_target: '',
                      display_order: (sec.carousel_items?.length || 0) + 1,
                      is_visible: true,
                      is_published: true,
                    });
                    setActiveAddSlideSection(sec);
                  }}
                  onAddItem={(sec) => {
                    setNavigationForm({
                      title: '',
                      subtitle: '',
                      caption: '',
                      image_url: '',
                      action_type: 'EXTERNAL_URL',
                      target_entity_id: null,
                      action_target: 'https://',
                      display_order: (sec.items?.length || 0) + 1,
                      is_visible: true,
                      is_published: true,
                    });
                    setActiveAddItemSection(sec);
                  }}
                  onDeleteSection={(sec) => deleteSectionMutation.mutate(sec.id)}
                  onDeleteSlide={(sectionId, slideId) =>
                    deleteSlideMutation.mutate({ sectionId, itemId: slideId })
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create Section Modal */}
      <Modal
        isOpen={isCreateSectionOpen}
        onClose={() => setIsCreateSectionOpen(false)}
        title="Create New SDUI Home Section"
        subtitle="Add a dynamic layout block to the platform mobile/web home screen."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createSectionMutation.mutate(newSection);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Section Type</label>
            <select
              value={newSection.section_type}
              onChange={(e) => setNewSection({ ...newSection, section_type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-zinc-800 dark:text-zinc-200"
            >
              {HOME_SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} ({t.value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Section Title</label>
            <input
              type="text"
              required
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              placeholder="e.g. Government Tourism Initiatives"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Subtitle</label>
            <input
              type="text"
              value={newSection.subtitle}
              onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
              placeholder="e.g. National schemes for pilgrimage & eco-tourism"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateSectionOpen(false)}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSectionMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs flex items-center space-x-2"
            >
              {createSectionMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Section</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Automated Navigation Modal for Adding Hero Slide / Card Item */}
      <Modal
        isOpen={Boolean(activeAddSlideSection || activeAddItemSection)}
        onClose={() => {
          setActiveAddSlideSection(null);
          setActiveAddItemSection(null);
        }}
        title={activeAddSlideSection ? 'Add Slide to Hero Carousel' : 'Add Card to Section Grid'}
        subtitle="Automated Navigation Selector (Parent Action Domain ➔ Child Entity Selector)"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const sectionId = activeAddSlideSection?.id || activeAddItemSection?.id;
            if (activeAddSlideSection) {
              addSlideMutation.mutate({ sectionId, data: navigationForm });
            } else {
              addItemMutation.mutate({ sectionId, data: navigationForm });
            }
          }}
          className="space-y-4"
        >
          {/* STEP 1: Parent Action Domain */}
          <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 space-y-3">
            <div>
              <label className="block text-xs font-bold text-orange-900 dark:text-orange-300 mb-1">
                Step 1: Select Parent Action Domain
              </label>
              <select
                value={navigationForm.action_type}
                onChange={(e) => handleActionTypeChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200 font-semibold"
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label} ({a.value})
                  </option>
                ))}
              </select>
            </div>

            {/* STEP 2: Child Entity Selector */}
            {navigationForm.action_type !== 'EXTERNAL_URL' && (
              <div>
                <label className="block text-xs font-bold text-orange-900 dark:text-orange-300 mb-1">
                  Step 2: Select Child Entity / Screen Route
                </label>
                {navigationForm.action_type === 'SCREEN' && (
                  <div className="space-y-2">
                    <select
                      value={navigationForm.action_target}
                      onChange={(e) => setNavigationForm({ ...navigationForm, action_target: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200 font-semibold"
                    >
                      <option value="">-- Select App Destination Target --</option>
                      {FLUTTER_SCREEN_DESTINATIONS.map((dest) => (
                        <option key={dest.value} value={dest.value}>
                          {dest.label} ({dest.value})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={navigationForm.action_target}
                      onChange={(e) => setNavigationForm({ ...navigationForm, action_target: e.target.value })}
                      placeholder="Or enter custom route (e.g. home, travel, shop, prasad, wellness)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                )}
                {navigationForm.action_type === 'DESTINATION' && (
                  <select
                    value={navigationForm.target_entity_id || ''}
                    onChange={(e) => handleEntitySelect(e.target.value, 'DESTINATION')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">-- Choose Child Destination --</option>
                    {destinations?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.state})
                      </option>
                    ))}
                  </select>
                )}

                {navigationForm.action_type === 'TOUR' && (
                  <select
                    value={navigationForm.target_entity_id || ''}
                    onChange={(e) => handleEntitySelect(e.target.value, 'TOUR')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">-- Choose Child Tour Package --</option>
                    {tours?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.operator_name})
                      </option>
                    ))}
                  </select>
                )}

                {navigationForm.action_type === 'CATEGORY' && (
                  <select
                    value={navigationForm.target_entity_id || ''}
                    onChange={(e) => handleEntitySelect(e.target.value, 'CATEGORY')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">-- Choose Shop Category --</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                )}

                {navigationForm.action_type === 'TEMPLE' && (
                  <select
                    value={navigationForm.target_entity_id || ''}
                    onChange={(e) => handleEntitySelect(e.target.value, 'TEMPLE')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">-- Choose Temple Shrine --</option>
                    {temples?.map((tmp) => (
                      <option key={tmp.id} value={tmp.id}>
                        {tmp.name} ({tmp.city})
                      </option>
                    ))}
                  </select>
                )}

                {navigationForm.action_type === 'WELLNESS' && (
                  <select
                    value={navigationForm.target_entity_id || ''}
                    onChange={(e) => handleEntitySelect(e.target.value, 'WELLNESS')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">-- Choose Wellness Service --</option>
                    {services?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Auto-Generated Route & Entity ID Fields (Read-Only Preview for Admin) */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 text-[11px]">
            <div>
              <label className="block text-zinc-500 font-semibold mb-1">target_entity_id</label>
              <input
                type="text"
                readOnly
                value={navigationForm.target_entity_id || 'null'}
                className="w-full px-2 py-1 rounded border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-zinc-700 dark:text-zinc-300"
              />
            </div>
            <div>
              <label className="block text-zinc-500 font-semibold mb-1">action_target (Auto-Route)</label>
              <input
                type="text"
                required
                value={navigationForm.action_target}
                onChange={(e) => setNavigationForm({ ...navigationForm, action_target: e.target.value })}
                className="w-full px-2 py-1 rounded border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-zinc-700 dark:text-zinc-300"
              />
            </div>
          </div>

          {/* Card Content Fields */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Display Title</label>
            <input
              type="text"
              required
              value={navigationForm.title}
              onChange={(e) => setNavigationForm({ ...navigationForm, title: e.target.value })}
              placeholder="e.g. Taj Mahal, Agra"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Subtitle</label>
            <input
              type="text"
              value={navigationForm.subtitle}
              onChange={(e) => setNavigationForm({ ...navigationForm, subtitle: e.target.value })}
              placeholder="e.g. Iconic Mughal marble mausoleum"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <ImagePreviewUpload
            value={navigationForm.image_url}
            onChange={(url) => setNavigationForm({ ...navigationForm, image_url: url })}
            label="Image URL"
          />

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveAddSlideSection(null);
                setActiveAddItemSection(null);
              }}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addSlideMutation.isPending || addItemMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs flex items-center space-x-2"
            >
              {(addSlideMutation.isPending || addItemMutation.isPending) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>Save Navigation Block</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
