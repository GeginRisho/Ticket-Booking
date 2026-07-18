const WishlistRepository = require('../repositories/WishlistRepository');
const Movie = require('../models').Movie;
const Event = require('../models').Event;
const AppError = require('../utils/appError');

class WishlistService {
  async getWishlist(userId) {
    return await WishlistRepository.findUserWishlist(userId);
  }

  async addToWishlist(userId, { movie_id, event_id }) {
    if (!movie_id && !event_id) {
      throw new AppError('Wishlist item must reference either a movie or an event', 400);
    }
    if (movie_id && event_id) {
      throw new AppError('Wishlist item cannot reference both a movie and an event', 400);
    }

    if (movie_id) {
      const movie = await Movie.findByPk(movie_id);
      if (!movie) {
        throw new AppError('Movie not found', 404);
      }
    }

    if (event_id) {
      const event = await Event.findByPk(event_id);
      if (!event) {
        throw new AppError('Event not found', 404);
      }
    }

    // Check if duplicate exists
    const existing = await WishlistRepository.findExistingItem(userId, { movie_id, event_id });
    if (existing) {
      throw new AppError('This item is already in your wishlist', 400);
    }

    return await WishlistRepository.create({
      user_id: userId,
      movie_id: movie_id || null,
      event_id: event_id || null
    });
  }

  async removeFromWishlist(userId, id) {
    const item = await WishlistRepository.findById(id);
    if (!item) {
      throw new AppError('Wishlist item not found', 404);
    }

    if (item.user_id !== userId) {
      throw new AppError('You do not own this wishlist item', 403);
    }

    return await WishlistRepository.delete(id);
  }
}

module.exports = new WishlistService();
