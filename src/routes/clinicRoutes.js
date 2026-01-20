/**
 * Clinic Routes - Tenant Management API Endpoints
 * 
 * Author: Antigravity
 * Created: 2026-01-19
 * Purpose: Defines API routes for clinic profile and settings management
 */

const express = require('express');
const ClinicController = require('../controllers/ClinicController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

const router = express.Router();
const clinicController = new ClinicController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/v1/clinics
 * @desc    Create new clinic (SuperAdmin only)
 * @access  Private (SuperAdmin)
 */
router.post('/',
    requireRole(['SuperAdmin']),
    auditLog('clinic', 'create'),
    (req, res) => clinicController.createClinic(req, res)
);

/**
 * @route   GET /api/v1/clinics
 * @desc    List all clinics (SuperAdmin only)
 * @access  Private (SuperAdmin)
 */
router.get('/',
    requireRole(['SuperAdmin']),
    auditLog('clinic', 'list'),
    (req, res) => clinicController.listClinics(req, res)
);

/**
 * @route   GET /api/v1/clinics/:id
 * @desc    Get clinic details
 * @access  Private (Owner, Admin, Staff, Doctor)
 */
router.get('/:id',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'SuperAdmin']),
    auditLog('clinic', 'view'),
    (req, res) => clinicController.getClinicDetails(req, res)
);

/**
 * @route   PUT /api/v1/clinics/:id
 * @desc    Update clinic information
 * @access  Private (Owner, SuperAdmin)
 */
router.put('/:id',
    requireRole(['Owner', 'SuperAdmin']),
    auditLog('clinic', 'update'),
    (req, res) => clinicController.updateClinicInfo(req, res)
);

/**
 * @route   DELETE /api/v1/clinics/:id
 * @desc    Deactivate clinic (SuperAdmin only)
 * @access  Private (SuperAdmin)
 */
router.delete('/:id',
    requireRole(['SuperAdmin']),
    auditLog('clinic', 'deactivate'),
    (req, res) => clinicController.deactivateClinic(req, res)
);

/**
 * @route   GET /api/v1/clinics/:id/settings
 * @desc    Get clinic settings
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.get('/:id/settings',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('clinic_settings', 'view'),
    (req, res) => clinicController.getSettings(req, res)
);

/**
 * @route   POST /api/v1/clinics/:id/settings
 * @desc    Update or create clinic setting
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.post('/:id/settings',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('clinic_settings', 'create'),
    (req, res) => clinicController.updateSetting(req, res)
);

/**
 * @route   GET /api/v1/clinics/:id/stats
 * @desc    Get clinic statistics
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.get('/:id/stats',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('clinic_stats', 'view'),
    (req, res) => clinicController.getStats(req, res)
);

module.exports = router;
