import api from './api';

export const questionService = {
  getQuestionsByQuizId: async (quizId) => {
    const res = await api.get(`/quizzes/${quizId}/questions`);
    return res.data?.data || res.data || [];
  },

  createQuestion: async (quizId, data) => {
    const res = await api.post(`/quizzes/${quizId}/questions`, data);
    return res.data?.data || res.data;
  },

  updateQuestion: async (questionId, data) => {
    const res = await api.put(`/questions/${questionId}`, data);
    return res.data?.data || res.data;
  },

  deleteQuestion: async (questionId) => {
    const res = await api.delete(`/questions/${questionId}`);
    return res.data?.data || res.data;
  },
};
