import { apiClient } from './client';

export const homeApi = {
  // List all home sections
  getSections: async () => {
    try {
      const response = await apiClient.get('/admin/home/sections');
      const resData = response.data;
      if (resData?.data && Array.isArray(resData.data)) return resData.data;
      if (Array.isArray(resData)) return resData;
      return resData?.data || resData?.items || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  // Get single home section
  getSectionById: async (sectionId) => {
    const response = await apiClient.get(`/admin/home/sections/${sectionId}`);
    return response.data?.data || response.data;
  },

  // Create new home section
  createSection: async (sectionData) => {
    const response = await apiClient.post('/admin/home/sections', sectionData);
    return response.data;
  },

  // Update existing home section
  updateSection: async (sectionId, sectionData) => {
    const response = await apiClient.patch(`/admin/home/sections/${sectionId}`, sectionData);
    return response.data;
  },

  // Delete home section
  deleteSection: async (sectionId) => {
    const response = await apiClient.delete(`/admin/home/sections/${sectionId}`);
    return response.data;
  },

  // Reorder home sections
  reorderSections: async (sectionOrders) => {
    const response = await apiClient.patch('/admin/home/sections/reorder', {
      section_orders: sectionOrders,
      sections: sectionOrders,
    });
    return response.data;
  },

  // List carousel items for section
  getCarouselItems: async (sectionId) => {
    try {
      const response = await apiClient.get(`/admin/home/sections/${sectionId}/carousel-items`);
      const resData = response.data;
      if (resData?.data && Array.isArray(resData.data)) return resData.data;
      if (Array.isArray(resData)) return resData;
      return resData?.data || [];
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  // Get single carousel item detail
  getCarouselItemById: async (sectionId, itemId) => {
    const response = await apiClient.get(`/admin/home/sections/${sectionId}/carousel-items/${itemId}`);
    return response.data?.data || response.data;
  },

  // Create carousel item (slide)
  addCarouselSlide: async (sectionId, slideData) => {
    const response = await apiClient.post(`/admin/home/sections/${sectionId}/carousel-items`, slideData);
    return response.data;
  },

  // Update carousel item (slide)
  updateCarouselSlide: async (sectionId, itemId, slideData) => {
    const response = await apiClient.patch(`/admin/home/sections/${sectionId}/carousel-items/${itemId}`, slideData);
    return response.data;
  },

  // Reorder carousel items
  reorderCarouselItems: async (sectionId, items) => {
    const response = await apiClient.patch(`/admin/home/sections/${sectionId}/carousel-items/reorder`, {
      items: items.map((item) => ({
        id: item.id,
        display_order: item.display_order,
      })),
    });
    return response.data;
  },

  // Delete carousel item
  deleteCarouselSlide: async (sectionId, itemId) => {
    const response = await apiClient.delete(`/admin/home/sections/${sectionId}/carousel-items/${itemId}`);
    return response.data;
  },

  // Add section card item (for card grid sections)
  addSectionItem: async (sectionId, itemData) => {
    const response = await apiClient.post(`/admin/home/sections/${sectionId}/items`, itemData);
    return response.data;
  },
};

