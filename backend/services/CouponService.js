const CouponRepository = require('../repositories/CouponRepository');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');

class CouponService {
  async getCoupons() {
    return await CouponRepository.findAll();
  }

  async getCouponById(id) {
    const coupon = await CouponRepository.findById(id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
    return coupon;
  }

  async createCoupon(data) {
    const existing = await CouponRepository.findByCode(data.coupon_code.toUpperCase());
    if (existing) {
      throw new AppError('Coupon code already exists', 400);
    }

    return await CouponRepository.create({
      ...data,
      coupon_code: data.coupon_code.toUpperCase()
    });
  }

  async updateCoupon(id, data) {
    const coupon = await CouponRepository.findById(id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    if (data.coupon_code) {
      const existing = await CouponRepository.findByCode(data.coupon_code.toUpperCase());
      if (existing && existing.id !== id) {
        throw new AppError('Coupon code already exists', 400);
      }
      data.coupon_code = data.coupon_code.toUpperCase();
    }

    return await CouponRepository.update(id, data);
  }

  async deleteCoupon(id) {
    const coupon = await CouponRepository.findById(id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
    return await CouponRepository.delete(id);
  }

  async validateCoupon(couponCode, totalAmount, eventId = null, categoryName = null, ticketQty = 1) {
    const coupon = await CouponRepository.findByCode(couponCode.toUpperCase());
    if (!coupon || coupon.status !== 'active') {
      throw new AppError('Invalid or inactive coupon code', 400);
    }

    // Check start date
    if (coupon.start_date && new Date(coupon.start_date) > new Date()) {
      throw new AppError('This coupon promotion has not started yet', 400);
    }

    // Check expiry
    if (new Date(coupon.expiry_date) < new Date()) {
      throw new AppError('Coupon has expired', 400);
    }

    // Check event restriction
    if (coupon.event_id && eventId && coupon.event_id !== eventId) {
      throw new AppError('This coupon is not applicable to the selected event', 400);
    }

    // Check applicable ticket category
    if (coupon.applicable_categories && categoryName) {
      const allowedCategories = typeof coupon.applicable_categories === 'string'
        ? JSON.parse(coupon.applicable_categories)
        : coupon.applicable_categories;
      if (Array.isArray(allowedCategories) && allowedCategories.length > 0 && !allowedCategories.includes(categoryName)) {
        throw new AppError(`This coupon is only applicable to categories: ${allowedCategories.join(', ')}`, 400);
      }
    }

    // Check group discount size
    if (coupon.group_discount_size && ticketQty < coupon.group_discount_size) {
      throw new AppError(`This coupon requires a minimum of ${coupon.group_discount_size} tickets in the order`, 400);
    }

    // Check minimum amount
    if (parseFloat(totalAmount) < parseFloat(coupon.minimum_amount)) {
      throw new AppError(`Minimum order amount of ₹${coupon.minimum_amount} required to use this coupon`, 400);
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'flat') {
      discount = parseFloat(coupon.discount_value);
    } else if (coupon.discount_type === 'percentage') {
      discount = parseFloat(totalAmount) * (parseFloat(coupon.discount_value) / 100);
    }

    // Ensure discount does not exceed the total amount
    if (discount > totalAmount) {
      discount = totalAmount;
    }

    return {
      coupon_id: coupon.id,
      coupon_code: coupon.coupon_code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: parseFloat(discount.toFixed(2))
    };
  }
}

module.exports = new CouponService();
