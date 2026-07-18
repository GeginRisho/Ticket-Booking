const BaseRepository = require('./BaseRepository');
const { Review, User } = require('../models');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByMovie(movie_id, options = {}) {
    return await this.findAll({
      where: { movie_id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'profile_image'] }
      ],
      ...options
    });
  }

  async findUserMovieReview(user_id, movie_id, options = {}) {
    return await this.findOne({
      where: { user_id, movie_id },
      ...options
    });
  }
}

module.exports = new ReviewRepository();
