const express = require('express');
const PatientHistoryController = require('../controllers/PatientHistoryController');
const { authenticateToken } = require('../middleware/auth');
const { enforceTenantIsolation } = require('../middleware/tenant');

const router = express.Router();

// Apply authentication and tenant middleware to all routes
router.use(authenticateToken);
router.use(enforceTenantIsolation);

// Patient history routes
router.get('/patients/:patientId/history', PatientHistoryController.getPatientHistory);
router.get('/patients/:patientId/summary', PatientHistoryController.generatePatientSummary);
router.get('/patients/:patientId/referral', PatientHistoryController.generateReferralReport);

// Search and filter routes
router.get('/search/diagnosis', PatientHistoryController.searchByDiagnosis);
router.get('/search/advanced', PatientHistoryController.advancedSearch);

// Clinical reports routes
router.get('/reports/:type', PatientHistoryController.getClinicalReports);

// Pediatric features routes
router.get('/patients/:patientId/growth-chart', PatientHistoryController.getGrowthChart);
router.get('/patients/:patientId/milestones', PatientHistoryController.getDevelopmentalMilestones);
router.get('/patients/:patientId/vaccines/compliance', PatientHistoryController.getVaccineCompliance);
router.post('/patients/:patientId/vaccines', PatientHistoryController.addVaccineRecord);

module.exports = router;