const BaseRepository = require('./BaseRepository');
const { Coupon } = require('../models');

class CouponRepository extends BaseRepository {
  constructor() {
    super(Coupon);
  }

  async findByCode(coupon_code, options = {}) {
    return await this.findOne({
      where: { coupon_code },
      ...options
    });
  }
}

module.exports = new CouponRepository();
