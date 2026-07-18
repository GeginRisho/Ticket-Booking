const BaseRepository = require('./BaseRepository');
const { Show, Screen, Theatre, Movie } = require('../models');

class ShowRepository extends BaseRepository {
  constructor() {
    super(Show);
  }

  async findFiltered({ movie_id, screen_id, date, city_id }, options = {}) {
    const where = {};
    if (movie_id) where.movie_id = movie_id;
    if (screen_id) where.screen_id = screen_id;
    if (date) where.show_date = date;

    const include = [
      { model: Movie, as: 'movie' },
      {
        model: Screen,
        as: 'screen',
        include: [{
          model: Theatre,
          as: 'theatre',
          where: city_id ? { city_id } : {}
        }]
      }
    ];

    return await this.findAll({
      where,
      include,
      ...options
    });
  }

  async findWithDetails(id, options = {}) {
    return await this.findById(id, {
      include: [
        { model: Movie, as: 'movie' },
        { model: Screen, as: 'screen', include: [{ model: Theatre, as: 'theatre' }] }
      ],
      ...options
    });
  }
}

module.exports = new ShowRepository();
