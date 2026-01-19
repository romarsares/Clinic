/**
 * Medical History Controller - Patient Medical Records Management
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles patient medical history, allergies, medications, and family history
 */

const { body, param, validationResult } = require('express-validator');
const MedicalHistory = require('../models/MedicalHistory');
const AuditService = require('../services/AuditService');
const db = require('../config/database');

class MedicalHistoryController {
    constructor() {
        this.medicalHistoryModel = new MedicalHistory(db);
    }

    /**
     * Get complete medical history for patient
     * GET /api/v1/medical-history/:patientId
     */
    async getCompleteMedicalHistory(req, res) {
        try {
            const { patientId } = req.params;
            const clinicId = req.user.clinic_id;

            const medicalHistory = await this.medicalHistoryModel.getCompleteMedicalHistory(patientId, clinicId);
            
            // Log clinical data access
            await AuditService.logClinicalAccess(req, 'medical_history', patientId);

            res.json({
                success: true,
                data: medicalHistory
            });
        } catch (error) {
            console.error('Error fetching medical history:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch medical history',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Add allergy record
     * POST /api/v1/medical-history/:patientId/allergies
     */
    async addAllergy(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { patientId } = req.params;
            const clinicId = req.user.clinic_id;
            const recordedBy = req.user.id;

            const allergy = await this.medicalHistoryModel.addAllergy(patientId, clinicId, req.body, recordedBy);
            
            // Log the action
            await AuditService.logCRUD(req, 'create', 'allergy', allergy.id, null, allergy);

            res.status(201).json({
                success: true,
                message: 'Allergy record added successfully',
                data: allergy
            });
        } catch (error) {
            console.error('Error adding allergy:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add allergy record',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Add current medication
     * POST /api/v1/medical-history/:patientId/medications
     */
    async addCurrentMedication(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { patientId } = req.params;
            const clinicId = req.user.clinic_id;
            const recordedBy = req.user.id;

            const medication = await this.medicalHistoryModel.addCurrentMedication(patientId, clinicId, req.body, recordedBy);
            
            // Log the action
            await AuditService.logCRUD(req, 'create', 'medication', medication.id, null, medication);

            res.status(201).json({
                success: true,
                message: 'Medication added successfully',
                data: medication
            });
        } catch (error) {
            console.error('Error adding medication:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add medication',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Add past medical history
     * POST /api/v1/medical-history/:patientId/past-history
     */
    async addPastMedicalHistory(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { patientId } = req.params;
            const clinicId = req.user.clinic_id;
            const recordedBy = req.user.id;

            const history = await this.medicalHistoryModel.addPastMedicalHistory(patientId, clinicId, req.body, recordedBy);
            
            // Log the action
            await AuditService.logCRUD(req, 'create', 'past_medical_history', history.id, null, history);

            res.status(201).json({
                success: true,
                message: 'Past medical history added successfully',
                data: history
            });
        } catch (error) {
            console.error('Error adding past medical history:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add past medical history',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Add family medical history
     * POST /api/v1/medical-history/:patientId/family-history
     */
    async addFamilyHistory(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { patientId } = req.params;
            const clinicId = req.user.clinic_id;
            const recordedBy = req.user.id;

            const familyHistory = await this.medicalHistoryModel.addFamilyHistory(patientId, clinicId, req.body, recordedBy);
            
            // Log the action
            await AuditService.logCRUD(req, 'create', 'family_history', familyHistory.id, null, familyHistory);

            res.status(201).json({
                success: true,
                message: 'Family history added successfully',
                data: familyHistory
            });
        } catch (error) {
            console.error('Error adding family history:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add family history',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update allergy status
     * PUT /api/v1/medical-history/allergies/:allergyId/status
     */
    async updateAllergyStatus(req, res) {
        try {
            const { allergyId } = req.params;
            const { status } = req.body;
            const clinicId = req.user.clinic_id;

            if (!['active', 'inactive', 'resolved'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be active, inactive, or resolved'
                });
            }

            await this.medicalHistoryModel.updateAllergyStatus(allergyId, clinicId, status);
            
            // Log the action
            await AuditService.logCRUD(req, 'update', 'allergy', allergyId, null, { status });

            res.json({
                success: true,
                message: 'Allergy status updated successfully'
            });
        } catch (error) {
            console.error('Error updating allergy status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update allergy status',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Stop medication
     * PUT /api/v1/medical-history/medications/:medicationId/stop
     */
    async stopMedication(req, res) {
        try {
            const { medicationId } = req.params;
            const { end_date } = req.body;
            const clinicId = req.user.clinic_id;

            const endDate = end_date ? new Date(end_date) : new Date();
            await this.medicalHistoryModel.stopMedication(medicationId, clinicId, endDate);
            
            // Log the action
            await AuditService.logCRUD(req, 'update', 'medication', medicationId, null, { status: 'discontinued', end_date: endDate });

            res.json({
                success: true,
                message: 'Medication stopped successfully'
            });
        } catch (error) {
            console.error('Error stopping medication:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to stop medication',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Validation rules for allergy
     */
    static getAllergyValidation() {
        return [
            param('patientId').isInt().withMessage('Valid patient ID is required'),
            body('allergen').trim().isLength({ min: 1 }).withMessage('Allergen is required'),
            body('reaction').trim().isLength({ min: 1 }).withMessage('Reaction is required'),
            body('severity').isIn(['mild', 'moderate', 'severe']).withMessage('Severity must be mild, moderate, or severe'),
            body('notes').optional().trim()
        ];
    }

    /**
     * Validation rules for medication
     */
    static getMedicationValidation() {
        return [
            param('patientId').isInt().withMessage('Valid patient ID is required'),
            body('medication_name').trim().isLength({ min: 1 }).withMessage('Medication name is required'),
            body('dosage').trim().isLength({ min: 1 }).withMessage('Dosage is required'),
            body('frequency').trim().isLength({ min: 1 }).withMessage('Frequency is required'),
            body('route').optional().isIn(['oral', 'topical', 'injection', 'inhalation', 'other']).withMessage('Invalid route'),
            body('start_date').isISO8601().withMessage('Valid start date is required'),
            body('end_date').optional().isISO8601().withMessage('Valid end date required'),
            body('prescribing_doctor').optional().isInt().withMessage('Valid doctor ID required'),
            body('notes').optional().trim()
        ];
    }

    /**
     * Validation rules for past medical history
     */
    static getPastHistoryValidation() {
        return [
            param('patientId').isInt().withMessage('Valid patient ID is required'),
            body('condition').trim().isLength({ min: 1 }).withMessage('Condition is required'),
            body('diagnosis_date').isISO8601().withMessage('Valid diagnosis date is required'),
            body('treatment').optional().trim(),
            body('outcome').optional().trim(),
            body('notes').optional().trim()
        ];
    }

    /**
     * Validation rules for family history
     */
    static getFamilyHistoryValidation() {
        return [
            param('patientId').isInt().withMessage('Valid patient ID is required'),
            body('relationship').isIn(['mother', 'father', 'sibling', 'grandparent', 'aunt', 'uncle', 'cousin', 'other']).withMessage('Valid relationship is required'),
            body('condition').trim().isLength({ min: 1 }).withMessage('Condition is required'),
            body('age_at_diagnosis').optional().isInt({ min: 0, max: 120 }).withMessage('Valid age required'),
            body('notes').optional().trim()
        ];
    }
}

module.exports = MedicalHistoryController;