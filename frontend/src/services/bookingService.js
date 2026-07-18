import api from './api';

// Helper to inject computed event_ticket_quantity for event bookings
const injectEventQuantity = (booking) => {
  if (booking && !booking.show_id && booking.eventTicket && booking.eventTicket.price) {
    const total = parseFloat(booking.total_amount) + parseFloat(booking.discount || 0);
    booking.event_ticket_quantity = Math.round(total / parseFloat(booking.eventTicket.price)) || 1;
  }
  return booking;
};

// Fetch screen layout and seat availability for a showtime
export const getShowSeats = async (showId) => {
  const response = await api.get(`/shows/${showId}/seats`);
  return response.data;
};

// Create a movie show booking
export const createMovieBooking = async (bookingData) => {
  const response = await api.post('/bookings/movie', bookingData);
  if (response.data?.data?.booking) {
    injectEventQuantity(response.data.data.booking);
  }
  return response.data;
};

// Create an event ticket booking
export const createEventBooking = async (bookingData) => {
  const response = await api.post('/bookings/event', bookingData);
  if (response.data?.data?.booking) {
    injectEventQuantity(response.data.data.booking);
  }
  return response.data;
};

// Fetch bookings list for the logged-in user
export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  const dataObj = response.data?.data || response.data;
  const list = Array.isArray(dataObj?.bookings) ? dataObj.bookings : (Array.isArray(dataObj) ? dataObj : []);
  list.forEach(injectEventQuantity);
  return list;
};

// Fetch single booking details
export const getBookingDetails = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  const booking = response.data?.data?.booking || response.data?.booking;
  if (booking) {
    injectEventQuantity(booking);
  }
  return response.data;
};

// Cancel booking
export const cancelBooking = async (id) => {
  const response = await api.post(`/bookings/${id}/cancel`);
  return response.data;
};
