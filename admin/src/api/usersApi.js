import { apiClient } from './client';

export const usersApi = {
  getUsers: async ({ page = 1, limit = 20, role = '', search = '' } = {}) => {
    try {
      const response = await apiClient.get('/admin/profiles', {
        params: {
          page: Number(page),
          limit: Number(limit),
          role: role || undefined,
          search: search || undefined,
        },
      });

      const resData = response.data?.data || response.data;
      const items = resData?.items || (Array.isArray(resData) ? resData : []);
      const meta = resData?.meta || {};

      const pageNum = Number(meta.page || page);
      const limitNum = Number(meta.limit || limit);
      const totalRecords = Number(meta.total_items ?? meta.total_records ?? items.length);
      const totalPages = Number(meta.total_pages || Math.ceil(totalRecords / limitNum) || 1);

      return {
        data: items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total_records: totalRecords,
          total_pages: totalPages,
        },
        meta: meta,
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

  getProfileById: async (profileId) => {
    const response = await apiClient.get(`/admin/profiles/${profileId}`);
    return response.data?.data || response.data;
  },

  updateUserRoles: async (userId, roles) => {
    try {
      const response = await apiClient.put(`/admin/profiles/${userId}/roles`, { roles });
      return response.data;
    } catch (err) {
      // Fallback if role endpoint differs on backend
      const response = await apiClient.put(`/auth/admin/users/${userId}/roles`, { roles });
      return response.data;
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await apiClient.patch(`/admin/profiles/${userId}/status`, { status });
      return response.data;
    } catch (err) {
      // Fallback if status endpoint differs on backend
      const response = await apiClient.patch(`/auth/admin/users/${userId}/status`, { status });
      return response.data;
    }
  },
};


