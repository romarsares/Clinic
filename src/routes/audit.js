const express = require('express');
const router = express.Router();
const SimpleControllers = require('../controllers/SimpleControllers');
const { authenticateToken } = require('../middleware/auth');

router.get('/logs', authenticateToken, SimpleControllers.getAuditLogs);

module.exports = router;