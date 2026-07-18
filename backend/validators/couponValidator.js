const { body, param, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(err => `${err.path}: ${err.msg}`).join('. ');
    return next(new AppError(errorMsgs, 400));
  }
  next();
};

const createCouponValidator = [
  body('coupon_code')
    .trim()
    .notEmpty().withMessage('Coupon code is required')
    .isAlphanumeric().withMessage('Coupon code must contain only letters and numbers')
    .isLength({ min: 3, max: 20 }).withMessage('Coupon code must be between 3 and 20 characters'),

  body('discount_type')
    .trim()
    .notEmpty().withMessage('Discount type is required')
    .isIn(['percentage', 'flat']).withMessage('Discount type must be either percentage or flat'),

  body('discount_value')
    .isFloat({ min: 0.01 }).withMessage('Discount value must be a positive number'),

  body('minimum_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum amount must be a non-negative number'),

  body('expiry_date')
    .isISO8601().withMessage('Expiry date must be a valid ISO8601 date string')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),

  body('usage_limit')
    .isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),

  validateResult
];

const updateCouponValidator = [
  param('id')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).withMessage('Invalid coupon ID format'),

  body('coupon_code')
    .optional()
    .trim()
    .isAlphanumeric().withMessage('Coupon code must contain only letters and numbers')
    .isLength({ min: 3, max: 20 }).withMessage('Coupon code must be between 3 and 20 characters'),

  body('discount_type')
    .optional()
    .trim()
    .isIn(['percentage', 'flat']).withMessage('Discount type must be either percentage or flat'),

  body('discount_value')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Discount value must be a positive number'),

  body('minimum_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum amount must be a non-negative number'),

  body('expiry_date')
    .optional()
    .isISO8601().withMessage('Expiry date must be a valid ISO8601 date string'),

  body('usage_limit')
    .optional()
    .isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),

  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),

  validateResult
];

const validateCouponValidator = [
  body('coupon_code')
    .trim()
    .notEmpty().withMessage('Coupon code is required'),

  body('total_amount')
    .isFloat({ min: 0.01 }).withMessage('Total amount must be a positive number'),

  validateResult
];

module.exports = {
  createCouponValidator,
  updateCouponValidator,
  validateCouponValidator
};
