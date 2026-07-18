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

const addToWishlistValidator = [
  body('movie_id')
    .optional({ nullable: true })
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('movie_id must be a valid UUID v4'),

  body('event_id')
    .optional({ nullable: true })
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('event_id must be a valid UUID v4'),

  body()
    .custom((body) => {
      if (!body.movie_id && !body.event_id) {
        throw new Error('You must provide either movie_id or event_id');
      }
      if (body.movie_id && body.event_id) {
        throw new Error('You cannot provide both movie_id and event_id in a single wishlist item');
      }
      return true;
    }),

  validateResult
];

const removeFromWishlistValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid wishlist item ID format'),
  validateResult
];

module.exports = {
  addToWishlistValidator,
  removeFromWishlistValidator
};
