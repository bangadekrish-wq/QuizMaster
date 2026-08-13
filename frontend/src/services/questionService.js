import api from './api';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const questionService = {
  getQuestionsByQuizId: async (quizId) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('questions').select('*').eq('quiz_id', quizId);
        if (error) throw error;
        return data || [];
      } catch (err) {
        return [];
      }
    }
    const res = await api.get(`/quizzes/${quizId}/questions`);
    return res.data;
  },

  createQuestion: async (quizId, data) => {
    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase.from('questions').insert([{ quiz_id: quizId, ...data }]).select().single();
      if (error) throw error;
      return created;
    }
    const res = await api.post(`/quizzes/${quizId}/questions`, data);
    return res.data;
  },

  updateQuestion: async (questionId, data) => {
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase.from('questions').update(data).eq('id', questionId).select().single();
      if (error) throw error;
      return updated;
    }
    const res = await api.put(`/questions/${questionId}`, data);
    return res.data;
  },

  deleteQuestion: async (questionId) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('questions').delete().eq('id', questionId);
      if (error) throw error;
      return { success: true, id: questionId };
    }
    const res = await api.delete(`/questions/${questionId}`);
    return res.data;
  },
};
