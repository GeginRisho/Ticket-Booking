const BaseRepository = require('./BaseRepository');
const { Payment, Booking } = require('../models');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async findByBookingId(booking_id, options = {}) {
    return await this.findOne({
      where: { booking_id },
      ...options
    });
  }

  async findByTransactionId(transaction_id, options = {}) {
    return await this.findOne({
      where: { transaction_id },
      ...options
    });
  }
}

module.exports = new PaymentRepository();
