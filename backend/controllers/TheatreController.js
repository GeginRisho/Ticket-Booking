const TheatreService = require('../services/TheatreService');

class TheatreController {
  async getTheatres(req, res, next) {
    try {
      const theatres = await TheatreService.getTheatres(req.query);
      res.status(200).json({
        status: 'success',
        results: theatres.length,
        data: { theatres }
      });
    } catch (err) {
      next(err);
    }
  }

  async getTheatre(req, res, next) {
    try {
      const theatre = await TheatreService.getTheatreById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { theatre }
      });
    } catch (err) {
      next(err);
    }
  }

  async createTheatre(req, res, next) {
    try {
      const theatre = await TheatreService.createTheatre(req.body, req.user);
      res.status(201).json({
        status: 'success',
        message: 'Theatre created successfully',
        data: { theatre }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateTheatre(req, res, next) {
    try {
      const theatre = await TheatreService.updateTheatre(req.params.id, req.body, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Theatre updated successfully',
        data: { theatre }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteTheatre(req, res, next) {
    try {
      await TheatreService.deleteTheatre(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Theatre deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async approveRejectTheatre(req, res, next) {
    try {
      const { status } = req.body;
      const theatre = await TheatreService.approveRejectTheatre(req.params.id, status);
      res.status(200).json({
        status: 'success',
        message: `Theatre status updated to ${status} successfully`,
        data: { theatre }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TheatreController();
