const ShowService = require('../services/ShowService');

class ShowController {
  async getShows(req, res, next) {
    try {
      const shows = await ShowService.getShows(req.query);
      res.status(200).json({
        status: 'success',
        results: shows.length,
        data: { shows }
      });
    } catch (err) {
      next(err);
    }
  }

  async getShow(req, res, next) {
    try {
      const show = await ShowService.getShowById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { show }
      });
    } catch (err) {
      next(err);
    }
  }

  async getShowSeats(req, res, next) {
    try {
      const seats = await ShowService.getShowSeats(req.params.id);
      res.status(200).json({
        status: 'success',
        results: seats.length,
        data: { seats }
      });
    } catch (err) {
      next(err);
    }
  }

  async createShow(req, res, next) {
    try {
      const show = await ShowService.createShow(req.body, req.user);
      res.status(201).json({
        status: 'success',
        message: 'Show scheduled successfully',
        data: { show }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateShow(req, res, next) {
    try {
      const show = await ShowService.updateShow(req.params.id, req.body, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Show updated successfully',
        data: { show }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteShow(req, res, next) {
    try {
      await ShowService.deleteShow(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Show deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ShowController();
