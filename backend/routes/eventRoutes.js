const express = require('express');
const EventController = require('../controllers/EventController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');
const {
  createCategoryValidator,
  createEventValidator,
  updateEventValidator,
  getEventsQueryValidator
} = require('../validators/eventValidator');

const router = express.Router();

const validateId = [
  param('id').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid event ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

// Event Categories routes
router.get('/categories', EventController.getCategories);
router.post('/categories', protect, restrictTo('Admin'), createCategoryValidator, EventController.createCategory);

// Events routes
router.get('/', getEventsQueryValidator, EventController.getEvents);
router.get('/:id', validateId, EventController.getEvent);

router.post('/', protect, restrictTo('Admin', 'Event Organizer'), createEventValidator, EventController.createEvent);
router.put('/:id', protect, restrictTo('Admin', 'Event Organizer'), updateEventValidator, EventController.updateEvent);
router.delete('/:id', protect, restrictTo('Admin', 'Event Organizer'), validateId, EventController.deleteEvent);

module.exports = router;
