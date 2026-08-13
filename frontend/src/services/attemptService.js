import api from './api';

export const attemptService = {
  startQuiz: async (quizId) => {
    const res = await api.post(`/quizzes/${quizId}/start`);
    return res.data;
  },

  submitQuiz: async (quizId, answersData) => {
    const res = await api.post(`/quizzes/${quizId}/submit`, answersData);
    return res.data;
  },

  getAttempts: async (params = {}) => {
    const res = await api.get('/attempts', { params });
    const payload = res.data;
    return payload?.data || payload?.attempts || (Array.isArray(payload) ? payload : []);
  },

  getAttemptResult: async (attemptId) => {
    const res = await api.get(`/attempts/${attemptId}`);
    return res.data?.data || res.data;
  },
};
