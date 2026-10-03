import { apiClient } from './client';

const toPage = (resData, page, limit) => {
  const items = resData?.items || [];
  const meta = resData?.meta || {};
  return {
    data: items,
    pagination: {
      page: Number(meta.page || page),
      limit: Number(meta.limit || limit),
      total_records: Number(meta.total_items ?? items.length),
      total_pages: Number(meta.total_pages || 1),
    },
  };
};

export const oversightApi = {
  // ---- Super Admin ----
  getActivitySummary: async () => {
    const response = await apiClient.get('/super-admin/activity/summary');
    return response.data?.data;
  },

  getActivity: async ({ page = 1, limit = 20, actorRole = '', module = '', search = '' } = {}) => {
    const response = await apiClient.get('/super-admin/activity', {
      params: {
        page,
        limit,
        actor_role: actorRole || undefined,
        module: module || undefined,
        search: search || undefined,
      },
    });
    return toPage(response.data?.data, page, limit);
  },

  createReport: async (report) => {
    const response = await apiClient.post('/super-admin/reports', report);
    return response.data?.data;
  },

  getSuperAdminReports: async ({ page = 1, limit = 20, status = '' } = {}) => {
    const response = await apiClient.get('/super-admin/reports', {
      params: { page, limit, status: status || undefined },
    });
    return toPage(response.data?.data, page, limit);
  },

  // ---- Admin ----
  getAdminReports: async ({ page = 1, limit = 20, status = '' } = {}) => {
    const response = await apiClient.get('/admin/issue-reports', {
      params: { page, limit, status: status || undefined },
    });
    return toPage(response.data?.data, page, limit);
  },

  handleReport: async (reportId, { status, admin_response }) => {
    const response = await apiClient.patch(`/admin/issue-reports/${reportId}`, {
      status,
      admin_response,
    });
    return response.data?.data;
  },
};
