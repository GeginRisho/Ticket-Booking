const express = require('express');
const OrganizerController = require('../controllers/OrganizerController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All organizer routes are protected and restricted to Organizers or Admins
router.use(protect);
router.use(restrictTo('Event Organizer', 'Admin', 'Super Admin'));

router.get('/analytics', OrganizerController.getAnalytics);
router.get('/bookings', OrganizerController.getBookings);
router.post('/bookings/:id/check-in', OrganizerController.checkInBooking);
router.post('/bookings/:id/cancel', OrganizerController.cancelBooking);

module.exports = router;
