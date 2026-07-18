import api from './api';

export const validateCoupon = async (couponCode, totalAmount) => {
  const response = await api.post('/coupons/validate', {
    coupon_code: couponCode,
    total_amount: totalAmount
  });
  return response.data;
};

export const getCoupons = async () => {
  const response = await api.get('/coupons');
  return response.data;
};

export const getCoupon = async (id) => {
  const response = await api.get(`/coupons/${id}`);
  return response.data;
};

export const createCoupon = async (couponData) => {
  const response = await api.post('/coupons', couponData);
  return response.data;
};

export const updateCoupon = async (id, couponData) => {
  const response = await api.put(`/coupons/${id}`, couponData);
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};
