/**
 * Visit Controller - Clinical Documentation API
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles API endpoints for clinical documentation and visit management
 * 
 * This controller manages:
 * - Visit creation and retrieval
 * - Chief complaint documentation
 * - Diagnosis entry (Doctor only)
 * - Vital signs recording
 * - Treatment plans (Doctor only)
 * - Clinical assessments
 * - Follow-up instructions
 */

const { body, param, validationResult } = require('express-validator');
const Visit = require('../models/Visit');
const Billing = require('../models/Billing');
const db = require('../config/database');

class VisitController {
  constructor() {
    this.visitModel = new Visit(db);
  }

  /**
   * Create a new visit
   * POST /visits
   */
  async createVisit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // amazonq-ignore-next-line
      const { appointment_id, patient_id, doctor_id } = req.body;
      const clinic_id = req.user.clinic_id;

      const visitData = {
        clinic_id,
        appointment_id,
        patient_id,
        doctor_id,
        visit_date: new Date()
      };

      const visit = await this.visitModel.create(visitData);

      res.status(201).json({
        success: true,
        message: 'Visit created successfully',
        data: visit
      });

    } catch (error) {
      console.error('Error creating visit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create visit',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get visit details with clinical summary
   * GET /visits/:id
   */
  async getVisit(req, res) {
    try {
      const { id } = req.params;
      const clinic_id = req.user.clinic_id;

      const visit = await this.visitModel.getClinicalSummary(id, clinic_id);

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: 'Visit not found'
        });
      }

      res.json({
        success: true,
        data: visit
      });

    } catch (error) {
      console.error('Error fetching visit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch visit',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Add chief complaint to visit
   * PUT /visits/:id/chief-complaint
   */
  async addChiefComplaint(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { complaint } = req.body;
      const clinic_id = req.user.clinic_id;
      const user_id = req.user.id;

      await this.visitModel.addChiefComplaint(id, clinic_id, complaint, user_id);

      res.json({
        success: true,
        message: 'Chief complaint added successfully'
      });

    } catch (error) {
      console.error('Error adding chief complaint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add chief complaint',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Add diagnosis to visit (Doctor only)
   * POST /visits/:id/diagnoses
   */
  async addDiagnosis(req, res) {
    try {
      // Check if user is a doctor
      if (!req.user.roles.includes('Doctor')) {
        return res.status(403).json({
          success: false,
          message: 'Only doctors can add diagnoses'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const diagnosisData = req.body;
      const clinic_id = req.user.clinic_id;
      const doctor_id = req.user.id;

      const diagnosis = await this.visitModel.addDiagnosis(id, clinic_id, diagnosisData, doctor_id);

      res.status(201).json({
        success: true,
        message: 'Diagnosis added successfully',
        data: diagnosis
      });

    } catch (error) {
      console.error('Error adding diagnosis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add diagnosis',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Record vital signs
   * PUT /visits/:id/vital-signs
   */
  async recordVitalSigns(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const vitalsData = req.body;
      const clinic_id = req.user.clinic_id;
      const user_id = req.user.id;

      const result = await this.visitModel.recordVitalSigns(id, clinic_id, vitalsData, user_id);

      res.json({
        success: true,
        message: 'Vital signs recorded successfully',
        data: result
      });

    } catch (error) {
      console.error('Error recording vital signs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record vital signs',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Add clinical assessment (Doctor only)
   * PUT /visits/:id/clinical-assessment
   */
  async addClinicalAssessment(req, res) {
    try {
      // Check if user is a doctor
      if (!req.user.roles.includes('Doctor')) {
        return res.status(403).json({
          success: false,
          message: 'Only doctors can add clinical assessments'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { assessment } = req.body;
      const clinic_id = req.user.clinic_id;
      const doctor_id = req.user.id;

      await this.visitModel.addClinicalAssessment(id, clinic_id, assessment, doctor_id);

      res.json({
        success: true,
        message: 'Clinical assessment added successfully'
      });

    } catch (error) {
      console.error('Error adding clinical assessment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add clinical assessment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Add treatment plan (Doctor only)
   * PUT /visits/:id/treatment-plan
   */
  async addTreatmentPlan(req, res) {
    try {
      // Check if user is a doctor
      if (!req.user.roles.includes('Doctor')) {
        return res.status(403).json({
          success: false,
          message: 'Only doctors can create treatment plans'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { treatment_plan } = req.body;
      const clinic_id = req.user.clinic_id;
      const doctor_id = req.user.id;

      await this.visitModel.addTreatmentPlan(id, clinic_id, treatment_plan, doctor_id);

      res.json({
        success: true,
        message: 'Treatment plan added successfully'
      });

    } catch (error) {
      console.error('Error adding treatment plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add treatment plan',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Add follow-up instructions
   * PUT /visits/:id/follow-up-instructions
   */
  async addFollowUpInstructions(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { instructions } = req.body;
      const clinic_id = req.user.clinic_id;
      const user_id = req.user.id;

      await this.visitModel.addFollowUpInstructions(id, clinic_id, instructions, user_id);

      res.json({
        success: true,
        message: 'Follow-up instructions added successfully'
      });

    } catch (error) {
      console.error('Error adding follow-up instructions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add follow-up instructions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Close visit
   * PUT /visits/:id/close
   */
  async closeVisit(req, res) {
    try {
      // Check if user is a doctor
      if (!req.user.roles.includes('Doctor')) {
        return res.status(403).json({
          success: false,
          message: 'Only doctors can close visits'
        });
      }

      const { id } = req.params;
      const clinic_id = req.user.clinic_id;
      const doctor_id = req.user.id;

      // Get visit details for billing
      const visit = await this.visitModel.getClinicalSummary(id, clinic_id);
      if (!visit) {
        return res.status(404).json({
          success: false,
          message: 'Visit not found'
        });
      }

      await this.visitModel.closeVisit(id, clinic_id, doctor_id);

      // Auto-create bill for visit
      try {
        const billId = await Billing.createBillForVisit(id, clinic_id, visit.patient_id);
        
        // Add consultation charge (default to pediatric consultation)
        const [consultationType] = await db.execute(
          'SELECT id FROM service_types WHERE clinic_id = ? AND category = "consultation" LIMIT 1',
          [clinic_id]
        );
        
        if (consultationType.length > 0) {
          await Billing.addConsultationCharge(billId, consultationType[0].id, 'Visit Consultation');
        }
      } catch (billingError) {
        console.error('Error creating bill:', billingError);
        // Don't fail visit closure if billing fails
      }

      res.json({
        success: true,
        message: 'Visit closed successfully and bill created'
      });

    } catch (error) {
      console.error('Error closing visit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to close visit',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Validation rules for visit creation
   */
  static getCreateVisitValidation() {
    return [
      body('appointment_id').isInt().withMessage('Valid appointment ID is required'),
      body('patient_id').isInt().withMessage('Valid patient ID is required'),
      body('doctor_id').isInt().withMessage('Valid doctor ID is required')
    ];
  }

  /**
   * Validation rules for chief complaint
   */
  static getChiefComplaintValidation() {
    return [
      param('id').isInt().withMessage('Valid visit ID is required'),
      body('complaint').notEmpty().trim().withMessage('Chief complaint is required')
    ];
  }

  /**
   * Validation rules for diagnosis
   */
  static getDiagnosisValidation() {
    return [
      param('id').isInt().withMessage('Valid visit ID is required'),
      body('diagnosis_name').notEmpty().trim().withMessage('Diagnosis name is required'),
      body('diagnosis_type').optional().isIn(['primary', 'secondary']).withMessage('Invalid diagnosis type'),
      body('diagnosis_code').optional().trim(),
      body('clinical_notes').optional().trim()
    ];
  }

  /**
   * Validation rules for vital signs
   */
  static getVitalSignsValidation() {
    return [
      param('id').isInt().withMessage('Valid visit ID is required'),
      body('temperature').optional().isFloat({ min: 30, max: 50 }).withMessage('Invalid temperature'),
      body('blood_pressure_systolic').optional().isInt({ min: 50, max: 300 }).withMessage('Invalid systolic BP'),
      body('blood_pressure_diastolic').optional().isInt({ min: 30, max: 200 }).withMessage('Invalid diastolic BP'),
      body('heart_rate').optional().isInt({ min: 30, max: 300 }).withMessage('Invalid heart rate'),
      body('respiratory_rate').optional().isInt({ min: 5, max: 100 }).withMessage('Invalid respiratory rate'),
      body('weight').optional().isFloat({ min: 0.5, max: 500 }).withMessage('Invalid weight'),
      body('height').optional().isFloat({ min: 30, max: 300 }).withMessage('Invalid height'),
      body('oxygen_saturation').optional().isInt({ min: 50, max: 100 }).withMessage('Invalid oxygen saturation')
    ];
  }

  /**
   * Validation rules for clinical assessment
   */
  static getClinicalAssessmentValidation() {
    return [
      param('id').isInt().withMessage('Valid visit ID is required'),
      body('assessment').notEmpty().trim().withMessage('Clinical assessment is required')
    ];
  }

  /**
   * Validation rules for treatment plan
   */
  static getTreatmentPlanValidation() {
    return [
      param('id').isInt().withMessage('Valid visit ID is required'),
      body('treatment_plan').notEmpty().trim().withMessage('Treatment plan is required')
    ];
  }

  /**
   * Validation rules for follow-up instructions
   */
  static getFollowUpValidation() {
    return [
      param('id').isInt().withMessage('Valid visit ID is required'),
      body('instructions').notEmpty().trim().withMessage('Follow-up instructions are required')
    ];
  }
}

module.exports = VisitController;