import { apiClient } from './client';

export const wellnessApi = {
  // ---------------------------------------------------------------------------
  // 1. Master Category Management (/admin/wellness/categories)
  // ---------------------------------------------------------------------------
  getCategories: async (options = {}) => {
    try {
      const opts = options || {};
      const response = await apiClient.get('/admin/wellness/categories', {
        params: {
          page: Number(opts.page || 1),
          limit: Number(opts.limit || 10),
          is_active: opts.is_active !== undefined ? opts.is_active : undefined,
        },
      });

      const resData = response.data;
      let items = [];
      let meta = {};

      if (Array.isArray(resData)) {
        items = resData;
      } else if (Array.isArray(resData?.data)) {
        items = resData.data;
        meta = resData.pagination || resData.meta || {};
      } else if (Array.isArray(resData?.items)) {
        items = resData.items;
        meta = resData.pagination || resData.meta || {};
      } else if (resData?.data && typeof resData.data === 'object') {
        items = Array.isArray(resData.data.items) ? resData.data.items : [];
        meta = resData.data.pagination || resData.data.meta || {};
      }

      return {
        data: items,
        pagination: {
          page: Number(meta.page || opts.page || 1),
          limit: Number(meta.limit || opts.limit || 10),
          total_records: Number(meta.total ?? meta.total_records ?? items.length),
          total_pages: Number((meta.pages ?? meta.total_pages ?? Math.ceil((meta.total ?? items.length) / (meta.limit ?? opts.limit ?? 10))) || 1),
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          data: [],
          pagination: { page: Number(options?.page || 1), limit: Number(options?.limit || 10), total_records: 0, total_pages: 1 },
        };
      }
      throw err;
    }
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/admin/wellness/categories', categoryData);
    return response.data?.data || response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.patch(`/admin/wellness/categories/${id}`, categoryData);
    return response.data?.data || response.data;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/admin/wellness/categories/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // 2. Wellness Centers Supervision (/admin/wellness/providers)
  // ---------------------------------------------------------------------------
  getProviders: async (options = {}) => {
    try {
      const opts = options || {};
      const response = await apiClient.get('/admin/wellness/providers', {
        params: {
          page: Number(opts.page || 1),
          limit: Number(opts.limit || 10),
          owner_id: opts.owner_id || undefined,
          city: opts.city || undefined,
          state: opts.state || undefined,
          is_published: opts.is_published !== undefined ? opts.is_published : undefined,
          is_active: opts.is_active !== undefined ? opts.is_active : undefined,
          is_featured: opts.is_featured !== undefined ? opts.is_featured : undefined,
        },
      });

      const resData = response.data;
      let items = [];
      let meta = {};

      if (Array.isArray(resData)) {
        items = resData;
      } else if (Array.isArray(resData?.data)) {
        items = resData.data;
        meta = resData.pagination || resData.meta || {};
      } else if (Array.isArray(resData?.items)) {
        items = resData.items;
        meta = resData.pagination || resData.meta || {};
      } else if (resData?.data && typeof resData.data === 'object') {
        items = Array.isArray(resData.data.items) ? resData.data.items : [];
        meta = resData.data.pagination || resData.data.meta || {};
      }

      return {
        data: items,
        pagination: {
          page: Number(meta.page || opts.page || 1),
          limit: Number(meta.limit || opts.limit || 10),
          total_records: Number(meta.total ?? meta.total_records ?? items.length),
          total_pages: Number((meta.pages ?? meta.total_pages ?? Math.ceil((meta.total ?? items.length) / (meta.limit ?? opts.limit ?? 10))) || 1),
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          data: [],
          pagination: { page: Number(options?.page || 1), limit: Number(options?.limit || 10), total_records: 0, total_pages: 1 },
        };
      }
      throw err;
    }
  },

  getProviderDetail: async (id) => {
    if (!id) return null;
    const response = await apiClient.get(`/admin/wellness/providers/${id}`);
    return response.data?.data || response.data;
  },

  createProvider: async (providerData) => {
    const response = await apiClient.post('/admin/wellness/providers', providerData);
    return response.data?.data || response.data;
  },

  updateProvider: async (id, providerData) => {
    const response = await apiClient.patch(`/admin/wellness/providers/${id}`, providerData);
    return response.data?.data || response.data;
  },

  deleteProvider: async (id) => {
    const response = await apiClient.delete(`/admin/wellness/providers/${id}`);
    return response.data;
  },

  publishProvider: async (id) => {
    const response = await apiClient.post(`/admin/wellness/providers/${id}/publish`);
    return response.data?.data || response.data;
  },

  unpublishProvider: async (id) => {
    const response = await apiClient.post(`/admin/wellness/providers/${id}/unpublish`);
    return response.data?.data || response.data;
  },

  // ---------------------------------------------------------------------------
  // 3. Wellness Treatment Services Supervision (/admin/wellness/services)
  // ---------------------------------------------------------------------------
  getServices: async (options = {}) => {
    try {
      const opts = options || {};
      const response = await apiClient.get('/admin/wellness/services', {
        params: {
          page: Number(opts.page || 1),
          limit: Number(opts.limit || 10),
          provider_id: opts.provider_id || undefined,
          category_id: opts.category_id || undefined,
          is_published: opts.is_published !== undefined ? opts.is_published : undefined,
          is_active: opts.is_active !== undefined ? opts.is_active : undefined,
          is_featured: opts.is_featured !== undefined ? opts.is_featured : undefined,
        },
      });

      const resData = response.data;
      let items = [];
      let meta = {};

      if (Array.isArray(resData)) {
        items = resData;
      } else if (Array.isArray(resData?.data)) {
        items = resData.data;
        meta = resData.pagination || resData.meta || {};
      } else if (Array.isArray(resData?.items)) {
        items = resData.items;
        meta = resData.pagination || resData.meta || {};
      } else if (resData?.data && typeof resData.data === 'object') {
        items = Array.isArray(resData.data.items) ? resData.data.items : [];
        meta = resData.data.pagination || resData.data.meta || {};
      }

      return {
        data: items,
        pagination: {
          page: Number(meta.page || opts.page || 1),
          limit: Number(meta.limit || opts.limit || 10),
          total_records: Number(meta.total ?? meta.total_records ?? items.length),
          total_pages: Number((meta.pages ?? meta.total_pages ?? Math.ceil((meta.total ?? items.length) / (meta.limit ?? opts.limit ?? 10))) || 1),
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          data: [],
          pagination: { page: Number(options?.page || 1), limit: Number(options?.limit || 10), total_records: 0, total_pages: 1 },
        };
      }
      throw err;
    }
  },

  getServiceDetail: async (id) => {
    if (!id) return null;
    const response = await apiClient.get(`/admin/wellness/services/${id}`);
    return response.data?.data || response.data;
  },

  addService: async (serviceData) => {
    const response = await apiClient.post('/admin/wellness/services', serviceData);
    return response.data?.data || response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await apiClient.patch(`/admin/wellness/services/${id}`, serviceData);
    return response.data?.data || response.data;
  },

  deleteService: async (id) => {
    const response = await apiClient.delete(`/admin/wellness/services/${id}`);
    return response.data;
  },

  publishService: async (id) => {
    const response = await apiClient.post(`/admin/wellness/services/${id}/publish`);
    return response.data?.data || response.data;
  },

  unpublishService: async (id) => {
    const response = await apiClient.post(`/admin/wellness/services/${id}/unpublish`);
    return response.data?.data || response.data;
  },

  // ---------------------------------------------------------------------------
  // 4. Platform-Wide Bookings Supervision (/admin/wellness/bookings)
  // ---------------------------------------------------------------------------
  getAdminBookings: async (options = {}) => {
    try {
      const opts = options || {};
      const response = await apiClient.get('/admin/wellness/bookings', {
        params: {
          page: Number(opts.page || 1),
          limit: Number(opts.limit || 10),
          user_id: opts.user_id || undefined,
          service_id: opts.service_id || undefined,
          provider_id: opts.provider_id || undefined,
          practitioner_id: opts.practitioner_id || undefined,
          status: opts.status || undefined,
          booking_date: opts.booking_date || undefined,
        },
      });

      const resData = response.data;
      let items = [];
      let meta = {};

      if (Array.isArray(resData)) {
        items = resData;
      } else if (Array.isArray(resData?.data)) {
        items = resData.data;
        meta = resData.pagination || resData.meta || {};
      } else if (Array.isArray(resData?.items)) {
        items = resData.items;
        meta = resData.pagination || resData.meta || {};
      } else if (resData?.data && typeof resData.data === 'object') {
        items = Array.isArray(resData.data.items) ? resData.data.items : [];
        meta = resData.data.pagination || resData.data.meta || {};
      }

      return {
        data: items,
        pagination: {
          page: Number(meta.page || opts.page || 1),
          limit: Number(meta.limit || opts.limit || 10),
          total_records: Number(meta.total ?? meta.total_records ?? items.length),
          total_pages: Number((meta.pages ?? meta.total_pages ?? Math.ceil((meta.total ?? items.length) / (meta.limit ?? opts.limit ?? 10))) || 1),
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          data: [],
          pagination: { page: Number(options?.page || 1), limit: Number(options?.limit || 10), total_records: 0, total_pages: 1 },
        };
      }
      throw err;
    }
  },

  getBookingDetail: async (id) => {
    if (!id) return null;
    const response = await apiClient.get(`/admin/wellness/bookings/${id}`);
    return response.data?.data || response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/wellness/bookings/${id}/status`, { status });
    return response.data?.data || response.data;
  },
};
