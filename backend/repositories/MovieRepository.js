const BaseRepository = require('./BaseRepository');
const { Movie, Show, Screen, Theatre } = require('../models');
const { Op } = require('sequelize');

class MovieRepository extends BaseRepository {
  constructor() {
    super(Movie);
  }

  async findFiltered({ genre, language, status, city_id, search }, options = {}) {
    const where = {};
    
    if (genre) {
      where.genre = { [Op.iLike]: `%${genre}%` };
    }
    
    if (language) {
      where.language = { [Op.iLike]: `%${language}%` };
    }
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const include = [];

    if (city_id) {
      include.push({
        model: Show,
        as: 'shows',
        required: true,
        include: [{
          model: Screen,
          as: 'screen',
          required: true,
          include: [{
            model: Theatre,
            as: 'theatre',
            required: true,
            where: { city_id }
          }]
        }]
      });
    }

    return await this.findAll({
      where,
      include,
      distinct: true,
      ...options
    });
  }

  async findDetailWithCastAndReviews(id, options = {}) {
    return await this.findById(id, {
      include: [
        { model: require('../models').MovieCast, as: 'cast' },
        { 
          model: require('../models').Review, 
          as: 'reviews', 
          include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'full_name', 'profile_image'] }] 
        }
      ],
      ...options
    });
  }
}

module.exports = new MovieRepository();
