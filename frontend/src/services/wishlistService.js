import api from './api';

export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  const dataObj = response.data?.data || response.data;
  return Array.isArray(dataObj?.wishlist) ? dataObj.wishlist : (Array.isArray(dataObj) ? dataObj : []);
};

export const addToWishlist = async ({ movie_id, event_id }) => {
  const response = await api.post('/wishlist', { movie_id, event_id });
  return response.data;
};

export const removeFromWishlist = async (id) => {
  const response = await api.delete(`/wishlist/${id}`);
  return response.data;
};
