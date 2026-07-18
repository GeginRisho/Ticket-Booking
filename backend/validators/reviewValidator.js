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

const createReviewValidator = [
  param('movieId')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid movie ID format'),

  body('rating')
    .isInt({ min: 1, max: 10 }).withMessage('Rating must be an integer between 1 and 10'),

  body('review')
    .optional({ nullable: true })
    .trim(),

  validateResult
];

const updateReviewValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid review ID format'),

  body('rating')
    .isInt({ min: 1, max: 10 }).withMessage('Rating must be an integer between 1 and 10'),

  body('review')
    .optional({ nullable: true })
    .trim(),

  validateResult
];

module.exports = {
  createReviewValidator,
  updateReviewValidator
};
