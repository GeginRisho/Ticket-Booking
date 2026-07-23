const BaseRepository = require('./BaseRepository');
const { Role } = require('../models');
const { Op } = require('sequelize');

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  async findByName(role_name, options = {}) {
    if (!role_name) return null;
    const normalized = role_name.toLowerCase().replace(/\s+/g, '_');
    return await this.findOne({
      where: {
        role_name: {
          [Op.in]: [role_name, normalized]
        }
      },
      ...options
    });
  }
}

module.exports = new RoleRepository();
