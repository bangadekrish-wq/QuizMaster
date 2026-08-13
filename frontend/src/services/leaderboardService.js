import api from './api';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const leaderboardService = {
  getLeaderboard: async (tab = 'Overall', category = 'All') => {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('leaderboard').select('*').order('points', { ascending: false });
        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (err) {
        return [];
      }
    }
    const res = await api.get('/leaderboard', { params: { tab, category } });
    return res.data;
  },
};
