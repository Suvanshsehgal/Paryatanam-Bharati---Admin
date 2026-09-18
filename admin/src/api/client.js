import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://paryatanam-bharati-backend.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Auto-attach Authorization Header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('paryatanam_admin_token');
    if (token) {
      const authHeader = `Bearer ${token}`;
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', authHeader);
      } else {
        config.headers = config.headers || {};
        config.headers['Authorization'] = authHeader;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Single-flight refresh token handling & safe retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const detail =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected API error occurred.';

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('paryatanam_admin_refresh_token');

      if (!refreshToken) {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject({
          message: detail,
          detail: detail,
          error_code: 'ERR_UNAUTHORIZED',
          status: 401,
        });
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
            } else {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const resData = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = resData?.access_token;
        const newRefreshToken = resData?.refresh_token;

        if (!newAccessToken) {
          throw new Error('Refresh response missing access token');
        }

        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        } else {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          detail: 'Session expired. Please log in again.',
          error_code: 'ERR_SESSION_EXPIRED',
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      console.warn('Forbidden (403): User lacks ADMIN permissions for this resource.');
    }

    const customError = {
      message: detail,
      detail: detail,
      error_code: error.response?.data?.error_code || `ERR_HTTP_${status || 'NETWORK'}`,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
      status: status,
    };
    return Promise.reject(customError);
  }
);
