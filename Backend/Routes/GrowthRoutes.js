const express = require('express');
const router = express.Router();
const growthController = require('../controllers/GrowthController');

// Record maintenance (watering/fertilizing)
router.post('/maintenance', growthController.recordMaintenance);

// Get maintenance schedule for a plant
router.get('/schedule/:plantId', growthController.getSchedule);

// Get plants needing maintenance
router.get('/needs-maintenance', growthController.getNeedingMaintenance);

module.exports = router;
