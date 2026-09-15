import { apiClient } from './client';

export const wellnessApi = {
  getProviders: async () => {
    try {
      const response = await apiClient.get('/admin/wellness/providers');
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data?.data || data?.items || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  createProvider: async (providerData) => {
    const response = await apiClient.post('/wellness/vendor/providers', providerData);
    return response.data;
  },

  getServices: async () => {
    try {
      const response = await apiClient.get('/admin/wellness/services');
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data?.data || data?.items || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  addService: async (serviceData) => {
    const response = await apiClient.post('/wellness/vendor/services', serviceData);
    return response.data;
  },
};
