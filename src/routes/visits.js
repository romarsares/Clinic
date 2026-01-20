/**
 * Visit Routes - Clinical Documentation API Endpoints
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Defines API routes for clinical documentation and visit management
 * 
 * This file contains routes for:
 * - Visit creation and retrieval
 * - Chief complaint documentation
 * - Diagnosis entry (Doctor only)
 * - Vital signs recording
 * - Treatment plans (Doctor only)
 * - Clinical assessments
 * - Follow-up instructions
 */

const express = require('express');
const VisitController = require('../controllers/VisitController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

const router = express.Router();
const visitController = new VisitController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /visits
 * @desc    Create a new visit record
 * @access  Private (Doctor, Staff)
 */
router.post('/',
  requireRole(['Doctor', 'Staff', 'Super User']),
  VisitController.getCreateVisitValidation(),
  auditLog('visit', 'create'),
  (req, res) => visitController.createVisit(req, res)
);

/**
 * @route   GET /visits/:id
 * @desc    Get visit details with clinical summary
 * @access  Private (Doctor, Staff)
 */
router.get('/:id',
  requireRole(['Doctor', 'Staff', 'Super User']),
  auditLog('visit', 'view'),
  (req, res) => visitController.getVisit(req, res)
);

/**
 * @route   PUT /visits/:id/chief-complaint
 * @desc    Add or update chief complaint
 * @access  Private (Doctor, Staff)
 */
router.put('/:id/chief-complaint',
  requireRole(['Doctor', 'Staff', 'Super User']),
  VisitController.getChiefComplaintValidation(),
  auditLog('chief_complaint', 'create'),
  (req, res) => visitController.addChiefComplaint(req, res)
);

/**
 * @route   POST /visits/:id/diagnoses
 * @desc    Add diagnosis to visit (Doctor only)
 * @access  Private (Doctor only)
 */
router.post('/:id/diagnoses',
  requireRole(['Doctor', 'Super User']),
  VisitController.getDiagnosisValidation(),
  auditLog('diagnosis', 'create'),
  (req, res) => visitController.addDiagnosis(req, res)
);

/**
 * @route   PUT /visits/:id/vital-signs
 * @desc    Record vital signs
 * @access  Private (Doctor, Staff)
 */
router.put('/:id/vital-signs',
  requireRole(['Doctor', 'Staff', 'Super User']),
  VisitController.getVitalSignsValidation(),
  auditLog('vital_signs', 'create'),
  (req, res) => visitController.recordVitalSigns(req, res)
);

/**
 * @route   PUT /visits/:id/clinical-assessment
 * @desc    Add clinical assessment (Doctor only)
 * @access  Private (Doctor only)
 */
router.put('/:id/clinical-assessment',
  requireRole(['Doctor', 'Super User']),
  VisitController.getClinicalAssessmentValidation(),
  auditLog('clinical_assessment', 'create'),
  (req, res) => visitController.addClinicalAssessment(req, res)
);

/**
 * @route   PUT /visits/:id/treatment-plan
 * @desc    Add treatment plan (Doctor only)
 * @access  Private (Doctor only)
 */
router.put('/:id/treatment-plan',
  requireRole(['Doctor', 'Super User']),
  VisitController.getTreatmentPlanValidation(),
  auditLog('treatment_plan', 'create'),
  (req, res) => visitController.addTreatmentPlan(req, res)
);

/**
 * @route   PUT /visits/:id/follow-up-instructions
 * @desc    Add follow-up instructions
 * @access  Private (Doctor, Staff)
 */
router.put('/:id/follow-up-instructions',
  requireRole(['Doctor', 'Staff', 'Super User']),
  VisitController.getFollowUpValidation(),
  auditLog('follow_up_instructions', 'create'),
  (req, res) => visitController.addFollowUpInstructions(req, res)
);

/**
 * @route   PUT /visits/:id/close
 * @desc    Close visit (mark as complete)
 * @access  Private (Doctor only)
 */
router.put('/:id/close',
  requireRole(['Doctor', 'Super User']),
  auditLog('visit', 'close'),
  (req, res) => visitController.closeVisit(req, res)
);

module.exports = router;