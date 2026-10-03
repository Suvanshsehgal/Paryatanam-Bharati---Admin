import { apiClient } from './client';

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // Fresh profile + roles for the signed-in account (roles can change server-side).
  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data?.data || response.data;
  },
};
