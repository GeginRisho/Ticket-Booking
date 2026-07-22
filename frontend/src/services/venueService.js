import api from './api';

export const getVenues = async () => {
  const response = await api.get('/venues');
  return response.data?.data || response.data || [];
};

export const getVenueDetails = async (id) => {
  const response = await api.get(`/venues/${id}`);
  return response.data?.data || response.data;
};

export const createVenue = async (venueData) => {
  const response = await api.post('/venues', venueData);
  return response.data?.data || response.data;
};

export const updateVenue = async (id, venueData) => {
  const response = await api.put(`/venues/${id}`, venueData);
  return response.data?.data || response.data;
};

export const deleteVenue = async (id) => {
  const response = await api.delete(`/venues/${id}`);
  return response.data;
};
