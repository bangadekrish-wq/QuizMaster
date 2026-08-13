import api from './api';

export const authService = {
  // Public Student Registration
  register: async ({ email, password, fullName }) => {
    const response = await api.post('/auth/register', { name: fullName, email, password });
    return response.data;
  },

  // Student Login
  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Admin Login
  adminLogin: async ({ email, password }) => {
    const response = await api.post('/auth/admin/login', { email, password });
    return response.data;
  },

  // Sign out
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('qm_user');
    localStorage.removeItem('qm_token');
  },

  // Password Reset Request
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Update Password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, password: newPassword });
    return response.data;
  },

  // Get current active session user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
