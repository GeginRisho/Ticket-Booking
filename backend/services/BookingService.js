const { sequelize, Show, Seat, EventTicket, Booking, BookingSeat } = require('../models');
const BookingRepository = require('../repositories/BookingRepository');
const BookingSeatRepository = require('../repositories/BookingSeatRepository');
const CouponService = require('./CouponService');
const NotificationService = require('./NotificationService');
const AppError = require('../utils/appError');

class BookingService {
  async getUserBookings(userId) {
    return await BookingRepository.findUserBookings(userId);
  }

  async getBookingDetails(userId, id, userRole) {
    const booking = await BookingRepository.findBookingDetails(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Access control: only owner or Admin can view details
    if (userRole !== 'Admin' && booking.user_id !== userId) {
      throw new AppError('You do not have permission to view this booking', 403);
    }

    return booking;
  }

  async createMovieBooking(userId, { show_id, seat_ids, coupon_code }) {
    if (!seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      throw new AppError('At least one seat must be selected', 400);
    }

    // Run within a transaction to guarantee seat locking consistency
    return await sequelize.transaction(async (t) => {
      const show = await Show.findByPk(show_id, { transaction: t });
      if (!show) {
        throw new AppError('Show not found', 404);
      }

      if (show.status !== 'active') {
        throw new AppError('This show is no longer active or is cancelled', 400);
      }

      // Fetch seat details to get prices and ensure they belong to the screen
      const seats = await Seat.findAll({
        where: {
          id: seat_ids,
          screen_id: show.screen_id
        },
        transaction: t
      });

      if (seats.length !== seat_ids.length) {
        throw new AppError('One or more selected seats do not exist or belong to a different screen', 400);
      }

      // Check if any of these seats are already booked for this show
      const existingBookings = await BookingSeat.findAll({
        include: [
          {
            association: 'booking',
            where: {
              show_id,
              booking_status: ['pending', 'confirmed']
            },
            required: true
          }
        ],
        where: {
          seat_id: seat_ids
        },
        transaction: t
      });

      if (existingBookings.length > 0) {
        throw new AppError('One or more of the selected seats are already booked', 400);
      }

      // Calculate total amount
      let subTotal = seats.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
      let discount = 0;
      let couponResult = null;

      if (coupon_code) {
        couponResult = await CouponService.validateCoupon(coupon_code, subTotal);
        discount = couponResult.discount_amount;
      }

      const totalAmount = subTotal - discount;

      // Generate unique booking number
      const bookingNumber = 'BK-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 6).toUpperCase();

      // Create Booking record
      const booking = await Booking.create({
        booking_number: bookingNumber,
        user_id: userId,
        show_id,
        event_ticket_id: null,
        booking_date: new Date(),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        booking_status: 'pending',
        payment_status: 'pending'
      }, { transaction: t });

      // Create BookingSeat records
      const bookingSeatsData = seats.map(seat => ({
        booking_id: booking.id,
        seat_id: seat.id,
        price: parseFloat(seat.price)
      }));

      await BookingSeat.bulkCreate(bookingSeatsData, { transaction: t });

      // Create notification
      await NotificationService.createNotification(userId, {
        title: 'Booking Initiated',
        message: `Your booking ${bookingNumber} is pending payment. Please complete your transaction to confirm.`,
        type: 'booking'
      });

      return booking;
    });
  }

  async createEventBooking(userId, { event_ticket_id, quantity, coupon_code, seat_ids }) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new AppError('Quantity must be a positive integer', 400);
    }

    const { Event } = require('../models');

    return await sequelize.transaction(async (t) => {
      // Fetch EventTicket with write lock to prevent race conditions on ticket counts
      const eventTicket = await EventTicket.findByPk(event_ticket_id, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!eventTicket) {
        throw new AppError('Event ticket type not found', 404);
      }

      if (eventTicket.available_quantity < qty) {
        throw new AppError(`Not enough tickets available. Only ${eventTicket.available_quantity} remaining.`, 400);
      }

      const event = await Event.findByPk(eventTicket.event_id, { transaction: t });
      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Check Seating reservation constraints if applicable
      if (event.has_reserved_seating) {
        if (!seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
          throw new AppError('Seats selection is required for this event', 400);
        }
        if (seat_ids.length !== qty) {
          throw new AppError('Number of selected seats must match the ticket quantity', 400);
        }

        // Aggregate booked/locked seats
        const siblingTickets = await EventTicket.findAll({ where: { event_id: event.id }, transaction: t });
        const ticketIds = siblingTickets.map(st => st.id);

        const existingBookings = await Booking.findAll({
          where: {
            event_ticket_id: ticketIds,
            booking_status: ['pending', 'confirmed', 'completed']
          },
          transaction: t
        });

        const bookedSeats = [];
        existingBookings.forEach(eb => {
          if (eb.booked_seats) {
            const seatsArr = typeof eb.booked_seats === 'string' ? JSON.parse(eb.booked_seats) : eb.booked_seats;
            if (Array.isArray(seatsArr)) {
              bookedSeats.push(...seatsArr);
            }
          }
        });

        const doubleBooked = seat_ids.filter(s => bookedSeats.includes(s));
        if (doubleBooked.length > 0) {
          throw new AppError(`The following seats are already reserved or locked: ${doubleBooked.join(', ')}`, 400);
        }
      }

      // Calculate totals
      let subTotal = parseFloat(eventTicket.price) * qty;
      let discount = 0;
      let couponResult = null;

      if (coupon_code) {
        couponResult = await CouponService.validateCoupon(coupon_code, subTotal, event.id, eventTicket.ticket_type, qty);
        discount = couponResult.discount_amount;
      }

      const totalAmount = subTotal - discount;

      // Decrement ticket quantity
      eventTicket.available_quantity -= qty;
      await eventTicket.save({ transaction: t });

      // Generate booking number
      const bookingNumber = 'EV-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 6).toUpperCase();

      // Create Booking
      const booking = await Booking.create({
        booking_number: bookingNumber,
        user_id: userId,
        show_id: null,
        event_ticket_id,
        booking_date: new Date(),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        booking_status: 'pending',
        payment_status: 'pending',
        booked_seats: seat_ids || null
      }, { transaction: t });

      // Create customer notification
      await NotificationService.createNotification(userId, {
        title: 'Event Booking Initiated',
        message: `Your booking ${bookingNumber} for ${qty} ticket(s) is pending payment.`,
        type: 'booking'
      });

      // Notify Event Organizer
      if (event.organizer_id) {
        await NotificationService.createNotification(event.organizer_id, {
          title: 'New Event Booking',
          message: `A new booking ${bookingNumber} has been initiated for "${event.title}". Quantity: ${qty} x ${eventTicket.ticket_type}.`,
          type: 'new_booking'
        }).catch(console.error);

        if (eventTicket.available_quantity === 0) {
          await NotificationService.createNotification(event.organizer_id, {
            title: 'Category Sold Out',
            message: `Ticket category "${eventTicket.ticket_type}" for "${event.title}" is now sold out!`,
            type: 'sold_out'
          }).catch(console.error);
        } else if (eventTicket.available_quantity < 10) {
          await NotificationService.createNotification(event.organizer_id, {
            title: 'Low Ticket Availability',
            message: `Only ${eventTicket.available_quantity} ticket(s) remaining for "${eventTicket.ticket_type}" in event "${event.title}".`,
            type: 'low_availability'
          }).catch(console.error);
        }
      }

      return booking;
    });
  }

  async cancelBooking(userId, id, userRole) {
    return await sequelize.transaction(async (t) => {
      const booking = await Booking.findByPk(id, { transaction: t });
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (userRole !== 'Admin' && booking.user_id !== userId) {
        throw new AppError('You do not have permission to cancel this booking', 403);
      }

      if (booking.booking_status === 'cancelled') {
        throw new AppError('This booking is already cancelled', 400);
      }

      if (booking.booking_status === 'failed') {
        throw new AppError('Cannot cancel a failed booking', 400);
      }

      // If it is an event ticket booking, restore ticket quantities
      if (booking.event_ticket_id) {
        const eventTicket = await EventTicket.findByPk(booking.event_ticket_id, {
          lock: t.LOCK.UPDATE,
          transaction: t
        });

        if (eventTicket) {
          // Calculate the original quantity purchased
          const quantity = Math.round((parseFloat(booking.total_amount) + parseFloat(booking.discount)) / parseFloat(eventTicket.price));
          eventTicket.available_quantity += quantity;
          await eventTicket.save({ transaction: t });
        }
      }

      // Update booking status to cancelled
      booking.booking_status = 'cancelled';
      if (booking.payment_status === 'paid') {
        booking.payment_status = 'refunded';
      }
      await booking.save({ transaction: t });

      // Notify user
      await NotificationService.createNotification(booking.user_id, {
        title: 'Booking Cancelled',
        message: `Your booking ${booking.booking_number} has been cancelled successfully.`,
        type: 'booking'
      });

      return booking;
    });
  }
}

module.exports = new BookingService();
