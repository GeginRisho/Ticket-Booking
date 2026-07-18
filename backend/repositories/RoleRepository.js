const BaseRepository = require('./BaseRepository');
const { Role } = require('../models');

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  async findByName(role_name, options = {}) {
    return await this.findOne({ where: { role_name }, ...options });
  }
}

module.exports = new RoleRepository();
