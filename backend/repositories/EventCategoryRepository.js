const BaseRepository = require('./BaseRepository');
const { EventCategory } = require('../models');

class EventCategoryRepository extends BaseRepository {
  constructor() {
    super(EventCategory);
  }
}

module.exports = new EventCategoryRepository();
