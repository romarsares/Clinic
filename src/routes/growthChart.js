/**
 * Growth Chart Routes
 * WHO Growth Standards API endpoints
 */

const express = require('express');
const router = express.Router();
const GrowthChartController = require('../controllers/GrowthChartController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware
router.use(authenticateToken);

// Get patient growth data with WHO percentiles
router.get('/:patientId', GrowthChartController.getPatientGrowthData);

// Add new growth measurement
router.post('/measurements', GrowthChartController.addGrowthMeasurement);

// Get WHO chart data for visualization
router.get('/who-data', GrowthChartController.getWHOChartData);

// Get growth summary for dashboard
router.get('/summary', GrowthChartController.getGrowthSummary);

module.exports = router;