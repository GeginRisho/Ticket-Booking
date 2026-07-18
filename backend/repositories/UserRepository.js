const BaseRepository = require('./BaseRepository');
const { User } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, options = {}) {
    return await this.findOne({ where: { email }, ...options });
  }

  async findByPhone(phone, options = {}) {
    return await this.findOne({ where: { phone }, ...options });
  }

  async findUserWithRole(id, options = {}) {
    return await this.findById(id, {
      include: ['role', 'city'],
      ...options
    });
  }
}

module.exports = new UserRepository();
