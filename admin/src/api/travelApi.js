import { apiClient } from './client';

export const travelApi = {
  getDestinations: async () => {
    try {
      const response = await apiClient.get('/admin/travel/destinations');
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data?.data || data?.items || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  createDestination: async (data) => {
    const response = await apiClient.post('/admin/travel/destinations', data);
    return response.data;
  },

  updateDestination: async (destId, data) => {
    const response = await apiClient.patch(`/admin/travel/destinations/${destId}`, data);
    return response.data;
  },

  getPendingTours: async () => {
    try {
      const response = await apiClient.get('/admin/travel/tours');
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data?.data || data?.items || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  moderateTour: async (tourId, { is_published }) => {
    if (is_published) {
      const response = await apiClient.post(`/admin/travel/tours/${tourId}/publish`);
      return response.data;
    } else {
      const response = await apiClient.post(`/admin/travel/tours/${tourId}/unpublish`);
      return response.data;
    }
  },
};
