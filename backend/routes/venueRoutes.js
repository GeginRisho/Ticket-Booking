const express = require('express');
const VenueController = require('../controllers/VenueController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All venue routes are protected and restricted to Organizers or Admins
router.use(protect);
router.use(restrictTo('Event Organizer', 'Admin', 'Super Admin'));

router.get('/', VenueController.getVenues);
router.get('/:id', VenueController.getVenue);
router.post('/', VenueController.createVenue);
router.put('/:id', VenueController.updateVenue);
router.delete('/:id', VenueController.deleteVenue);

module.exports = router;
