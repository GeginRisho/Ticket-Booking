const EventRepository = require('../repositories/EventRepository');
const EventCategoryRepository = require('../repositories/EventCategoryRepository');
const EventTicketRepository = require('../repositories/EventTicketRepository');
const City = require('../models').City;
const { sequelize } = require('../models');
const AppError = require('../utils/appError');

class EventService {
  // Categories
  async getCategories() {
    return await EventCategoryRepository.findAll();
  }

  async createCategory(data) {
    const existing = await EventCategoryRepository.findOne({ where: { category_name: data.category_name } });
    if (existing) {
      throw new AppError('Category already exists', 400);
    }
    return await EventCategoryRepository.create(data);
  }

  // Events
  async getEvents(filters) {
    return await EventRepository.findFiltered(filters);
  }

  async getEventById(id) {
    const event = await EventRepository.findDetailWithTickets(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }
    return event;
  }

  async createEvent(data, user) {
    // Check city
    const city = await City.findByPk(data.city_id);
    if (!city) {
      throw new AppError('City not found', 404);
    }

    // Check category
    const category = await EventCategoryRepository.findById(data.category_id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const payload = { ...data };
    if (user.role.role_name === 'Event Organizer') {
      payload.organizer_id = user.id;
    } else if (user.role.role_name === 'Admin') {
      // Admin can assign organizer or leave null
      payload.organizer_id = payload.organizer_id || null;
    } else {
      throw new AppError('Access denied', 403);
    }

    const transaction = await sequelize.transaction();

    try {
      const event = await EventRepository.create(payload, { transaction });

      if (data.tickets && Array.isArray(data.tickets) && data.tickets.length > 0) {
        const ticketPayloads = data.tickets.map(ticket => ({
          event_id: event.id,
          ticket_type: ticket.ticket_type,
          price: ticket.price,
          available_quantity: ticket.available_quantity
        }));
        await EventTicketRepository.bulkCreateTickets(ticketPayloads, { transaction });
      }

      await transaction.commit();
      return await EventRepository.findDetailWithTickets(event.id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async updateEvent(id, data, user) {
    const event = await EventRepository.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Authorization check
    if (user.role.role_name === 'Event Organizer' && event.organizer_id !== user.id) {
      throw new AppError('You do not organize this event', 403);
    }

    // If city or category are modified, check existence
    if (data.city_id) {
      const city = await City.findByPk(data.city_id);
      if (!city) {
        throw new AppError('City not found', 404);
      }
    }
    if (data.category_id) {
      const category = await EventCategoryRepository.findById(data.category_id);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    // If tickets are modified, update/create/delete tickets.
    // To keep it simple, if a tickets array is passed, we delete existing tickets and recreate them,
    // but only if there are no bookings yet for those tickets.
    // Alternatively, we can let user update the event properties and handle tickets via individual APIs,
    // or replace tickets if no bookings exist. Let's write the tickets replacement code safely.
    if (data.tickets && Array.isArray(data.tickets)) {
      const BookingModel = require('../models').Booking;
      const bookedCount = await BookingModel.count({
        include: [{
          model: require('../models').EventTicket,
          as: 'eventTicket',
          where: { event_id: id }
        }]
      });

      if (bookedCount > 0) {
        throw new AppError('Cannot modify ticket structure because tickets have already been booked', 400);
      }

      const transaction = await sequelize.transaction();
      try {
        await EventRepository.update(id, data, { transaction });

        // Delete old tickets
        const EventTicketModel = require('../models').EventTicket;
        await EventTicketModel.destroy({ where: { event_id: id }, force: true, transaction });

        // Create new tickets
        const ticketPayloads = data.tickets.map(ticket => ({
          event_id: id,
          ticket_type: ticket.ticket_type,
          price: ticket.price,
          available_quantity: ticket.available_quantity
        }));
        await EventTicketRepository.bulkCreateTickets(ticketPayloads, { transaction });

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } else {
      await EventRepository.update(id, data);
    }

    return await EventRepository.findDetailWithTickets(id);
  }

  async deleteEvent(id, user) {
    const event = await EventRepository.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (user.role.role_name === 'Event Organizer' && event.organizer_id !== user.id) {
      throw new AppError('You do not organize this event', 403);
    }

    return await EventRepository.delete(id);
  }
}

module.exports = new EventService();
