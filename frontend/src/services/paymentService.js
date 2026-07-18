import api from './api';

// Create a Razorpay order for a booking
export const createPaymentOrder = async (bookingId) => {
  const response = await api.post('/payments/order', { booking_id: bookingId });
  return response.data;
};

// Verify payment signature
export const verifyPayment = async (verificationData) => {
  const response = await api.post('/payments/verify', verificationData);
  return response.data;
};

// Process refund
export const refundPayment = async (paymentId, refundData) => {
  const response = await api.post(`/payments/${paymentId}/refund`, refundData);
  return response.data;
};
