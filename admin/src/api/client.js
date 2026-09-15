import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://paryatanam-bharati-backend.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

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

// Response Interceptor: Format errors & handle auth failures
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.response?.data?.message || error.message || 'An unexpected API error occurred.';

    if (status === 401) {
      console.warn('Unauthorized (401): Session token expired or invalid.');
    } else if (status === 403) {
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
