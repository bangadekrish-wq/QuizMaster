import api from './api';

export const analyticsService = {
  getAdminDashboardData: async (range = '30d') => {
    const res = await api.get('/analytics/admin-dashboard', { params: { range } });
    return res.data?.data || res.data;
  },

  getAnalyticsData: async (range = '30d') => {
    const res = await api.get('/analytics/full', { params: { range } });
    return res.data?.data || res.data;
  },

  getStudentStats: async () => {
    const res = await api.get('/analytics/student');
    return res.data?.data || res.data;
  },
};
