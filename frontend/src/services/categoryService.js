import api from './api';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const categoryService = {
  getCategories: async (params = {}) => {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('categories').select('*');
        if (params.search) {
          query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (err) {
        return [];
      }
    }
    const res = await api.get('/categories', { params });
    return res.data;
  },

  createCategory: async (data) => {
    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase.from('categories').insert([data]).select().single();
      if (error) throw error;
      return created;
    }
    const res = await api.post('/categories', data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase.from('categories').update(data).eq('id', id).select().single();
      if (error) throw error;
      return updated;
    }
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return { success: true, id };
    }
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};
