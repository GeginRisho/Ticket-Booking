const express = require('express');
const ScreenController = require('../controllers/ScreenController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');
const {
  createScreenValidator,
  updateScreenValidator
} = require('../validators/screenValidator');

const router = express.Router();

const validateTheatreId = [
  param('theatreId').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid theatre ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

const validateScreenId = [
  param('id').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid screen ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

// Screen routes with individual protection
router.get('/theatres/:theatreId/screens', protect, validateTheatreId, ScreenController.getScreens);
router.post('/theatres/:theatreId/screens', protect, restrictTo('Admin', 'Theatre Owner'), createScreenValidator, ScreenController.createScreen);

router.get('/screens/:id', protect, validateScreenId, ScreenController.getScreen);
router.put('/screens/:id', protect, restrictTo('Admin', 'Theatre Owner'), updateScreenValidator, ScreenController.updateScreen);
router.delete('/screens/:id', protect, restrictTo('Admin', 'Theatre Owner'), validateScreenId, ScreenController.deleteScreen);

module.exports = router;
