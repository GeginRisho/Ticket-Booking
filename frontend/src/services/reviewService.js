import api from './api';

export const getMovieReviews = async (movieId) => {
  const response = await api.get(`/movies/${movieId}/reviews`);
  const dataObj = response.data?.data || response.data;
  return Array.isArray(dataObj?.reviews) ? dataObj.reviews : (Array.isArray(dataObj) ? dataObj : []);
};

export const createReview = async (movieId, reviewData) => {
  const response = await api.post(`/movies/${movieId}/reviews`, reviewData);
  return response.data;
};

export const updateReview = async (id, reviewData) => {
  const response = await api.put(`/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};
