import api from './api';

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  const dataObj = response.data?.data || response.data;
  return Array.isArray(dataObj?.notifications) ? dataObj.notifications : (Array.isArray(dataObj) ? dataObj : []);
};

export const markAllRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

export const markRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};
