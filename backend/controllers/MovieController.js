const MovieService = require('../services/MovieService');

class MovieController {
  async getMovies(req, res, next) {
    try {
      const movies = await MovieService.getMovies(req.query);
      res.status(200).json({
        status: 'success',
        results: movies.length,
        data: { movies }
      });
    } catch (err) {
      next(err);
    }
  }

  async getMovie(req, res, next) {
    try {
      const movie = await MovieService.getMovieById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { movie }
      });
    } catch (err) {
      next(err);
    }
  }

  async createMovie(req, res, next) {
    try {
      const movie = await MovieService.createMovie(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Movie created successfully',
        data: { movie }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateMovie(req, res, next) {
    try {
      const movie = await MovieService.updateMovie(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Movie updated successfully',
        data: { movie }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteMovie(req, res, next) {
    try {
      await MovieService.deleteMovie(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Movie deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async addCast(req, res, next) {
    try {
      const cast = await MovieService.addCast(req.params.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Movie cast member added successfully',
        data: { cast }
      });
    } catch (err) {
      next(err);
    }
  }

  async removeCast(req, res, next) {
    try {
      await MovieService.removeCast(req.params.id, req.params.castId);
      res.status(200).json({
        status: 'success',
        message: 'Movie cast member removed successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MovieController();
