/**
 * Parent Portal Routes
 * API endpoints for parent-specific functionality
 */

const express = require('express');
const router = express.Router();
const ParentPortalController = require('../controllers/ParentPortalController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all parent portal routes
router.use(authenticateToken);

// Parent profile routes
router.get('/profile', ParentPortalController.getProfile);

// Children management routes
router.get('/children', ParentPortalController.getChildren);
router.get('/children/:childId', ParentPortalController.getChildDetails);
router.get('/children/:childId/history', ParentPortalController.getChildMedicalHistory);
router.get('/children/:childId/vaccines', ParentPortalController.getChildVaccines);
router.get('/children/:childId/growth', ParentPortalController.getChildGrowth);

// Appointment routes
router.get('/appointments/upcoming', ParentPortalController.getUpcomingAppointments);
router.post('/appointments/request', ParentPortalController.requestAppointment);

// Visit and medical history routes
router.get('/visits/recent', ParentPortalController.getRecentVisits);

// Vaccine and health tracking routes
router.get('/vaccines/reminders', ParentPortalController.getVaccineReminders);

module.exports = router;