const BaseRepository = require('./BaseRepository');
const { Event, EventCategory, EventTicket, City, User } = require('../models');
const { Op } = require('sequelize');

class EventRepository extends BaseRepository {
  constructor() {
    super(Event);
  }

  async findFiltered({ city_id, category_id, status, search }, options = {}) {
    const where = {};
    if (city_id) where.city_id = city_id;
    if (category_id) where.category_id = category_id;
    if (status) where.status = status;
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    return await this.findAll({
      where,
      include: [
        { model: EventCategory, as: 'category' },
        { model: City, as: 'city' }
      ],
      ...options
    });
  }

  async findDetailWithTickets(id, options = {}) {
    return await this.findById(id, {
      include: [
        { model: EventCategory, as: 'category' },
        { model: City, as: 'city' },
        { model: EventTicket, as: 'tickets' },
        { model: User, as: 'organizer', attributes: ['id', 'full_name', 'profile_image'] }
      ],
      ...options
    });
  }
}

module.exports = new EventRepository();
