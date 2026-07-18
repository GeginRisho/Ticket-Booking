const CouponService = require('../services/CouponService');

class CouponController {
  async getCoupons(req, res, next) {
    try {
      const coupons = await CouponService.getCoupons();
      res.status(200).json({
        status: 'success',
        results: coupons.length,
        data: { coupons }
      });
    } catch (err) {
      next(err);
    }
  }

  async getCoupon(req, res, next) {
    try {
      const coupon = await CouponService.getCouponById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { coupon }
      });
    } catch (err) {
      next(err);
    }
  }

  async createCoupon(req, res, next) {
    try {
      const coupon = await CouponService.createCoupon(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Coupon created successfully',
        data: { coupon }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateCoupon(req, res, next) {
    try {
      const coupon = await CouponService.updateCoupon(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Coupon updated successfully',
        data: { coupon }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteCoupon(req, res, next) {
    try {
      await CouponService.deleteCoupon(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Coupon deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async validateCoupon(req, res, next) {
    try {
      const { coupon_code, total_amount } = req.body;
      const result = await CouponService.validateCoupon(coupon_code, total_amount);
      res.status(200).json({
        status: 'success',
        message: 'Coupon is valid',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CouponController();
