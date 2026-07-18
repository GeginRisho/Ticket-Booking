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

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const createOrderValidator = [
  body('booking_id')
    .matches(uuidRegex).withMessage('booking_id must be a valid UUID'),
  validateResult
];

const verifyPaymentValidator = [
  body('booking_id')
    .matches(uuidRegex).withMessage('booking_id must be a valid UUID'),

  body('razorpay_order_id')
    .trim()
    .notEmpty().withMessage('razorpay_order_id is required'),

  body('razorpay_payment_id')
    .trim()
    .notEmpty().withMessage('razorpay_payment_id is required'),

  body('razorpay_signature')
    .trim()
    .notEmpty().withMessage('razorpay_signature is required'),

  body('payment_method')
    .optional()
    .trim(),

  validateResult
];

const refundPaymentValidator = [
  param('id')
    .matches(uuidRegex).withMessage('Invalid payment ID format'),

  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Refund amount must be a positive number'),

  body('reason')
    .optional()
    .trim(),

  validateResult
];

module.exports = {
  createOrderValidator,
  verifyPaymentValidator,
  refundPaymentValidator
};
