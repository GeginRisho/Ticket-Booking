import api from './api';

export const getShows = async (params = {}) => {
  const response = await api.get('/shows', { params });
  return response.data;
};

export const getShowDetails = async (id) => {
  const response = await api.get(`/shows/${id}`);
  return response.data;
};

export const createShow = async (showData) => {
  const response = await api.post('/shows', showData);
  return response.data;
};

export const updateShow = async (id, showData) => {
  const response = await api.put(`/shows/${id}`, showData);
  return response.data;
};

export const deleteShow = async (id) => {
  const response = await api.delete(`/shows/${id}`);
  return response.data;
};
