const express = require('express');
const BookingController = require('../controllers/BookingController');
const { protect } = require('../middlewares/authMiddleware');
const {
  bookMovieValidator,
  bookEventValidator,
  cancelBookingValidator
} = require('../validators/bookingValidator');

const router = express.Router();

// All booking routes are protected
router.use(protect);

router.get('/my-bookings', BookingController.getMyBookings);
router.get('/:id', cancelBookingValidator, BookingController.getBooking);
router.post('/movie', bookMovieValidator, BookingController.bookMovie);
router.post('/event', bookEventValidator, BookingController.bookEvent);
router.post('/:id/cancel', cancelBookingValidator, BookingController.cancelBooking);

module.exports = router;
