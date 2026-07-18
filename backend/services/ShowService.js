const ShowRepository = require('../repositories/ShowRepository');
const ScreenRepository = require('../repositories/ScreenRepository');
const Movie = require('../models').Movie;
const Seat = require('../models').Seat;
const Booking = require('../models').Booking;
const BookingSeat = require('../models').BookingSeat;
const { Op } = require('sequelize');
const AppError = require('../utils/appError');

class ShowService {
  async getShows(filters) {
    return await ShowRepository.findFiltered(filters);
  }

  async getShowById(id) {
    const show = await ShowRepository.findWithDetails(id);
    if (!show) {
      throw new AppError('Show not found', 404);
    }
    return show;
  }

  async getShowSeats(showId) {
    const show = await ShowRepository.findWithDetails(showId);
    if (!show) {
      throw new AppError('Show not found', 404);
    }

    // Get all seats for the screen
    const seats = await Seat.findAll({
      where: { screen_id: show.screen_id },
      order: [['seat_number', 'ASC']]
    });

    // Get all confirmed or pending bookings for this show
    const bookings = await Booking.findAll({
      where: {
        show_id: showId,
        booking_status: { [Op.in]: ['pending', 'confirmed'] }
      },
      include: [{ model: BookingSeat, as: 'bookingSeats' }]
    });

    // Collect all booked seat IDs
    const bookedSeatIds = new Set();
    bookings.forEach(booking => {
      if (booking.bookingSeats) {
        booking.bookingSeats.forEach(bs => {
          bookedSeatIds.add(bs.seat_id);
        });
      }
    });

    // Map seats with availability
    return seats.map(seat => ({
      id: seat.id,
      seat_number: seat.seat_number,
      seat_type: seat.seat_type,
      price: seat.price,
      is_available: !bookedSeatIds.has(seat.id)
    }));
  }

  async createShow(data, user) {
    const { movie_id, screen_id, show_date, start_time, end_time, language, format } = data;

    // Check movie
    const movie = await Movie.findByPk(movie_id);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    // Check screen and theatre
    const screen = await ScreenRepository.findById(screen_id, { include: ['theatre'] });
    if (!screen) {
      throw new AppError('Screen not found', 404);
    }

    // Authorization
    if (user.role.role_name === 'Theatre Owner' && screen.theatre.owner_id !== user.id) {
      throw new AppError('You do not own the theatre containing this screen', 403);
    }

    // Time validation (start_time < end_time)
    if (start_time >= end_time) {
      throw new AppError('Start time must be before end time', 400);
    }

    // Overlap validation
    const overlap = await ShowRepository.findOne({
      where: {
        screen_id,
        show_date,
        status: { [Op.ne]: 'cancelled' },
        start_time: { [Op.lt]: end_time },
        end_time: { [Op.gt]: start_time }
      }
    });

    if (overlap) {
      throw new AppError('This show schedule overlaps with an existing active show on the same screen', 400);
    }

    return await ShowRepository.create({
      movie_id,
      screen_id,
      show_date,
      start_time,
      end_time,
      language,
      format,
      status: 'active'
    });
  }

  async updateShow(id, data, user) {
    const show = await ShowRepository.findWithDetails(id);
    if (!show) {
      throw new AppError('Show not found', 404);
    }

    // Authorization
    if (user.role.role_name === 'Theatre Owner' && show.screen.theatre.owner_id !== user.id) {
      throw new AppError('Access denied', 403);
    }

    const screen_id = data.screen_id || show.screen_id;
    const show_date = data.show_date || show.show_date;
    const start_time = data.start_time || show.start_time;
    const end_time = data.end_time || show.end_time;

    if (start_time >= end_time) {
      throw new AppError('Start time must be before end time', 400);
    }

    // Check overlap if date/time/screen changed
    if (
      screen_id !== show.screen_id ||
      show_date !== show.show_date ||
      start_time !== show.start_time ||
      end_time !== show.end_time
    ) {
      const overlap = await ShowRepository.findOne({
        where: {
          id: { [Op.ne]: id },
          screen_id,
          show_date,
          status: { [Op.ne]: 'cancelled' },
          start_time: { [Op.lt]: end_time },
          end_time: { [Op.gt]: start_time }
        }
      });

      if (overlap) {
        throw new AppError('This show schedule overlaps with another scheduled show', 400);
      }
    }

    return await ShowRepository.update(id, data);
  }

  async deleteShow(id, user) {
    const show = await ShowRepository.findWithDetails(id);
    if (!show) {
      throw new AppError('Show not found', 404);
    }

    if (user.role.role_name === 'Theatre Owner' && show.screen.theatre.owner_id !== user.id) {
      throw new AppError('Access denied', 403);
    }

    return await ShowRepository.delete(id);
  }
}

module.exports = new ShowService();
