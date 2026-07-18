const express = require('express');
const ReviewController = require('../controllers/ReviewController');
const { protect } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');
const {
  createReviewValidator,
  updateReviewValidator
} = require('../validators/reviewValidator');

const router = express.Router();

const validateMovieId = [
  param('movieId').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid movie ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

const validateReviewId = [
  param('id').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid review ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

// Public movie-specific reviews
router.get('/movies/:movieId/reviews', validateMovieId, ReviewController.getMovieReviews);

// Protected review write/edit/delete
router.post('/movies/:movieId/reviews', protect, createReviewValidator, ReviewController.createReview);
router.put('/reviews/:id', protect, updateReviewValidator, ReviewController.updateReview);
router.delete('/reviews/:id', protect, validateReviewId, ReviewController.deleteReview);

module.exports = router;
