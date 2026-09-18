import { apiClient } from './client';

export const marketplaceApi = {
  getPendingProducts: async (statusFilter = 'PENDING_QUEUE') => {
    try {
      const params = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await apiClient.get('/admin/marketplace/products', { params });
      
      const resData = response.data;
      if (Array.isArray(resData)) return resData;
      if (resData?.data && Array.isArray(resData.data)) return resData.data;
      if (resData?.data?.data && Array.isArray(resData.data.data)) return resData.data.data;
      if (resData?.items && Array.isArray(resData.items)) return resData.items;
      if (resData?.data?.items && Array.isArray(resData.data.items)) return resData.data.items;
      
      return [];
    } catch (err) {
      if (err?.status === 404 || err?.response?.status === 404) return [];
      throw err;
    }
  },

  moderateProduct: async (productId, { action, rejection_reason = null }) => {
    if (action === 'APPROVED') {
      const response = await apiClient.post(`/admin/marketplace/products/${productId}/approve`);
      return response.data;
    } else {
      const response = await apiClient.post(`/admin/marketplace/products/${productId}/reject`, {
        rejection_reason: rejection_reason,
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
      
      const resData = response.data;
      if (Array.isArray(resData)) return resData;
      if (resData?.data && Array.isArray(resData.data)) return resData.data;
      if (resData?.data?.data && Array.isArray(resData.data.data)) return resData.data.data;
      if (resData?.items && Array.isArray(resData.items)) return resData.items;
      if (resData?.data?.items && Array.isArray(resData.data.items)) return resData.data.items;
      
      return [];
    } catch (err) {
      if (err?.status === 404 || err?.response?.status === 404) return [];
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
