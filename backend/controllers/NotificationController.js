const NotificationService = require('../services/NotificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user.id);
      res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: { notifications }
      });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.user.id, req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read successfully',
        data: { notification }
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await NotificationService.markAllRead(req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
