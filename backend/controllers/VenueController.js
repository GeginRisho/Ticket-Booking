const VenueService = require('../services/VenueService');

class VenueController {
  async getVenues(req, res, next) {
    try {
      const venues = await VenueService.getVenues(req.user);
      res.status(200).json({
        status: 'success',
        data: venues
      });
    } catch (err) {
      next(err);
    }
  }

  async getVenue(req, res, next) {
    try {
      const venue = await VenueService.getVenueById(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        data: venue
      });
    } catch (err) {
      next(err);
    }
  }

  async createVenue(req, res, next) {
    try {
      const venue = await VenueService.createVenue(req.body, req.user);
      res.status(201).json({
        status: 'success',
        message: 'Venue created successfully',
        data: venue
      });
    } catch (err) {
      next(err);
    }
  }

  async updateVenue(req, res, next) {
    try {
      const venue = await VenueService.updateVenue(req.params.id, req.body, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Venue updated successfully',
        data: venue
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteVenue(req, res, next) {
    try {
      const result = await VenueService.deleteVenue(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new VenueController();
