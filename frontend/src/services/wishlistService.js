import api from './api';

export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

export const addToWishlist = async ({ movie_id, event_id }) => {
  const response = await api.post('/wishlist', { movie_id, event_id });
  return response.data;
};

export const removeFromWishlist = async (id) => {
  const response = await api.delete(`/wishlist/${id}`);
  return response.data;
};
