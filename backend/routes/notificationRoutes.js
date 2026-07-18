const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const { protect } = require('../middlewares/authMiddleware');
const { markAsReadValidator } = require('../validators/notificationValidator');

const router = express.Router();

// All notification routes are protected
router.use(protect);

router.get('/', NotificationController.getNotifications);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', markAsReadValidator, NotificationController.markAsRead);

module.exports = router;
