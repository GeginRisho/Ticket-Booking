const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(err => `${err.path}: ${err.msg}`).join('. ');
    return next(new AppError(errorMsgs, 400));
  }
  next();
};

const createShowValidator = [
  body('movie_id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('movie_id must be a valid UUID v4'),

  body('screen_id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('screen_id must be a valid UUID v4'),

  body('show_date')
    .isISO8601().withMessage('Show date must be in YYYY-MM-DD format'),

  body('start_time')
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .withMessage('Start time must be a valid time in HH:MM or HH:MM:SS format'),

  body('end_time')
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .withMessage('End time must be a valid time in HH:MM or HH:MM:SS format'),

  body('language')
    .trim()
    .notEmpty().withMessage('Language is required'),

  body('format')
    .trim()
    .notEmpty().withMessage('Format is required'),

  validateResult
];

const updateShowValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid show ID format'),

  body('movie_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('movie_id must be a valid UUID v4'),

  body('screen_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('screen_id must be a valid UUID v4'),

  body('show_date')
    .optional()
    .isISO8601().withMessage('Show date must be in YYYY-MM-DD format'),

  body('start_time')
    .optional()
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .withMessage('Start time must be a valid time in HH:MM or HH:MM:SS format'),

  body('end_time')
    .optional()
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .withMessage('End time must be a valid time in HH:MM or HH:MM:SS format'),

  body('language')
    .optional()
    .trim()
    .notEmpty().withMessage('Language cannot be empty'),

  body('format')
    .optional()
    .trim()
    .notEmpty().withMessage('Format cannot be empty'),

  body('status')
    .optional()
    .isIn(['active', 'cancelled', 'sold_out']).withMessage('Status must be active, cancelled, or sold_out'),

  validateResult
];

const getShowsQueryValidator = [
  query('movie_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('movie_id must be a valid UUID'),
  query('screen_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('screen_id must be a valid UUID'),
  query('city_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('city_id must be a valid UUID'),
  query('date')
    .optional()
    .isISO8601().withMessage('date must be in YYYY-MM-DD format'),
  validateResult
];

module.exports = {
  createShowValidator,
  updateShowValidator,
  getShowsQueryValidator
};
