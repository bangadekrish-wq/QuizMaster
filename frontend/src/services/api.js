import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds to accommodate Render free tier cold starts
});

// Request Interceptor to attach Authorization Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired / Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('qm_token');
        localStorage.removeItem('qm_user');
        // Do not hard redirect if on auth pages
      }
    }
    return Promise.reject(error);
  }
);

export default api;
