import { apiClient } from './client';

export const wellnessApi = {
  // ---------------------------------------------------------------------------
  // 1. Master Category Management (/admin/wellness/categories)
  // ---------------------------------------------------------------------------
  getCategories: async ({ page = 1, limit = 10, is_active } = {}) => {
    try {
      const response = await apiClient.get('/admin/wellness/categories', {
        params: {
          page: Number(page),
          limit: Number(limit),
          is_active: is_active !== undefined ? is_active : undefined,
        },
      });

      const resData = response.data;
      const items = resData?.data || (Array.isArray(resData) ? resData : []);
      const meta = resData?.pagination || {};

      return {
        data: items,
        pagination: {
          page: Number(meta.page || page),
          limit: Number(meta.limit || limit),
          total_records: Number(meta.total ?? items.length),
          total_pages: Number(meta.pages || Math.ceil((meta.total || items.length) / (meta.limit || limit)) || 1),
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          data: [],
          pagination: { page: Number(page), limit: Number(limit), total_records: 0, total_pages: 1 },
        };
      }
      throw err;
    }
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/admin/wellness/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.patch(`/admin/wellness/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/admin/wellness/categories/${id}`);
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // 2. Wellness Centers Supervision (/admin/wellness/providers)
  // ---------------------------------------------------------------------------
  getProviders: async ({ page = 1, limit = 10, owner_id, city, state, is_published, is_active, is_featured } = {}) => {
    try {
      const response = await apiClient.get('/admin/wellness/providers', {
        params: {
          page: Number(page),
          limit: Number(limit),
          owner_id: owner_id || undefined,
          city: city || undefined,
          state: state || undefined,
          is_published: is_published !== undefined ? is_published : undefined,
          is_active: is_active !== undefined ? is_active : undefined,
          is_featured: is_featured !== undefined ? is_featured : undefined,
        },
      });

      const resData = response.data;
      const items = resData?.data || (Array.isArray(resData) ? resData : []);
      const meta = resData?.pagination || {};

      return {
        data: items,
        pagination: {
          page: Number(meta.page || page),
          limit: Number(meta.limit || limit),
          total_records: Number(meta.total ?? items.length),
          total_pages: Number(meta.pages || Math.ceil((meta.total || items.length) / (meta.limit || limit)) || 1),
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          data: [],
          pagination: { page: Number(page), limit: Number(limit), total_records: 0, total_pages: 1 },
        };
      }
      throw err;
    }
  },

  getProviderDetail: async (id) => {
    const response = await apiClient.get(`/admin/wellness/providers/${id}`);
    return response.data?.data || response.data;
  },

  createProvider: async (providerData) => {
    const response = await apiClient.post('/wellness/vendor/providers', providerData);
    return response.data;
  },

  updateProvider: async (id, providerData) => {
    const response = await apiClient.patch(`/admin/wellness/providers/${id}`, providerData);
    return response.data;
  },

  deleteProvider: async (id) => {
    const response = await apiClient.delete(`/admin/wellness/providers/${id}`);
    return response.data;
  },

  publishProvider: async (id) => {
    const response = await apiClient.post(`/admin/wellness/providers/${id}/publish`);
    return response.data;
  },

  unpublishProvider: async (id) => {
    const response = await apiClient.post(`/admin/wellness/providers/${id}/unpublish`);
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // 3. Wellness Treatment Services Supervision (/admin/wellness/services)
  // ---------------------------------------------------------------------------
  getServices: async ({ page = 1, limit = 10, provider_id, category_id, is_published, is_active, is_featured } = {}) => {
    try {
      const response = await apiClient.get('/admin/wellness/services', {
        params: {
          page: Number(page),
          limit: Number(limit),
          provider_id: provider_id || undefined,
          category_id: category_id || undefined,
          is_published: is_published !== undefined ? is_published : undefined,
          is_active: is_active !== undefined ? is_active : undefined,
          is_featured: is_featured !== undefined ? is_featured : undefined,
        },
      });

      const resData = response.data;
      const items = resData?.data || (Array.isArray(resData) ? resData : []);
      const meta = resData?.pagination || {};

      return {
        data: items,
        pagination: {
          page: Number(meta.page || page),
          limit: Number(meta.limit || limit),
          total_records: Number(meta.total ?? items.length),
          total_pages: Number(meta.pages || Math.ceil((meta.total || items.length) / (meta.limit || limit)) || 1),
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          data: [],
          pagination: { page: Number(page), limit: Number(limit), total_records: 0, total_pages: 1 },
        };
      }
      throw err;
    }
  },

  getServiceDetail: async (id) => {
    const response = await apiClient.get(`/admin/wellness/services/${id}`);
    return response.data?.data || response.data;
  },

  addService: async (serviceData) => {
    const response = await apiClient.post('/wellness/vendor/services', serviceData);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await apiClient.patch(`/admin/wellness/services/${id}`, serviceData);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await apiClient.delete(`/admin/wellness/services/${id}`);
    return response.data;
  },

  publishService: async (id) => {
    const response = await apiClient.post(`/admin/wellness/services/${id}/publish`);
    return response.data;
  },

  unpublishService: async (id) => {
    const response = await apiClient.post(`/admin/wellness/services/${id}/unpublish`);
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // 4. Platform-Wide Bookings Supervision (/admin/wellness/bookings)
  // ---------------------------------------------------------------------------
  getAdminBookings: async ({ page = 1, limit = 10, user_id, service_id, provider_id, practitioner_id, status, booking_date } = {}) => {
    try {
      const response = await apiClient.get('/admin/wellness/bookings', {
        params: {
          page: Number(page),
          limit: Number(limit),
          user_id: user_id || undefined,
          service_id: service_id || undefined,
          provider_id: provider_id || undefined,
          practitioner_id: practitioner_id || undefined,
          status: status || undefined,
          booking_date: booking_date || undefined,
        },
      });

      const resData = response.data;
      const items = resData?.data || (Array.isArray(resData) ? resData : []);
      const meta = resData?.pagination || {};

      return {
        data: items,
        pagination: {
          page: Number(meta.page || page),
          limit: Number(meta.limit || limit),
          total_records: Number(meta.total ?? items.length),
          total_pages: Number(meta.pages || Math.ceil((meta.total || items.length) / (meta.limit || limit)) || 1),
        },
      };
    } catch (err) {
      if (err.status === 404) {
        return {
          data: [],
          pagination: { page: Number(page), limit: Number(limit), total_records: 0, total_pages: 1 },
        };
      }
      throw err;
    }
  },

  getBookingDetail: async (id) => {
    const response = await apiClient.get(`/admin/wellness/bookings/${id}`);
    return response.data?.data || response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/wellness/bookings/${id}/status`, { status });
    return response.data;
  },
};
