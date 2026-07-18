const BaseRepository = require('./BaseRepository');
const { Theatre } = require('../models');

class TheatreRepository extends BaseRepository {
  constructor() {
    super(Theatre);
  }

  async findFiltered({ city_id, status, owner_id }, options = {}) {
    const where = {};
    if (city_id) where.city_id = city_id;
    if (status) where.status = status;
    if (owner_id) where.owner_id = owner_id;

    return await this.findAll({
      where,
      include: ['city'],
      ...options
    });
  }
}

module.exports = new TheatreRepository();
