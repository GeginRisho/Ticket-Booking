const express = require('express');
const LocationService = require('../services/LocationService');
const router = express.Router();

// GET /api/states
router.get('/states', async (req, res, next) => {
  try {
    const states = await LocationService.getStates();
    res.status(200).json({
      status: 'success',
      results: states.length,
      data: { states }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/cities (supports optional ?state= filter)
router.get('/cities', async (req, res, next) => {
  try {
    const { state } = req.query;
    const cities = await LocationService.getCities(state);
    res.status(200).json({
      status: 'success',
      results: cities.length,
      data: { cities }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
