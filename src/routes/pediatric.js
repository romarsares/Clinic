/**
 * Developmental Milestones Routes
 * API endpoints for milestone tracking, vaccine compliance, and pediatric analytics
 */

const express = require('express');
const router = express.Router();
const DevelopmentalMilestonesController = require('../controllers/DevelopmentalMilestonesController');
const VaccineScheduleController = require('../controllers/VaccineScheduleController');
const PediatricAnalyticsController = require('../controllers/PediatricAnalyticsController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware
router.use(authenticateToken);

// Developmental Milestones Routes
router.get('/milestones/:patientId', DevelopmentalMilestonesController.getPatientMilestones);
router.post('/milestones/achievement', DevelopmentalMilestonesController.recordMilestoneAchievement);
router.get('/milestones/screening', DevelopmentalMilestonesController.getMilestoneScreening);
router.get('/milestones/summary', DevelopmentalMilestonesController.getMilestoneSummary);

// Vaccine Schedule Routes
router.get('/vaccines/:patientId', VaccineScheduleController.getPatientVaccineStatus);
router.post('/vaccines/administration', VaccineScheduleController.recordVaccineAdministration);
router.get('/vaccines/overdue', VaccineScheduleController.getOverdueVaccinations);
router.get('/vaccines/coverage', VaccineScheduleController.getVaccinationCoverage);
router.get('/vaccines/catchup/:patientId', VaccineScheduleController.generateCatchUpSchedule);

// Pediatric Analytics Routes
router.get('/analytics/dashboard', PediatricAnalyticsController.getPediatricDashboard);
router.get('/analytics/diseases', PediatricAnalyticsController.getChildhoodDiseaseTracking);
router.get('/analytics/vaccination-stats', PediatricAnalyticsController.getVaccinationStatistics);
router.get('/analytics/growth', PediatricAnalyticsController.getPediatricGrowthAnalytics);
router.get('/analytics/quality-indicators', PediatricAnalyticsController.getPediatricQualityIndicators);

module.exports = router;