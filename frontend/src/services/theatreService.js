import api from './api';

export const getTheatres = async (params = {}) => {
  const response = await api.get('/theatres', { params });
  const dataObj = response.data?.data || response.data;
  return Array.isArray(dataObj?.theatres) ? dataObj.theatres : (Array.isArray(dataObj) ? dataObj : []);
};

export const getTheatreDetails = async (id) => {
  const response = await api.get(`/theatres/${id}`);
  return response.data;
};

export const createTheatre = async (theatreData) => {
  const response = await api.post('/theatres', theatreData);
  return response.data;
};

export const updateTheatre = async (id, theatreData) => {
  const response = await api.put(`/theatres/${id}`, theatreData);
  return response.data;
};

export const deleteTheatre = async (id) => {
  const response = await api.delete(`/theatres/${id}`);
  return response.data;
};

export const updateTheatreStatus = async (id, status) => {
  const response = await api.patch(`/theatres/${id}/status`, { status });
  return response.data;
};
