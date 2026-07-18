const BaseRepository = require('./BaseRepository');
const { Booking, BookingSeat, Seat, Show, Movie, Screen, Theatre, EventTicket, Event, City } = require('../models');

class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  async findUserBookings(user_id, options = {}) {
    return await this.findAll({
      where: { user_id },
      include: [
        {
          model: Show,
          as: 'show',
          include: [
            { model: Movie, as: 'movie', attributes: ['id', 'title', 'poster', 'language', 'duration'] },
            { 
              model: Screen, 
              as: 'screen', 
              attributes: ['id', 'screen_name'],
              include: [{ model: Theatre, as: 'theatre', attributes: ['id', 'theatre_name', 'address'] }]
            }
          ]
        },
        {
          model: BookingSeat,
          as: 'bookingSeats',
          include: [{ model: Seat, as: 'seat', attributes: ['id', 'seat_number', 'seat_type'] }]
        },
        {
          model: EventTicket,
          as: 'eventTicket',
          include: [
            { 
              model: Event, 
              as: 'event',
              include: [{ model: City, as: 'city', attributes: ['id', 'city_name'] }]
            }
          ]
        }
      ],
      order: [['booking_date', 'DESC']],
      ...options
    });
  }

  async findBookingDetails(id, options = {}) {
    return await this.findOne({
      where: { id },
      include: [
        {
          model: Show,
          as: 'show',
          include: [
            { model: Movie, as: 'movie' },
            { 
              model: Screen, 
              as: 'screen',
              include: [{ model: Theatre, as: 'theatre' }]
            }
          ]
        },
        {
          model: BookingSeat,
          as: 'bookingSeats',
          include: [{ model: Seat, as: 'seat' }]
        },
        {
          model: EventTicket,
          as: 'eventTicket',
          include: [{ model: Event, as: 'event' }]
        }
      ],
      ...options
    });
  }
}

module.exports = new BookingRepository();
