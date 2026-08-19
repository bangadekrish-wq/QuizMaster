import api from './api';

export const leaderboardService = {
  getLeaderboard: async (tab = 'Overall', category = 'All') => {
    const res = await api.get('/leaderboard', { params: { tab, category } });
    return res.data?.data || res.data || [];
  },
};
