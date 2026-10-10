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

const READ_ONLY_METHODS = ['get', 'head', 'options'];

/** Pulls the human-readable message out of the backend error envelope
 *  ({"error": {"message", "details"}}) or older flat shapes. */
export const extractErrorMessage = (data, fallback) => {
  const envelope = data?.error;
  if (envelope && typeof envelope === 'object' && envelope.message) {
    const reasons = envelope.details?.reasons;
    if (Array.isArray(reasons) && reasons.length > 0) {
      return `${envelope.message} ${reasons.join(' ')}`;
    }
    return envelope.message;
  }
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.message === 'string') return data.message;
  return fallback;
};

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
    // The Super Admin is a read-only oversight role: block write requests to
    // admin APIs up front (the backend enforces the same rule) so the UI shows
    // a clear explanation instead of a generic failure. Role assignment
    // (/admin/profiles/{id}/roles) is the one deliberate write exception —
    // the backend's require_role_management_access allows it for both tiers.
    const method = (config.method || 'get').toLowerCase();
    const url = config.url || '';
    const isRoleAssignmentRoute = /^\/admin\/profiles\/[^/]+\/roles$/.test(url);
    if (
      useAuthStore.getState().isReadOnly &&
      !READ_ONLY_METHODS.includes(method) &&
      !url.startsWith('/super-admin') &&
      !url.startsWith('/auth/') &&
      !isRoleAssignmentRoute
    ) {
      return Promise.reject({
        message: 'Super Admin access is read-only. Use "Report Issue" to ask an Admin to make this change.',
        detail: 'Super Admin access is read-only. Use "Report Issue" to ask an Admin to make this change.',
        error_code: 'ERR_READ_ONLY',
        status: 403,
      });
    }

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
    if (error?.error_code === 'ERR_READ_ONLY') return Promise.reject(error);

    const originalRequest = error.config;
    const status = error.response?.status;
    const detail = extractErrorMessage(
      error.response?.data,
      error.message || 'An unexpected API error occurred.'
    );

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

    const customError = {
      message: detail,
      detail: detail,
      error_code:
        error.response?.data?.error?.code ||
        error.response?.data?.error_code ||
        `ERR_HTTP_${status || 'NETWORK'}`,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
      status: status,
    };
    return Promise.reject(customError);
  }
);
