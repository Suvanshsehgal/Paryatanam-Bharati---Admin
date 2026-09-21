import { apiClient } from './client';

export const prasadApi = {
  getTemples: async () => {
    try {
      const response = await apiClient.get('/admin/prasad/temples');
      // Extract array from paginated response
      return response.data?.data || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  createTemple: async (templeData) => {
    const response = await apiClient.post('/admin/prasad/temples', templeData);
    return response.data;
  },

  publishTemple: async (id) => {
    const response = await apiClient.post(`/admin/prasad/temples/${id}/publish`);
    return response.data;
  },

  addOffering: async (templeId, offeringData) => {
    const response = await apiClient.post('/admin/prasad/offerings', {
      temple_id: templeId,
      ...offeringData,
    });
    return response.data;
  },

  publishOffering: async (id) => {
    const response = await apiClient.post(`/admin/prasad/offerings/${id}/publish`);
    return response.data;
  },

  getOfferings: async (templeId) => {
    try {
      const response = await apiClient.get('/admin/prasad/offerings', {
        params: { temple_id: templeId || undefined },
      });
      return response.data?.data || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  getPrasadOrders: async ({ status = '' } = {}) => {
    try {
      const response = await apiClient.get('/admin/prasad/bookings', {
        params: { status: status && status !== 'ALL' ? status : undefined },
      });
      return response.data?.data || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },
};
