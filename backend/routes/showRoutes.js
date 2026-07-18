const express = require('express');
const ShowController = require('../controllers/ShowController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');
const {
  createShowValidator,
  updateShowValidator,
  getShowsQueryValidator
} = require('../validators/showValidator');

const router = express.Router();

const validateId = [
  param('id').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid show ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

// Public routes
router.get('/', getShowsQueryValidator, ShowController.getShows);
router.get('/:id', validateId, ShowController.getShow);
router.get('/:id/seats', validateId, ShowController.getShowSeats);

// Protected routes (Admin and Theatre Owner)
router.use(protect);

router.post('/', restrictTo('Admin', 'Theatre Owner'), createShowValidator, ShowController.createShow);
router.put('/:id', restrictTo('Admin', 'Theatre Owner'), updateShowValidator, ShowController.updateShow);
router.delete('/:id', restrictTo('Admin', 'Theatre Owner'), validateId, ShowController.deleteShow);

module.exports = router;
