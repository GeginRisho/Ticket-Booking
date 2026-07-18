const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, DashboardController.getDashboardStats);

module.exports = router;
