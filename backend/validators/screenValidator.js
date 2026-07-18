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

const createScreenValidator = [
  param('theatreId')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('theatreId must be a valid UUID v4'),

  body('screen_name')
    .trim()
    .notEmpty().withMessage('Screen name is required')
    .isLength({ max: 100 }).withMessage('Screen name must not exceed 100 characters'),

  body('rows')
    .isInt({ min: 1, max: 26 }).withMessage('Rows must be an integer between 1 and 26'),

  body('columns')
    .isInt({ min: 1, max: 30 }).withMessage('Columns must be an integer between 1 and 30'),

  body('seats_layout')
    .optional()
    .isObject().withMessage('seats_layout must be an object containing custom seat attributes'),

  validateResult
];

const updateScreenValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid screen ID format'),

  body('screen_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Screen name cannot be empty')
    .isLength({ max: 100 }).withMessage('Screen name must not exceed 100 characters'),

  body('rows')
    .optional()
    .isInt({ min: 1, max: 26 }).withMessage('Rows must be an integer between 1 and 26'),

  body('columns')
    .optional()
    .isInt({ min: 1, max: 30 }).withMessage('Columns must be an integer between 1 and 30'),

  validateResult
];

module.exports = {
  createScreenValidator,
  updateScreenValidator
};
