const EventService = require('../services/EventService');

class EventController {
  // Categories
  async getCategories(req, res, next) {
    try {
      const categories = await EventService.getCategories();
      res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories }
      });
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await EventService.createCategory(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Event category created successfully',
        data: { category }
      });
    } catch (err) {
      next(err);
    }
  }

  // Events
  async getEvents(req, res, next) {
    try {
      const filters = { ...req.query };
      const userRole = req.user?.role?.role_name || req.user?.role || '';
      
      // If not admin/super-admin/organizer, only return active/published events
      if (userRole !== 'Admin' && userRole !== 'Super Admin' && userRole !== 'Event Organizer') {
        filters.status = 'published';
      }
      
      const events = await EventService.getEvents(filters);
      res.status(200).json({
        status: 'success',
        results: events.length,
        data: { events }
      });
    } catch (err) {
      next(err);
    }
  }

  async getEvent(req, res, next) {
    try {
      const event = await EventService.getEventById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { event }
      });
    } catch (err) {
      next(err);
    }
  }

  async createEvent(req, res, next) {
    try {
      const event = await EventService.createEvent(req.body, req.user);
      res.status(201).json({
        status: 'success',
        message: 'Event and tickets created successfully',
        data: { event }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateEvent(req, res, next) {
    try {
      const event = await EventService.updateEvent(req.params.id, req.body, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Event updated successfully',
        data: { event }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteEvent(req, res, next) {
    try {
      await EventService.deleteEvent(req.params.id, req.user);
      res.status(200).json({
        status: 'success',
        message: 'Event deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async approveEvent(req, res, next) {
    try {
      const event = await EventService.approveEvent(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Event approved successfully',
        data: { event }
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectEvent(req, res, next) {
    try {
      const { reason } = req.body;
      const event = await EventService.rejectEvent(req.params.id, reason);
      res.status(200).json({
        status: 'success',
        message: 'Event rejected successfully',
        data: { event }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EventController();
