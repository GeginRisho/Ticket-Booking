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

const createTheatreValidator = [
  body('city_id')
    .custom(val => {
      if (val === 'other') return true;
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)) return true;
      throw new Error('city_id must be a valid UUID v4 or "other"');
    }),

  body('theatre_name')
    .trim()
    .notEmpty().withMessage('Theatre name is required')
    .isLength({ max: 255 }).withMessage('Theatre name must not exceed 255 characters'),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),

  body('latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a float between -90 and 90'),

  body('longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a float between -180 and 180'),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please provide a valid phone number'),

  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Please provide a valid email address'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  validateResult
];

const updateTheatreValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid theatre ID format'),

  body('city_id')
    .optional()
    .custom(val => {
      if (val === 'other') return true;
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)) return true;
      throw new Error('city_id must be a valid UUID v4 or "other"');
    }),

  body('theatre_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Theatre name cannot be empty')
    .isLength({ max: 255 }).withMessage('Theatre name must not exceed 255 characters'),

  body('address')
    .optional()
    .trim()
    .notEmpty().withMessage('Address cannot be empty'),

  body('latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a float between -90 and 90'),

  body('longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a float between -180 and 180'),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please provide a valid phone number'),

  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Please provide a valid email address'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  validateResult
];

const approveRejectTheatreValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid theatre ID format'),

  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),

  validateResult
];

const getTheatresQueryValidator = [
  query('city_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('city_id must be a valid UUID v4'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'pending_approval']).withMessage('status must be active, inactive, or pending_approval'),
  validateResult
];

module.exports = {
  createTheatreValidator,
  updateTheatreValidator,
  approveRejectTheatreValidator,
  getTheatresQueryValidator
};
