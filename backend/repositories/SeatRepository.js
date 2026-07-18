const BaseRepository = require('./BaseRepository');
const { Seat } = require('../models');

class SeatRepository extends BaseRepository {
  constructor() {
    super(Seat);
  }

  async findByScreen(screen_id, options = {}) {
    return await this.findAll({ where: { screen_id }, ...options });
  }

  async bulkCreateSeats(seatsData, options = {}) {
    return await Seat.bulkCreate(seatsData, options);
  }
}

module.exports = new SeatRepository();
