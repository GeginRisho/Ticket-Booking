const ReviewService = require('../services/ReviewService');

class ReviewController {
  async getMovieReviews(req, res, next) {
    try {
      const reviews = await ReviewService.getMovieReviews(req.params.movieId);
      res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews }
      });
    } catch (err) {
      next(err);
    }
  }

  async createReview(req, res, next) {
    try {
      const review = await ReviewService.createReview(req.user.id, req.params.movieId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Review submitted successfully',
        data: { review }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateReview(req, res, next) {
    try {
      const review = await ReviewService.updateReview(req.user.id, req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Review updated successfully',
        data: { review }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteReview(req, res, next) {
    try {
      await ReviewService.deleteReview(req.user.id, req.params.id, req.user.role.role_name);
      res.status(200).json({
        status: 'success',
        message: 'Review deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReviewController();
