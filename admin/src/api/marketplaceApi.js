import { apiClient } from './client';

export const marketplaceApi = {
  getPendingProducts: async () => {
    try {
      const response = await apiClient.get('/admin/marketplace/products');
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data?.data || data?.items || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  moderateProduct: async (productId, { action, rejection_reason = null }) => {
    if (action === 'APPROVED') {
      const response = await apiClient.post(`/admin/marketplace/products/${productId}/approve`);
      return response.data;
    } else {
      const response = await apiClient.post(`/admin/marketplace/products/${productId}/reject`, {
        reason: rejection_reason,
      });
      return response.data;
    }
  },

  certifyProduct: async (productId, { certification_status }) => {
    const response = await apiClient.patch(`/admin/marketplace/products/${productId}/certification`, {
      certification_status,
    });
    return response.data;
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/admin/marketplace/categories');
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data?.data || data?.items || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/admin/marketplace/categories', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await apiClient.patch(`/admin/marketplace/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await apiClient.delete(`/admin/marketplace/categories/${categoryId}`);
    return response.data;
  },
};
