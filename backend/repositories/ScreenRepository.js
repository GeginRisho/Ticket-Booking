const BaseRepository = require('./BaseRepository');
const { Screen } = require('../models');

class ScreenRepository extends BaseRepository {
  constructor() {
    super(Screen);
  }

  async findByTheatre(theatre_id, options = {}) {
    return await this.findAll({ where: { theatre_id }, ...options });
  }
}

module.exports = new ScreenRepository();
