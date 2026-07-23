const { City } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');

class LocationService {
  /**
   * Normalizes a string by trimming whitespace and capitalizing the first letter of each word.
   * e.g. "andhra pradesh " -> "Andhra Pradesh"
   *      "  mUMBAI " -> "Mumbai"
   */
  normalizeName(str) {
    if (!str) return '';
    return str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Resolves an existing city by ID, or resolves/creates it by city_name and state.
   */
  async resolveOrCreateCity({ city_id, city_name, state }) {
    // 1. If city_id is a valid UUID, look it up
    if (city_id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(city_id)) {
      const cityObj = await City.findByPk(city_id);
      if (cityObj) return cityObj;
    }

    // 2. Resolve by normalized city_name and state
    if (!city_name || !state) {
      return null;
    }

    const normalizedCity = this.normalizeName(city_name);
    const normalizedState = this.normalizeName(state);

    if (!normalizedCity || !normalizedState) {
      return null;
    }

    // Search case-insensitively to prevent duplicates
    let cityObj = await City.findOne({
      where: {
        city_name: { [Op.iLike]: normalizedCity },
        state: { [Op.iLike]: normalizedState }
      }
    });

    if (!cityObj) {
      // Create new city dynamically if not found
      cityObj = await City.create({
        city_name: normalizedCity,
        state: normalizedState,
        country: 'India',
        status: 'active'
      });
    }

    return cityObj;
  }

  /**
   * Returns a list of all distinct active states from the database.
   */
  async getStates() {
    const cities = await City.findAll({
      attributes: ['state'],
      where: { status: 'active' },
      group: ['state'],
      order: [['state', 'ASC']]
    });
    return cities.map(c => this.normalizeName(c.state));
  }

  /**
   * Returns active cities, optionally filtered by state.
   */
  async getCities(stateName = '') {
    const where = { status: 'active' };
    if (stateName) {
      const normalizedState = this.normalizeName(stateName);
      where.state = { [Op.iLike]: normalizedState };
    }

    return await City.findAll({
      where,
      order: [['city_name', 'ASC']]
    });
  }
}

module.exports = new LocationService();
