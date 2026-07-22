const express = require('express');
const AdminController = require('../controllers/AdminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all admin routes and restrict them to Admin/Super Admin
router.use(protect);
router.use(restrictTo('Admin', 'Super Admin'));

router.get('/organizers', AdminController.getOrganizers);
router.get('/organizers/:id', AdminController.getOrganizerDetails);
router.put('/organizers/:id/status', AdminController.updateOrganizerStatus);
router.get('/organizers/:id/events', AdminController.getOrganizerEvents);
router.get('/organizers/:id/performance', AdminController.getOrganizerPerformance);

module.exports = router;
