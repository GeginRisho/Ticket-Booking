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

    // Retrieve all booked/locked seats for this event
    const { Booking } = require('../models');
    const ticketIds = event.tickets?.map(t => t.id) || [];
    const bookings = await Booking.findAll({
      where: {
        event_ticket_id: ticketIds,
        booking_status: ['pending', 'confirmed', 'completed']
      }
    });

    const bookedSeatsList = [];
    bookings.forEach(b => {
      if (b.booked_seats) {
        const seatsArr = typeof b.booked_seats === 'string' ? JSON.parse(b.booked_seats) : b.booked_seats;
        if (Array.isArray(seatsArr)) {
          bookedSeatsList.push(...seatsArr);
        }
      }
    });

    const eventJson = event.toJSON ? event.toJSON() : event;
    eventJson.booked_seats = bookedSeatsList;
    if (!eventJson.refund_policy_details) {
      eventJson.refund_policy_details = {
        cancellation_deadline: 24,
        refund_percentage: 100,
        non_refundable: false,
        automatic_refund: true
      };
    }
    return eventJson;
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
    if (!payload.refund_policy_details) {
      payload.refund_policy_details = {
        cancellation_deadline: 24,
        refund_percentage: 100,
        non_refundable: false,
        automatic_refund: true
      };
    } else {
      payload.refund_policy_details = {
        cancellation_deadline: payload.refund_policy_details.cancellation_deadline ?? 24,
        refund_percentage: payload.refund_policy_details.refund_percentage ?? 100,
        non_refundable: payload.refund_policy_details.non_refundable ?? false,
        automatic_refund: payload.refund_policy_details.automatic_refund ?? true
      };
    }

    const roleName = user.role?.role_name || user.role;
    if (roleName === 'Event Organizer') {
      payload.organizer_id = user.id;
      // Organizers can only submit events as 'draft' or 'pending_approval'
      if (payload.status !== 'pending_approval') {
        payload.status = 'draft';
      }
    } else if (roleName === 'Admin' || roleName === 'Super Admin') {
      payload.organizer_id = payload.organizer_id || null;
      payload.status = payload.status || 'approved';
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
          available_quantity: ticket.available_quantity,
          booking_limit: ticket.booking_limit || 10,
          refund_policy: ticket.refund_policy || 'Refundable up to 24h prior'
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

    if (data.refund_policy_details) {
      data.refund_policy_details = {
        cancellation_deadline: data.refund_policy_details.cancellation_deadline ?? 24,
        refund_percentage: data.refund_policy_details.refund_percentage ?? 100,
        non_refundable: data.refund_policy_details.non_refundable ?? false,
        automatic_refund: data.refund_policy_details.automatic_refund ?? true
      };
    }

    // Authorization check
    const roleName = user.role?.role_name || user.role;
    if (roleName === 'Event Organizer') {
      if (event.organizer_id !== user.id) {
        throw new AppError('You do not organize this event', 403);
      }
      
      // Control state transitions for organizers
      if (data.status) {
        const allowedTransitions = ['draft', 'pending_approval', 'archived'];
        if (event.status === 'approved' && data.status === 'published') {
          allowedTransitions.push('published');
        }
        if (!allowedTransitions.includes(data.status)) {
          // Disallow unauthorized state changes
          delete data.status;
        }
      }
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
          available_quantity: ticket.available_quantity,
          booking_limit: ticket.booking_limit || 10,
          refund_policy: ticket.refund_policy || 'Refundable up to 24h prior'
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

  async approveEvent(id) {
    const event = await EventRepository.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    await EventRepository.update(id, { status: 'approved' });

    // Send notification
    if (event.organizer_id) {
      const NotificationService = require('./NotificationService');
      await NotificationService.createNotification(event.organizer_id, {
        title: 'Event Approved',
        message: `Your event "${event.title}" has been approved! You can now publish it to make it live.`,
        type: 'event_approved'
      }).catch(console.error);
    }

    return await EventRepository.findDetailWithTickets(id);
  }

  async rejectEvent(id, reason) {
    const event = await EventRepository.findById(id);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    await EventRepository.update(id, { status: 'draft' });

    // Send notification
    if (event.organizer_id) {
      const NotificationService = require('./NotificationService');
      await NotificationService.createNotification(event.organizer_id, {
        title: 'Event Rejected',
        message: `Your event "${event.title}" was not approved. Reason: ${reason || 'Does not meet requirements'}`,
        type: 'event_rejected'
      }).catch(console.error);
    }

    return await EventRepository.findDetailWithTickets(id);
  }
}

module.exports = new EventService();
