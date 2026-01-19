const express = require('express');
const LabController = require('../controllers/LabController');
const { authenticateToken } = require('../middleware/auth');
const { enforceTenantIsolation } = require('../middleware/tenant');

const router = express.Router();

// Apply authentication and tenant middleware to all routes
router.use(authenticateToken);
router.use(enforceTenantIsolation);

// Lab request routes
router.post('/requests', LabController.createLabRequest);
router.get('/requests', LabController.getLabRequests);
router.get('/requests/:id', LabController.getLabRequestById);
router.put('/requests/:id/status', LabController.updateLabRequestStatus);

// Lab result routes
router.post('/results', LabController.createLabResult);
router.get('/results/request/:labRequestId', LabController.getLabResult);
router.get('/results/patient/:patientId', LabController.getPatientLabHistory);

// Lab templates and dashboard
router.get('/templates', LabController.getLabTemplates);
router.get('/dashboard', LabController.getLabDashboard);

module.exports = router;