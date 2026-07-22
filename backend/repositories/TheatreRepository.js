const BaseRepository = require('./BaseRepository');
const { Theatre } = require('../models');

class TheatreRepository extends BaseRepository {
  constructor() {
    super(Theatre);
  }

  async findFiltered({ city_id, status, owner_id, state, city }, options = {}) {
    const where = {};
    if (city_id) where.city_id = city_id;
    if (status) where.status = status;
    if (owner_id) where.owner_id = owner_id;

    const cityWhere = {};
    if (state) cityWhere.state = { [Op.iLike]: state };
    if (city) cityWhere.city_name = { [Op.iLike]: city };

    return await this.findAll({
      where,
      include: [{
        association: 'city',
        where: Object.keys(cityWhere).length > 0 ? cityWhere : undefined,
        required: Object.keys(cityWhere).length > 0
      }],
      ...options
    });
  }
}

module.exports = new TheatreRepository();
