const NotificationRepository = require('../repositories/NotificationRepository');
const AppError = require('../utils/appError');

class NotificationService {
  async getUserNotifications(userId) {
    return await NotificationRepository.findUserNotifications(userId);
  }

  async markAsRead(userId, id) {
    const notification = await NotificationRepository.findById(id);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== userId) {
      throw new AppError('You do not own this notification', 403);
    }

    return await NotificationRepository.update(id, { is_read: true });
  }

  async markAllRead(userId) {
    return await NotificationRepository.markAllAsRead(userId);
  }

  async createNotification(userId, { title, message, type }) {
    return await NotificationRepository.create({
      user_id: userId,
      title,
      message,
      type: type || 'system',
      is_read: false
    });
  }
}

module.exports = new NotificationService();
