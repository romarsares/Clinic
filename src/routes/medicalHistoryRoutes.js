/**
 * Medical History Routes - Patient Medical Records Management
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles patient medical history, allergies, medications, and family history
 */

const express = require('express');
const MedicalHistoryController = require('../controllers/MedicalHistoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { enforceTenantIsolation } = require('../middleware/tenant');
const { auditLog, logClinicalAccess } = require('../middleware/audit');

const router = express.Router();

// Apply authentication and tenant isolation
router.use(authenticateToken);
router.use(enforceTenantIsolation);

/**
 * @route   GET /api/v1/medical-history/:patientId
 * @desc    Get complete medical history for patient
 * @access  Private (All clinic staff)
 */
router.get('/:patientId',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Lab Technician']),
    logClinicalAccess('medical_history'),
    auditLog('medical_history', 'view'),
    (req, res) => new MedicalHistoryController().getCompleteMedicalHistory(req, res)
);

/**
 * @route   POST /api/v1/medical-history/:patientId/allergies
 * @desc    Add allergy record
 * @access  Private (Staff, Doctor, Admin, Owner)
 */
router.post('/:patientId/allergies',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor']),
    MedicalHistoryController.getAllergyValidation(),
    auditLog('allergy', 'create'),
    (req, res) => new MedicalHistoryController().addAllergy(req, res)
);

/**
 * @route   POST /api/v1/medical-history/:patientId/medications
 * @desc    Add current medication
 * @access  Private (Staff, Doctor, Admin, Owner)
 */
router.post('/:patientId/medications',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor']),
    MedicalHistoryController.getMedicationValidation(),
    auditLog('medication', 'create'),
    (req, res) => new MedicalHistoryController().addCurrentMedication(req, res)
);

/**
 * @route   POST /api/v1/medical-history/:patientId/past-history
 * @desc    Add past medical history
 * @access  Private (Staff, Doctor, Admin, Owner)
 */
router.post('/:patientId/past-history',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor']),
    MedicalHistoryController.getPastHistoryValidation(),
    auditLog('past_medical_history', 'create'),
    (req, res) => new MedicalHistoryController().addPastMedicalHistory(req, res)
);

/**
 * @route   POST /api/v1/medical-history/:patientId/family-history
 * @desc    Add family medical history
 * @access  Private (Staff, Doctor, Admin, Owner)
 */
router.post('/:patientId/family-history',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor']),
    MedicalHistoryController.getFamilyHistoryValidation(),
    auditLog('family_history', 'create'),
    (req, res) => new MedicalHistoryController().addFamilyHistory(req, res)
);

/**
 * @route   PUT /api/v1/medical-history/allergies/:allergyId/status
 * @desc    Update allergy status
 * @access  Private (Staff, Doctor, Admin, Owner)
 */
router.put('/allergies/:allergyId/status',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor']),
    auditLog('allergy', 'update'),
    (req, res) => new MedicalHistoryController().updateAllergyStatus(req, res)
);

/**
 * @route   PUT /api/v1/medical-history/medications/:medicationId/stop
 * @desc    Stop medication
 * @access  Private (Staff, Doctor, Admin, Owner)
 */
router.put('/medications/:medicationId/stop',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor']),
    auditLog('medication', 'update'),
    (req, res) => new MedicalHistoryController().stopMedication(req, res)
);

module.exports = router;