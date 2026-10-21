import { apiClient } from './client';
import { normalizePrasadOrdersResponse, prasadOrdersParams } from '../utils/prasadOrders';

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

  // Registers a media reference by URL (the backend's /media endpoint takes
  // a TempleMediaCreate JSON body — a file_path string — not a file upload;
  // there is no multipart/file-storage handling on this route).
  addTempleMedia: async (id, data) => {
    const response = await apiClient.post(`/admin/prasad/temples/${id}/media`, data);
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

  // Prasad bookings (GET /admin/prasad/bookings, Admin only). Returns the rows
  // with the server's pagination metadata; failures are thrown so the page can
  // show an error instead of an empty (misleading) table.
  getPrasadOrders: async ({ status = 'ALL', page = 1, limit = 10 } = {}) => {
    const response = await apiClient.get('/admin/prasad/bookings', {
      params: prasadOrdersParams({ status, page, limit }),
    });
    return normalizePrasadOrdersResponse(response.data, { page, limit });
  },
};

