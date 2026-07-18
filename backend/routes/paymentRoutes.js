const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const {
  createOrderValidator,
  verifyPaymentValidator,
  refundPaymentValidator
} = require('../validators/paymentValidator');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

router.post('/order', createOrderValidator, PaymentController.createOrder);
router.post('/verify', verifyPaymentValidator, PaymentController.verifyPayment);

// Refund is Admin-only
router.post('/:id/refund', restrictTo('Admin'), refundPaymentValidator, PaymentController.refundPayment);

module.exports = router;
