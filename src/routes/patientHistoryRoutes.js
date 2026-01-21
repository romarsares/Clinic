const express = require('express');
const PatientHistoryController = require('../controllers/PatientHistoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Patient history routes - require clinical access
router.get('/patients/:patientId/history', requireRole(['Doctor', 'Staff']), PatientHistoryController.getPatientHistory);
router.get('/patients/:patientId/timeline', requireRole(['Doctor', 'Staff']), PatientHistoryController.getTimeline);
router.get('/patients/:patientId/diagnoses', requireRole(['Doctor', 'Staff']), PatientHistoryController.getDiagnosisHistory);
router.get('/patients/:patientId/treatments', requireRole(['Doctor', 'Staff']), PatientHistoryController.getTreatmentHistory);
router.get('/patients/:patientId/lab-history', requireRole(['Doctor', 'Staff', 'Lab Technician']), PatientHistoryController.getLabHistory);
router.get('/patients/:patientId/medications', requireRole(['Doctor', 'Staff']), PatientHistoryController.getMedicationHistory);
router.get('/patients/:patientId/growth-chart', requireRole(['Doctor', 'Staff']), PatientHistoryController.getGrowthChart);

// Filtering and search routes
router.get('/patients/:patientId/filter', requireRole(['Doctor', 'Staff']), PatientHistoryController.filterByDateRange);
router.get('/search/diagnosis', requireRole(['Doctor', 'Staff']), PatientHistoryController.searchByDiagnosis);
router.get('/search/advanced', requireRole(['Doctor', 'Staff']), PatientHistoryController.advancedSearch);
router.get('/search/lab-results', requireRole(['Doctor', 'Staff', 'Lab Technician']), PatientHistoryController.filterByLabResults);
router.get('/search/demographics', requireRole(['Doctor', 'Staff']), PatientHistoryController.searchWithDemographics);

// Export routes
router.get('/patients/:patientId/summary', requireRole(['Doctor', 'Staff']), PatientHistoryController.generatePatientSummary);
router.get('/patients/:patientId/referral', requireRole(['Doctor']), PatientHistoryController.generateReferralReport);
router.get('/visits/:visitId/summary', requireRole(['Doctor', 'Staff']), PatientHistoryController.generateVisitSummary);
router.get('/patients/:patientId/lab-report', requireRole(['Doctor', 'Staff', 'Lab Technician']), PatientHistoryController.generateLabResultsReport);
router.get('/patients/:patientId/medication-list', requireRole(['Doctor', 'Staff']), PatientHistoryController.generateMedicationList);
router.post('/reports/batch', requireRole(['Doctor', 'Staff']), PatientHistoryController.generateBatchReports);

// Vaccine routes
router.get('/patients/:patientId/vaccines', requireRole(['Doctor', 'Staff']), PatientHistoryController.getVaccineRecords);
router.get('/patients/:patientId/vaccines/compliance', requireRole(['Doctor', 'Staff']), PatientHistoryController.getVaccineCompliance);
router.post('/patients/:patientId/vaccines', requireRole(['Doctor', 'Staff']), PatientHistoryController.addVaccineRecord);

module.exports = router;