const express = require('express');
const CouponController = require('../controllers/CouponController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');
const {
  createCouponValidator,
  updateCouponValidator,
  validateCouponValidator
} = require('../validators/couponValidator');

const router = express.Router();

const validateId = [
  param('id').matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid coupon ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

// Public coupon routes (accessible by guests and customers)
router.get('/', CouponController.getCoupons);
router.get('/:id', validateId, CouponController.getCoupon);

// Protected routes (requires authentication)
router.use(protect);

// Validation is available to Customers / all users
router.post('/validate', validateCouponValidator, CouponController.validateCoupon);

// Admin-only management routes
router.use(restrictTo('Admin'));

router.post('/', createCouponValidator, CouponController.createCoupon);
router.put('/:id', updateCouponValidator, CouponController.updateCoupon);
router.delete('/:id', validateId, CouponController.deleteCoupon);

module.exports = router;
