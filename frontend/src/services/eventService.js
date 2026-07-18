import api from './api';

export const getEventCategories = async () => {
  const response = await api.get('/events/categories');
  return response.data;
};

export const createEventCategory = async (categoryData) => {
  const response = await api.post('/events/categories', categoryData);
  return response.data;
};

export const getEvents = async (params = {}) => {
  const response = await api.get('/events', { params });
  return response.data;
};

export const getPopularEvents = async (cityId) => {
  return await getEvents({ status: 'active', city_id: cityId });
};

export const getEventDetails = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData);
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};
