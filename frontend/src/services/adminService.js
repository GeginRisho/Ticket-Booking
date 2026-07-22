import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard-stats');
  return response.data;
};

export const getOrganizers = async (status = '') => {
  const response = await api.get('/admin/organizers', { params: { status } });
  return response.data?.data || response.data || [];
};

export const getOrganizerDetails = async (id) => {
  const response = await api.get(`/admin/organizers/${id}`);
  return response.data?.data || response.data;
};

export const updateOrganizerStatus = async (id, status, reason = '') => {
  const response = await api.put(`/admin/organizers/${id}/status`, { status, reason });
  return response.data;
};

export const getOrganizerEvents = async (id) => {
  const response = await api.get(`/admin/organizers/${id}/events`);
  return response.data?.data || response.data || [];
};

export const getOrganizerPerformance = async (id) => {
  const response = await api.get(`/admin/organizers/${id}/performance`);
  return response.data?.data || response.data;
};

export const approveEvent = async (id) => {
  const response = await api.put(`/events/${id}/approve`);
  return response.data;
};

export const rejectEvent = async (id, reason = '') => {
  const response = await api.put(`/events/${id}/reject`, { reason });
  return response.data;
};
