import api from './api';

export const getScreens = async (theatreId) => {
  const response = await api.get(`/theatres/${theatreId}/screens`);
  const dataObj = response.data?.data || response.data;
  return Array.isArray(dataObj?.screens) ? dataObj.screens : (Array.isArray(dataObj) ? dataObj : []);
};

export const getScreenDetails = async (id) => {
  const response = await api.get(`/screens/${id}`);
  return response.data;
};

export const createScreen = async (theatreId, screenData) => {
  const response = await api.post(`/theatres/${theatreId}/screens`, screenData);
  return response.data;
};

export const updateScreen = async (id, screenData) => {
  const response = await api.put(`/screens/${id}`, screenData);
  return response.data;
};

export const deleteScreen = async (id) => {
  const response = await api.delete(`/screens/${id}`);
  return response.data;
};
