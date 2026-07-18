const BaseRepository = require('./BaseRepository');
const { BookingSeat } = require('../models');

class BookingSeatRepository extends BaseRepository {
  constructor() {
    super(BookingSeat);
  }

  async findBookedSeatsForShow(show_id, options = {}) {
    return await this.findAll({
      include: [
        {
          association: 'booking',
          where: {
            show_id,
            booking_status: ['pending', 'confirmed']
          },
          attributes: []
        }
      ],
      ...options
    });
  }
}

module.exports = new BookingSeatRepository();
