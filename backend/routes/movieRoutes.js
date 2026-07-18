const express = require('express');
const MovieController = require('../controllers/MovieController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');
const {
  createMovieValidator,
  updateMovieValidator,
  addCastValidator,
  getMoviesQueryValidator
} = require('../validators/movieValidator');

const router = express.Router();

const validateId = [
  param('id').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid movie ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

const validateCastIds = [
  param('id').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid movie ID format'),
  param('castId').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid cast ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array().map(e => e.msg).join('. '), 400));
    }
    next();
  }
];

// Public routes
router.get('/', getMoviesQueryValidator, MovieController.getMovies);
router.get('/:id', validateId, MovieController.getMovie);

// Admin-only protected routes
router.use(protect);
router.use(restrictTo('Admin'));

router.post('/', createMovieValidator, MovieController.createMovie);
router.put('/:id', updateMovieValidator, MovieController.updateMovie);
router.delete('/:id', validateId, MovieController.deleteMovie);

router.post('/:id/cast', addCastValidator, MovieController.addCast);
router.delete('/:id/cast/:castId', validateCastIds, MovieController.removeCast);

module.exports = router;
