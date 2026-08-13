import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    const payload = res.data;
    return {
      users: payload?.data || payload?.users || [],
      total: payload?.pagination?.total || 0,
      totalPages: payload?.pagination?.totalPages || 1,
    };
  },

  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data?.data || res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/users/${id}/status`, { status });
    return res.data?.data || res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data?.data || res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data?.data || res.data;
  },
};
