/**
 * Patient Management Routes - Demographics and Parent-Child Relationships
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles patient demographics and parent-child relationships
 */

const express = require('express');
const PatientController = require('../controllers/PatientController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLog, logClinicalAccess } = require('../middleware/audit');
const { uploadPhoto } = require('../middleware/upload');

const router = express.Router();
const patientController = new PatientController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/v1/patients
 * @desc    List patients in clinic
 * @access  Private (All clinic staff)
 */
router.get('/',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Lab Technician', 'Super User']),
    auditLog('patient', 'list'),
    (req, res) => patientController.listPatients(req, res)
);

/**
 * @route   POST /api/v1/patients
 * @desc    Create new patient
 * @access  Private (Staff, Admin, Owner)
 */
router.post('/',
    requireRole(['Owner', 'Admin', 'Staff', 'Super User']),
    PatientController.getCreateValidation(),
    auditLog('patient', 'create'),
    (req, res) => patientController.createPatient(req, res)
);

/**
 * @route   GET /api/v1/patients/search
 * @desc    Search patients
 * @access  Private (All clinic staff)
 */
router.get('/search',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Lab Technician', 'Super User']),
    auditLog('patient', 'search'),
    (req, res) => patientController.searchPatients(req, res)
);

/**
 * @route   GET /api/v1/patients/:id
 * @desc    Get patient details
 * @access  Private (All clinic staff, or Parent for own children)
 */
router.get('/:id',
    logClinicalAccess('patient_demographics'),
    auditLog('patient', 'view'),
    (req, res) => patientController.getPatientDetails(req, res)
);

/**
 * @route   PUT /api/v1/patients/:id
 * @desc    Update patient information
 * @access  Private (Staff, Admin, Owner)
 */
router.put('/:id',
    requireRole(['Owner', 'Admin', 'Staff', 'Super User']),
    PatientController.getUpdateValidation(),
    auditLog('patient', 'update'),
    (req, res) => patientController.updatePatient(req, res)
);

/**
 * @route   POST /api/v1/patients/:id/children
 * @desc    Add child to parent
 * @access  Private (Staff, Admin, Owner)
 */
router.post('/:id/children',
    requireRole(['Owner', 'Admin', 'Staff', 'Super User']),
    PatientController.getChildValidation(),
    auditLog('patient_relationship', 'create'),
    (req, res) => patientController.addChild(req, res)
);

/**
 * @route   GET /api/v1/patients/:id/children
 * @desc    Get patient's children
 * @access  Private (All clinic staff, or Parent for own children)
 */
router.get('/:id/children',
    logClinicalAccess('patient_relationships'),
    auditLog('patient_relationship', 'view'),
    (req, res) => patientController.getChildren(req, res)
);

/**
 * @route   GET /api/v1/patients/:id/parent
 * @desc    Get patient's parent
 * @access  Private (All clinic staff)
 */
router.get('/:id/parent',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Lab Technician', 'Super User']),
    logClinicalAccess('patient_relationships'),
    auditLog('patient_relationship', 'view'),
    (req, res) => patientController.getParent(req, res)
);

/**
 * @route   POST /api/v1/patients/:id/photo
 * @desc    Upload patient photo
 * @access  Private (Staff, Admin, Owner)
 */
router.post('/:id/photo',
    requireRole(['Owner', 'Admin', 'Staff', 'Super User']),
    uploadPhoto.single('photo'),
    auditLog('patient', 'photo_upload'),
    (req, res) => patientController.uploadPhoto(req, res)
);

/**
 * @route   DELETE /api/v1/patients/:id/photo
 * @desc    Delete patient photo
 * @access  Private (Staff, Admin, Owner)
 */
router.delete('/:id/photo',
    requireRole(['Owner', 'Admin', 'Staff', 'Super User']),
    auditLog('patient', 'photo_delete'),
    (req, res) => patientController.deletePhoto(req, res)
);

/**
 * @route   GET /api/v1/patients/:id/photo
 * @desc    Get patient photo
 * @access  Private (All clinic staff)
 */
router.get('/:id/photo',
    requireRole(['Owner', 'Admin', 'Staff', 'Doctor', 'Lab Technician', 'Super User']),
    (req, res) => patientController.getPhoto(req, res)
);

module.exports = router;