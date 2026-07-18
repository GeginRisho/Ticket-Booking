const { body, param, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(err => `${err.path}: ${err.msg}`).join('. ');
    return next(new AppError(errorMsgs, 400));
  }
  next();
};

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const bookMovieValidator = [
  body('show_id')
    .matches(uuidRegex).withMessage('show_id must be a valid UUID'),

  body('seat_ids')
    .isArray({ min: 1 }).withMessage('seat_ids must be a non-empty array')
    .custom((seatIds) => {
      for (const id of seatIds) {
        if (!uuidRegex.test(id)) {
          throw new Error(`Invalid seat ID format: ${id}`);
        }
      }
      return true;
    }),

  body('coupon_code')
    .optional()
    .trim(),

  validateResult
];

const bookEventValidator = [
  body('event_ticket_id')
    .matches(uuidRegex).withMessage('event_ticket_id must be a valid UUID'),

  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be an integer of at least 1'),

  body('coupon_code')
    .optional()
    .trim(),

  validateResult
];

const cancelBookingValidator = [
  param('id')
    .matches(uuidRegex).withMessage('Invalid booking ID format'),
  validateResult
];

module.exports = {
  bookMovieValidator,
  bookEventValidator,
  cancelBookingValidator
};
