const BookingService = require('../services/BookingService');

class BookingController {
  async getMyBookings(req, res, next) {
    try {
      const bookings = await BookingService.getUserBookings(req.user.id);
      res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: { bookings }
      });
    } catch (err) {
      next(err);
    }
  }

  async getBooking(req, res, next) {
    try {
      const booking = await BookingService.getBookingDetails(req.user.id, req.params.id, req.user.role.role_name);
      res.status(200).json({
        status: 'success',
        data: { booking }
      });
    } catch (err) {
      next(err);
    }
  }

  async bookMovie(req, res, next) {
    try {
      const booking = await BookingService.createMovieBooking(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Movie seats booked successfully. Complete payment to confirm.',
        data: { booking }
      });
    } catch (err) {
      next(err);
    }
  }

  async bookEvent(req, res, next) {
    try {
      const booking = await BookingService.createEventBooking(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Event tickets booked successfully. Complete payment to confirm.',
        data: { booking }
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const booking = await BookingService.cancelBooking(req.user.id, req.params.id, req.user.role.role_name);
      res.status(200).json({
        status: 'success',
        message: 'Booking cancelled successfully',
        data: { booking }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookingController();
