const express = require('express');
const LabController = require('../controllers/LabController');
const { authenticateToken } = require('../middleware/auth');
const { enforceTenantIsolation } = require('../middleware/tenant');
const { requireFeature } = require('../middleware/featureToggle');

const router = express.Router();

// Apply authentication, tenant isolation, and feature check
router.use(authenticateToken);
router.use(enforceTenantIsolation);
router.use(requireFeature('laboratory'));

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