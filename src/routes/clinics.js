const express = require('express');
const router = express.Router();
const ClinicController = require('../controllers/ClinicController');
const { authenticateToken } = require('../middleware/auth');

router.get('/:clinicId/stats', authenticateToken, ClinicController.getStats);

module.exports = router;