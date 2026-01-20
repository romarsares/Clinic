/**
 * Appointment Management Routes - Basic Scheduling Operations
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles appointment scheduling, updates, and cancellations
 */

const express = require('express');
const AppointmentController = require('../controllers/AppointmentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { requireFeature } = require('../middleware/featureToggle');

const router = express.Router();
const appointmentController = new AppointmentController();

// Apply authentication and feature check middleware to all routes
router.use(authenticateToken);
router.use(requireFeature('appointments'));

/**
 * @route   GET /api/v1/appointments
 * @desc    List appointments in clinic
 * @access  Private (All clinic staff)
 */
router.get('/',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Super User']),
    auditLog('appointment', 'list'),
    (req, res) => appointmentController.listAppointments(req, res)
);

/**
 * @route   POST /api/v1/appointments
 * @desc    Create new appointment
 * @access  Private (Staff, Admin, Owner)
 */
router.post('/',
    requireRole(['Owner', 'Admin', 'Staff', 'Super User']),
    auditLog('appointment', 'create'),
    (req, res) => appointmentController.createAppointment(req, res)
);

/**
 * @route   GET /api/v1/appointments/calendar
 * @desc    Get appointments for calendar view
 * @access  Private (All clinic staff)
 */
router.get('/calendar',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Super User']),
    auditLog('appointment', 'calendar_view'),
    (req, res) => appointmentController.getCalendarView(req, res)
);

/**
 * @route   GET /api/v1/appointments/today
 * @desc    Get today's appointments
 * @access  Private (All clinic staff)
 */
router.get('/today',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Super User']),
    auditLog('appointment', 'today_view'),
    (req, res) => appointmentController.getTodayAppointments(req, res)
);

/**
 * @route   GET /api/v1/appointments/:id
 * @desc    Get appointment details
 * @access  Private (All clinic staff, or Parent for own children)
 */
router.get('/:id',
    auditLog('appointment', 'view'),
    (req, res) => appointmentController.getAppointmentDetails(req, res)
);

/**
 * @route   PUT /api/v1/appointments/:id
 * @desc    Update appointment
 * @access  Private (Staff, Admin, Owner)
 */
router.put('/:id',
    requireRole(['Owner', 'Admin', 'Staff', 'Super User']),
    auditLog('appointment', 'update'),
    (req, res) => appointmentController.updateAppointment(req, res)
);

/**
 * @route   PUT /api/v1/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private (Staff, Admin, Owner, Doctor)
 */
router.put('/:id/status',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Super User']),
    auditLog('appointment', 'status_change'),
    (req, res) => appointmentController.updateAppointmentStatus(req, res)
);

/**
 * @route   DELETE /api/v1/appointments/:id
 * @desc    Cancel appointment
 * @access  Private (Staff, Admin, Owner)
 */
router.delete('/:id',
    requireRole(['Owner', 'Admin', 'Staff', 'Super User']),
    auditLog('appointment', 'cancel'),
    (req, res) => appointmentController.cancelAppointment(req, res)
);

module.exports = router;