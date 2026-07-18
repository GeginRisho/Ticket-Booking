const ScreenService = require('../services/ScreenService');

class ScreenController {
  async getScreens(req, res, next) {
    try {
      const screens = await ScreenService.getScreensByTheatre(req.params.theatreId, req.user);
      res.status(200).json({
        status: 'success',
        results: screens.length,
        data: { screens }
      });
    } catch (err) {
      next(err);
    }
  }

  async getScreen(req, res, next) {
    try {
      const screen = await ScreenService.getScreenById(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        data: { screen }
      });
    } catch (err) {
      next(err);
    }
  }

  async createScreen(req, res, next) {
    try {
      const screen = await ScreenService.createScreen(req.params.theatreId, req.body, req.user);
      res.status(201).json({
        status: 'success',
        message: 'Screen and seat map created successfully',
        data: { screen }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateScreen(req, res, next) {
    try {
      const screen = await ScreenService.updateScreen(req.params.id, req.body, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Screen updated successfully',
        data: { screen }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteScreen(req, res, next) {
    try {
      await ScreenService.deleteScreen(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Screen deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ScreenController();
