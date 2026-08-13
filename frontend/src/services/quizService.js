import api from './api';

export const quizService = {
  getQuizzes: async (params = {}) => {
    const res = await api.get('/quizzes', { params });
    return res.data?.data || res.data || [];
  },

  getQuizById: async (id) => {
    const res = await api.get(`/quizzes/${id}`);
    return res.data?.data || res.data;
  },

  createQuiz: async (data, excelFile = null) => {
    if (excelFile) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      formData.append('excelFile', excelFile);
      const res = await api.post('/quizzes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data || res.data;
    }

    const res = await api.post('/quizzes', data);
    return res.data?.data || res.data;
  },

  updateQuiz: async (id, data) => {
    const res = await api.put(`/quizzes/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteQuiz: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data?.data || res.data;
  },

  publishQuiz: async (id, status) => {
    const res = await api.patch(`/quizzes/${id}/publish`, { status });
    return res.data?.data || res.data;
  },

  importExcel: async (quizId, excelFile) => {
    const formData = new FormData();
    formData.append('excelFile', excelFile);
    const res = await api.post(`/quizzes/${quizId}/import-excel`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  downloadExcelTemplate: () => {
    window.open(`${api.defaults.baseURL}/quizzes/excel-template`, '_blank');
  },
};
