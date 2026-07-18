const BaseRepository = require('./BaseRepository');
const { City } = require('../models');

class CityRepository extends BaseRepository {
  constructor() {
    super(City);
  }

  async findByName(city_name, options = {}) {
    return await this.findOne({ where: { city_name }, ...options });
  }
}

module.exports = new CityRepository();
