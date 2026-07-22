const { Venue, City, User } = require('../models');
const AppError = require('../utils/appError');

class VenueService {
  async getVenues(user) {
    const userRole = user.role?.role_name || user.role;
    const filter = {};
    
    if (userRole === 'Event Organizer') {
      filter.organizer_id = user.id;
    }
    
    return await Venue.findAll({
      where: filter,
      include: [
        { model: City, as: 'city', attributes: ['id', 'city_name', 'state'] }
      ]
    });
  }

  async getVenueById(id, user) {
    const venue = await Venue.findByPk(id, {
      include: [
        { model: City, as: 'city', attributes: ['id', 'city_name', 'state'] }
      ]
    });
    
    if (!venue) {
      throw new AppError('Venue not found', 404);
    }
    
    const userRole = user.role?.role_name || user.role;
    if (userRole === 'Event Organizer' && venue.organizer_id !== user.id) {
      throw new AppError('You do not have permission to access this venue', 403);
    }
    
    return venue;
  }

  async createVenue(data, user) {
    const { name, address, city_id, seating_capacity, maps_location, parking_information, contact_number, gallery_images } = data;
    
    // Verify city exists
    const city = await City.findByPk(city_id);
    if (!city) {
      throw new AppError('City not found', 404);
    }
    
    const userRole = user.role?.role_name || user.role;
    const organizer_id = userRole === 'Event Organizer' ? user.id : (data.organizer_id || null);

    return await Venue.create({
      name,
      address,
      city_id,
      seating_capacity,
      maps_location,
      parking_information,
      contact_number,
      gallery_images,
      organizer_id
    });
  }

  async updateVenue(id, data, user) {
    const venue = await Venue.findByPk(id);
    if (!venue) {
      throw new AppError('Venue not found', 404);
    }
    
    const userRole = user.role?.role_name || user.role;
    if (userRole === 'Event Organizer' && venue.organizer_id !== user.id) {
      throw new AppError('You do not have permission to modify this venue', 403);
    }
    
    if (data.city_id) {
      const city = await City.findByPk(data.city_id);
      if (!city) {
        throw new AppError('City not found', 404);
      }
    }

    await venue.update(data);
    return await Venue.findByPk(id, {
      include: [{ model: City, as: 'city', attributes: ['id', 'city_name', 'state'] }]
    });
  }

  async deleteVenue(id, user) {
    const venue = await Venue.findByPk(id);
    if (!venue) {
      throw new AppError('Venue not found', 404);
    }
    
    const userRole = user.role?.role_name || user.role;
    if (userRole === 'Event Organizer' && venue.organizer_id !== user.id) {
      throw new AppError('You do not have permission to delete this venue', 403);
    }
    
    await venue.destroy();
    return { message: 'Venue deleted successfully' };
  }
}

module.exports = new VenueService();
