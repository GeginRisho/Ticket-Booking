import api from './api';

// Fetch all movies (optionally with filters)
export const getMovies = async (params = {}) => {
  const response = await api.get('/movies', { params });
  const dataObj = response.data?.data || response.data;
  return Array.isArray(dataObj?.movies) ? dataObj.movies : (Array.isArray(dataObj) ? dataObj : []);
};

// Client-side wrappers to simulate filtered movie rows on home page using standard getMovies
export const getPopularMovies = async (params = {}) => {
  // Query all active movies
  const finalParams = typeof params === 'string' ? { city_id: params } : params;
  return await getMovies({ status: 'now_showing', ...finalParams });
};

export const getTrendingMovies = async (params = {}) => {
  const finalParams = typeof params === 'string' ? { city_id: params } : params;
  return await getMovies({ status: 'now_showing', ...finalParams });
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

export const getActionMovies = async (params = {}) => getMovies({ genre: 'action', ...params });
export const getComedyMovies = async (params = {}) => getMovies({ genre: 'comedy', ...params });
export const getDramaMovies = async (params = {}) => getMovies({ genre: 'drama', ...params });
export const getScifiMovies = async (params = {}) => getMovies({ genre: 'scifi', ...params });
export const getHorrorMovies = async (params = {}) => getMovies({ genre: 'horror', ...params });
export const getAnimationMovies = async (params = {}) => getMovies({ genre: 'animation', ...params });
export const searchMovies = async (query) => getMovies({ search: query });
