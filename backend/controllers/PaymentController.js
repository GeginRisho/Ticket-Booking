const PaymentService = require('../services/PaymentService');

class PaymentController {
  async createOrder(req, res, next) {
    try {
      const { booking_id } = req.body;
      const order = await PaymentService.createOrder(req.user.id, booking_id);
      res.status(201).json({
        status: 'success',
        data: { order }
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const result = await PaymentService.verifyPayment(req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Payment verified and booking confirmed successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async refundPayment(req, res, next) {
    try {
      const refund = await PaymentService.processRefund(
        req.user.id,
        req.params.id,
        req.body
      );
      res.status(200).json({
        status: 'success',
        message: 'Refund processed successfully',
        data: { refund }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
