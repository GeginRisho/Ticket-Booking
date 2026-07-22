import api from './api';

export const getOrganizerAnalytics = async () => {
  const response = await api.get('/organizer/analytics');
  return response.data?.data || response.data;
};

export const getOrganizerBookings = async (params = {}) => {
  const response = await api.get('/organizer/bookings', { params });
  return response.data?.data || response.data || [];
};

export const checkInParticipant = async (bookingId) => {
  const response = await api.post(`/organizer/bookings/${bookingId}/check-in`);
  return response.data;
};

export const cancelParticipantRegistration = async (bookingId) => {
  const response = await api.post(`/organizer/bookings/${bookingId}/cancel`);
  return response.data;
};
