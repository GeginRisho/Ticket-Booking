const BaseRepository = require('./BaseRepository');
const { Wishlist, Movie, Event, City } = require('../models');

class WishlistRepository extends BaseRepository {
  constructor() {
    super(Wishlist);
  }

  async findUserWishlist(user_id, options = {}) {
    return await this.findAll({
      where: { user_id },
      include: [
        { model: Movie, as: 'movie' },
        { 
          model: Event, 
          as: 'event', 
          include: [{ model: City, as: 'city' }] 
        }
      ],
      ...options
    });
  }

  async findExistingItem(user_id, { movie_id, event_id }, options = {}) {
    const where = { user_id };
    if (movie_id) where.movie_id = movie_id;
    if (event_id) where.event_id = event_id;
    return await this.findOne({ where, ...options });
  }
}

module.exports = new WishlistRepository();
