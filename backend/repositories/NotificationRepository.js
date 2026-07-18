const BaseRepository = require('./BaseRepository');
const { Notification } = require('../models');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findUserNotifications(user_id, options = {}) {
    return await this.findAll({
      where: { user_id },
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async markAllAsRead(user_id, options = {}) {
    return await this.model.update(
      { is_read: true },
      {
        where: { user_id, is_read: false },
        ...options
      }
    );
  }
}

module.exports = new NotificationRepository();
