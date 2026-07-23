const TheatreRepository = require('../repositories/MovieRepository'); // Wait, require TheatreRepository, not MovieRepository!
const City = require('../models').City;
const TheatreRepo = require('../repositories/TheatreRepository');
const AppError = require('../utils/appError');

class TheatreService {
  async getTheatres(filters) {
    return await TheatreRepo.findFiltered(filters);
  }

  async getTheatreById(id) {
    const theatre = await TheatreRepo.findById(id, { include: ['city'] });
    if (!theatre) {
      throw new AppError('Theatre not found', 404);
    }
    return theatre;
  }

  async createTheatre(data, user) {
    const LocationService = require('./LocationService');
    const city = await LocationService.resolveOrCreateCity({
      city_id: data.city_id,
      city_name: data.city_name || data.city,
      state: data.state
    });
    if (!city) {
      throw new AppError('Specified city/location is invalid or incomplete', 400);
    }

    const payload = { ...data };
    payload.city_id = city.id;

    if (user.role.role_name === 'Theatre Owner') {
      payload.owner_id = user.id;
      payload.status = 'pending_approval';
    } else if (user.role.role_name === 'Admin') {
      payload.status = payload.status || 'active';
    } else {
      throw new AppError('Access denied', 403);
    }

    return await TheatreRepo.create(payload);
  }

  async updateTheatre(id, data, user) {
    const theatre = await TheatreRepo.findById(id);
    if (!theatre) {
      throw new AppError('Theatre not found', 404);
    }

    // Owner checks
    if (user.role.role_name === 'Theatre Owner' && theatre.owner_id !== user.id) {
      throw new AppError('You do not own this theatre', 403);
    }

    // City check if city is being updated
    if (data.city_id || data.city_name || data.city || data.state) {
      const LocationService = require('./LocationService');
      const city = await LocationService.resolveOrCreateCity({
        city_id: data.city_id || theatre.city_id,
        city_name: data.city_name || data.city,
        state: data.state
      });
      if (!city) {
        throw new AppError('Specified city/location is invalid or incomplete', 400);
      }
      data.city_id = city.id;
    }

    // Protect status modification for Theatre Owners
    const payload = { ...data };
    if (user.role.role_name === 'Theatre Owner') {
      delete payload.status;
      delete payload.owner_id;
    }

    return await TheatreRepo.update(id, payload);
  }

  async deleteTheatre(id, user) {
    const theatre = await TheatreRepo.findById(id);
    if (!theatre) {
      throw new AppError('Theatre not found', 404);
    }

    if (user.role.role_name === 'Theatre Owner' && theatre.owner_id !== user.id) {
      throw new AppError('You do not own this theatre', 403);
    }

    return await TheatreRepo.delete(id);
  }

  async approveRejectTheatre(id, status) {
    const theatre = await TheatreRepo.findById(id);
    if (!theatre) {
      throw new AppError('Theatre not found', 404);
    }

    if (!['active', 'inactive'].includes(status)) {
      throw new AppError('Invalid approval status', 400);
    }

    return await TheatreRepo.update(id, { status });
  }
}

module.exports = new TheatreService();
