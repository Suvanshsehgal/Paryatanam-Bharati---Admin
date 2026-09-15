import { apiClient } from './client';

export const homeApi = {
  getSections: async () => {
    try {
      const response = await apiClient.get('/admin/home/sections');
      const data = response.data;
      if (Array.isArray(data)) return data;
      return data?.data || data?.items || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  createSection: async (sectionData) => {
    const response = await apiClient.post('/admin/home/sections', sectionData);
    return response.data;
  },

  reorderSections: async (sectionOrders) => {
    const response = await apiClient.patch('/admin/home/sections/reorder', {
      section_orders: sectionOrders,
    });
    return response.data;
  },

  addSectionItem: async (sectionId, itemData) => {
    const response = await apiClient.post(`/admin/home/sections/${sectionId}/items`, itemData);
    return response.data;
  },

  addCarouselSlide: async (sectionId, slideData) => {
    const response = await apiClient.post(`/admin/home/sections/${sectionId}/carousel-items`, slideData);
    return response.data;
  },
};
