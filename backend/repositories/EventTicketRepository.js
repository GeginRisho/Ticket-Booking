const BaseRepository = require('./BaseRepository');
const { EventTicket } = require('../models');

class EventTicketRepository extends BaseRepository {
  constructor() {
    super(EventTicket);
  }

  async bulkCreateTickets(tickets, options = {}) {
    return await EventTicket.bulkCreate(tickets, options);
  }
}

module.exports = new EventTicketRepository();
