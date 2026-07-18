const MovieRepository = require('../repositories/MovieRepository');
const MovieCastRepository = require('../repositories/MovieCastRepository');
const AppError = require('../utils/appError');

class MovieService {
  async getMovies(filters) {
    return await MovieRepository.findFiltered(filters);
  }

  async getMovieById(id) {
    const movie = await MovieRepository.findDetailWithCastAndReviews(id);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    return movie;
  }

  async createMovie(data) {
    return await MovieRepository.create(data);
  }

  async updateMovie(id, data) {
    const movie = await MovieRepository.findById(id);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    return await MovieRepository.update(id, data);
  }

  async deleteMovie(id) {
    const movie = await MovieRepository.findById(id);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    return await MovieRepository.delete(id);
  }

  async addCast(movieId, castData) {
    const movie = await MovieRepository.findById(movieId);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    return await MovieCastRepository.create({
      ...castData,
      movie_id: movieId
    });
  }

  async removeCast(movieId, castId) {
    const cast = await MovieCastRepository.findById(castId);
    if (!cast || cast.movie_id !== movieId) {
      throw new AppError('Movie cast member not found or does not belong to this movie', 404);
    }
    return await MovieCastRepository.delete(castId);
  }
}

module.exports = new MovieService();
