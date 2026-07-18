const express = require('express');
const TheatreController = require('../controllers/TheatreController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');
const {
  createTheatreValidator,
  updateTheatreValidator,
  approveRejectTheatreValidator,
  getTheatresQueryValidator
} = require('../validators/theatreValidator');

const router = express.Router();

const validateId = [
  param('id').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid theatre ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

// Public routes
router.get('/', getTheatresQueryValidator, TheatreController.getTheatres);
router.get('/:id', validateId, TheatreController.getTheatre);

// Protected routes (Admin and Theatre Owner)
router.use(protect);

router.post('/', restrictTo('Admin', 'Theatre Owner'), createTheatreValidator, TheatreController.createTheatre);
router.put('/:id', restrictTo('Admin', 'Theatre Owner'), updateTheatreValidator, TheatreController.updateTheatre);
router.delete('/:id', restrictTo('Admin', 'Theatre Owner'), validateId, TheatreController.deleteTheatre);

// Admin-only routes
router.patch('/:id/status', restrictTo('Admin'), approveRejectTheatreValidator, TheatreController.approveRejectTheatre);

module.exports = router;
