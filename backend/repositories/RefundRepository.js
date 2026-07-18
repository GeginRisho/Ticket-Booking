const BaseRepository = require('./BaseRepository');
const { Refund } = require('../models');

class RefundRepository extends BaseRepository {
  constructor() {
    super(Refund);
  }

  async findByPaymentId(payment_id, options = {}) {
    return await this.findAll({
      where: { payment_id },
      ...options
    });
  }
}

module.exports = new RefundRepository();
