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

const createMovieValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Movie title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('poster')
    .optional()
    .trim()
    .isURL().withMessage('Poster must be a valid URL'),
  
  body('banner')
    .optional()
    .trim()
    .isURL().withMessage('Banner must be a valid URL'),
  
  body('language')
    .trim()
    .notEmpty().withMessage('Language is required'),
  
  body('genre')
    .trim()
    .notEmpty().withMessage('Genre is required'),
  
  body('duration')
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer representing minutes'),
  
  body('age_rating')
    .trim()
    .notEmpty().withMessage('Age rating is required')
    .isIn(['U', 'UA', 'A', 'R', 'PG', 'PG-13']).withMessage('Age rating must be one of: U, UA, A, R, PG, PG-13'),
  
  body('release_date')
    .isISO8601().withMessage('Release date must be a valid date in YYYY-MM-DD format'),
  
  body('trailer_url')
    .optional()
    .trim()
    .isURL().withMessage('Trailer URL must be a valid URL'),
  
  body('status')
    .optional()
    .trim()
    .isIn(['coming_soon', 'now_showing', 'ended']).withMessage('Status must be coming_soon, now_showing, or ended'),

  validateResult
];

const updateMovieValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid movie ID format'),

  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Movie title cannot be empty')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('poster')
    .optional()
    .trim()
    .isURL().withMessage('Poster must be a valid URL'),
  
  body('banner')
    .optional()
    .trim()
    .isURL().withMessage('Banner must be a valid URL'),
  
  body('language')
    .optional()
    .trim()
    .notEmpty().withMessage('Language cannot be empty'),
  
  body('genre')
    .optional()
    .trim()
    .notEmpty().withMessage('Genre cannot be empty'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  
  body('age_rating')
    .optional()
    .trim()
    .isIn(['U', 'UA', 'A', 'R', 'PG', 'PG-13']).withMessage('Age rating must be one of: U, UA, A, R, PG, PG-13'),
  
  body('release_date')
    .optional()
    .isISO8601().withMessage('Release date must be a valid date format'),
  
  body('trailer_url')
    .optional()
    .trim()
    .isURL().withMessage('Trailer URL must be a valid URL'),
  
  body('status')
    .optional()
    .trim()
    .isIn(['coming_soon', 'now_showing', 'ended']).withMessage('Status must be coming_soon, now_showing, or ended'),

  validateResult
];

const addCastValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid movie ID format'),

  body('actor_name')
    .trim()
    .notEmpty().withMessage('Actor name is required'),

  body('character_name')
    .trim()
    .notEmpty().withMessage('Character name is required'),

  body('photo')
    .optional()
    .trim()
    .isURL().withMessage('Photo must be a valid URL'),

  validateResult
];

const getMoviesQueryValidator = [
  query('city_id')
    .optional()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('city_id must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['coming_soon', 'now_showing', 'ended']).withMessage('status must be coming_soon, now_showing, or ended'),
  validateResult
];

module.exports = {
  createMovieValidator,
  updateMovieValidator,
  addCastValidator,
  getMoviesQueryValidator
};
