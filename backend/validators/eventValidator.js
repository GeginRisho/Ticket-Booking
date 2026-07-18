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

const createCategoryValidator = [
  body('category_name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name must not exceed 100 characters'),
  validateResult
];

const createEventValidator = [
  body('category_id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('category_id must be a valid UUID v4'),

  body('city_id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('city_id must be a valid UUID v4'),

  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required')
    .isLength({ max: 255 }).withMessage('Event title must not exceed 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('venue')
    .trim()
    .notEmpty().withMessage('Venue is required')
    .isLength({ max: 255 }).withMessage('Venue description must not exceed 255 characters'),

  body('banner')
    .optional()
    .trim()
    .isURL().withMessage('Banner must be a valid URL'),

  body('start_date')
    .isISO8601().withMessage('Start date must be a valid ISO8601 date string'),

  body('end_date')
    .isISO8601().withMessage('End date must be a valid ISO8601 date string')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.start_date)) {
        throw new Error('End date must be on or after start date');
      }
      return true;
    }),

  body('tickets')
    .optional()
    .isArray().withMessage('Tickets must be an array of ticket structures'),

  body('tickets.*.ticket_type')
    .trim()
    .notEmpty().withMessage('Ticket type is required'),

  body('tickets.*.price')
    .isFloat({ min: 0 }).withMessage('Ticket price must be a non-negative number'),

  body('tickets.*.available_quantity')
    .isInt({ min: 0 }).withMessage('Available quantity must be a non-negative integer'),

  validateResult
];

const updateEventValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid event ID format'),

  body('category_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('category_id must be a valid UUID v4'),

  body('city_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('city_id must be a valid UUID v4'),

  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Event title cannot be empty')
    .isLength({ max: 255 }).withMessage('Event title must not exceed 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('venue')
    .optional()
    .trim()
    .notEmpty().withMessage('Venue cannot be empty'),

  body('banner')
    .optional()
    .trim()
    .isURL().withMessage('Banner must be a valid URL'),

  body('start_date')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO8601 date string'),

  body('end_date')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO8601 date string')
    .custom((value, { req }) => {
      const startDate = req.body.start_date || req.params.start_date; 
      if (startDate && new Date(value) < new Date(startDate)) {
        throw new Error('End date must be on or after start date');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['active', 'cancelled', 'completed']).withMessage('Status must be active, cancelled, or completed'),

  body('tickets')
    .optional()
    .isArray().withMessage('Tickets must be an array of ticket structures'),

  body('tickets.*.ticket_type')
    .trim()
    .notEmpty().withMessage('Ticket type is required'),

  body('tickets.*.price')
    .isFloat({ min: 0 }).withMessage('Ticket price must be a non-negative number'),

  body('tickets.*.available_quantity')
    .isInt({ min: 0 }).withMessage('Available quantity must be a non-negative integer'),

  validateResult
];

const getEventsQueryValidator = [
  query('city_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('city_id must be a valid UUID'),
  query('category_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('category_id must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['active', 'cancelled', 'completed']).withMessage('status must be active, cancelled, or completed'),
  validateResult
];

module.exports = {
  createCategoryValidator,
  createEventValidator,
  updateEventValidator,
  getEventsQueryValidator
};
