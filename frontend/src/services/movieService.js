import api from './api';

// Fetch all movies (optionally with filters)
export const getMovies = async (params = {}) => {
  const response = await api.get('/movies', { params });
  return response.data;
};

// Client-side wrappers to simulate filtered movie rows on home page using standard getMovies
export const getPopularMovies = async (cityId) => {
  // Query all active movies
  return await getMovies({ status: 'now_showing', city_id: cityId });
};

export const getTrendingMovies = async (cityId) => {
  return await getMovies({ status: 'now_showing', city_id: cityId });
};

export const getLatestMovies = async () => {
  return await getMovies({ status: 'coming_soon' });
};

export const getMovieDetails = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

export const createMovie = async (movieData) => {
  const response = await api.post('/movies', movieData);
  return response.data;
};

export const updateMovie = async (id, movieData) => {
  const response = await api.put(`/movies/${id}`, movieData);
  return response.data;
};

export const deleteMovie = async (id) => {
  const response = await api.delete(`/movies/${id}`);
  return response.data;
};

export const addMovieCast = async (movieId, castData) => {
  const response = await api.post(`/movies/${movieId}/cast`, castData);
  return response.data;
};

export const removeMovieCast = async (movieId, castId) => {
  const response = await api.delete(`/movies/${movieId}/cast/${castId}`);
  return response.data;
};

export const getActionMovies = async () => getMovies({ genre: 'action' });
export const getComedyMovies = async () => getMovies({ genre: 'comedy' });
export const getDramaMovies = async () => getMovies({ genre: 'drama' });
export const getScifiMovies = async () => getMovies({ genre: 'scifi' });
export const getHorrorMovies = async () => getMovies({ genre: 'horror' });
export const getAnimationMovies = async () => getMovies({ genre: 'animation' });
export const searchMovies = async (query) => getMovies({ search: query });
