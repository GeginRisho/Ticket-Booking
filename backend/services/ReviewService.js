const ReviewRepository = require('../repositories/ReviewRepository');
const Movie = require('../models').Movie;
const AppError = require('../utils/appError');

class ReviewService {
  async getMovieReviews(movieId) {
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    return await ReviewRepository.findByMovie(movieId);
  }

  async createReview(userId, movieId, { rating, review }) {
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    // Check duplicate
    const existing = await ReviewRepository.findUserMovieReview(userId, movieId);
    if (existing) {
      throw new AppError('You have already submitted a review for this movie', 400);
    }

    return await ReviewRepository.create({
      user_id: userId,
      movie_id: movieId,
      rating,
      review
    });
  }

  async updateReview(userId, id, { rating, review }) {
    const record = await ReviewRepository.findById(id);
    if (!record) {
      throw new AppError('Review not found', 404);
    }

    if (record.user_id !== userId) {
      throw new AppError('You can only update your own reviews', 403);
    }

    return await ReviewRepository.update(id, { rating, review });
  }

  async deleteReview(userId, id, userRole) {
    const record = await ReviewRepository.findById(id);
    if (!record) {
      throw new AppError('Review not found', 404);
    }

    if (userRole !== 'Admin' && record.user_id !== userId) {
      throw new AppError('Access denied. You can only delete your own reviews', 403);
    }

    return await ReviewRepository.delete(id);
  }
}

module.exports = new ReviewService();
