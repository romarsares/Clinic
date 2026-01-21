/**
 * Patient Controller - Demographics and Parent-Child Relationships
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles patient demographics and parent-child relationships
 * Updated: Added granular permission validation
 */

const { body, param, query, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const AuditService = require('../services/AuditService');
const { checkUserPermission } = require('../middleware/permissions');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

class PatientController {
    constructor() {
        this.patientModel = new Patient(db);
    }

    /**
     * List patients in clinic
     * GET /api/v1/patients
     * Required Permission: patient.view
     */
    async listPatients(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            const clinicId = req.user.clinic_id;
            const { page = 1, limit = 20, type = 'all' } = req.query;
            
            const patients = await this.patientModel.listByClinic(clinicId, {
                page: parseInt(page),
                limit: parseInt(limit),
                type
            });
            
            res.json({
                success: true,
                data: patients
            });
        } catch (error) {
            console.error('Error listing patients:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list patients',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Create new patient
     * POST /api/v1/patients
     * Required Permission: patient.add
     */
    async createPatient(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.add');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.add'
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const clinicId = req.user.clinic_id;
            const patientData = { ...req.body, clinic_id: clinicId };

            const patient = await this.patientModel.create(patientData);
            
            // Log patient creation
            await AuditService.logCRUD(req, 'create', 'patient', patient.id, null, patient);
            
            res.status(201).json({
                success: true,
                message: 'Patient created successfully',
                data: patient
            });
        } catch (error) {
            console.error('Error creating patient:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create patient',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Search patients
     * GET /api/v1/patients/search
     * Required Permission: patient.view
     */
    async searchPatients(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            const clinicId = req.user.clinic_id;
            const { q: searchTerm, limit = 10 } = req.query;

            if (!searchTerm) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term is required'
                });
            }

            const patients = await this.patientModel.search(clinicId, searchTerm, {
                limit: parseInt(limit)
            });
            
            res.json({
                success: true,
                data: patients
            });
        } catch (error) {
            console.error('Error searching patients:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search patients',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get patient details
     * GET /api/v1/patients/:id
     * Required Permission: patient.view
     */
    async getPatientDetails(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            const { id } = req.params;
            const patient = await this.patientModel.getById(id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Multi-tenant check
            if (patient.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Parent access check - parents can only view their own children
            if (req.user.roles.includes('Parent')) {
                const isParent = await this.patientModel.isParentOf(req.user.id, id);
                if (!isParent) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied'
                    });
                }
            }

            // Log clinical data access
            await AuditService.logClinicalAccess(req, 'patient_demographics', id);

            res.json({
                success: true,
                data: patient
            });
        } catch (error) {
            console.error('Error fetching patient details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch patient details',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update patient information
     * PUT /api/v1/patients/:id
     * Required Permission: patient.edit
     */
    async updatePatient(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.edit');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.edit'
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const patient = await this.patientModel.getById(id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Multi-tenant check
            if (patient.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Prevent DOB changes (immutable)
            if (req.body.date_of_birth && req.body.date_of_birth !== patient.date_of_birth) {
                return res.status(400).json({
                    success: false,
                    message: 'Date of birth cannot be changed once set'
                });
            }

            const updatedPatient = await this.patientModel.update(id, req.body, patient.clinic_id);
            
            // Log patient update
            await AuditService.logCRUD(req, 'update', 'patient', id, patient, updatedPatient);
            
            res.json({
                success: true,
                message: 'Patient updated successfully',
                data: updatedPatient
            });
        } catch (error) {
            console.error('Error updating patient:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update patient',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Add child to parent
     * POST /api/v1/patients/:id/children
     * Required Permission: patient.add
     */
    async addChild(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.add');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.add'
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id: parentId } = req.params;
            const clinicId = req.user.clinic_id;

            // Verify parent exists and belongs to clinic
            const parent = await this.patientModel.getById(parentId);
            if (!parent || parent.clinic_id !== clinicId) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent not found'
                });
            }

            // Create child patient
            const childData = { 
                ...req.body, 
                clinic_id: clinicId,
                patient_type: 'child'
            };
            
            const child = await this.patientModel.createChild(parentId, childData);
            
            res.status(201).json({
                success: true,
                message: 'Child added successfully',
                data: child
            });
        } catch (error) {
            console.error('Error adding child:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add child',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get patient's children
     * GET /api/v1/patients/:id/children
     */
    async getChildren(req, res) {
        try {
            const { id } = req.params;
            const patient = await this.patientModel.getById(id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Multi-tenant check
            if (patient.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Parent access check
            if (req.user.roles.includes('Parent')) {
                const isParent = await this.patientModel.isParentOf(req.user.id, id);
                if (!isParent) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied'
                    });
                }
            }

            const children = await this.patientModel.getChildren(id, patient.clinic_id);
            
            res.json({
                success: true,
                data: children
            });
        } catch (error) {
            console.error('Error fetching children:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch children',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get patient's parent
     * GET /api/v1/patients/:id/parent
     */
    async getParent(req, res) {
        try {
            const { id } = req.params;
            const patient = await this.patientModel.getById(id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Multi-tenant check
            if (patient.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const parent = await this.patientModel.getParent(id, patient.clinic_id);
            
            res.json({
                success: true,
                data: parent
            });
        } catch (error) {
            console.error('Error fetching parent:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch parent',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Upload patient photo
     * Required Permission: patient.edit
     */
    async uploadPhoto(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.edit');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.edit'
                });
            }

            const { id } = req.params;
            const clinicId = req.user.clinic_id;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            // Verify patient exists
            const patient = await this.patientModel.getById(id);
            if (!patient || patient.clinic_id !== clinicId) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Read file data
            const photoData = fs.readFileSync(req.file.path);
            const photoFilename = req.file.originalname;
            const photoMimetype = req.file.mimetype;

            // Store in database as BLOB
            await db.execute(
                'UPDATE patients SET photo_data = ?, photo_filename = ?, photo_mimetype = ?, updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [photoData, photoFilename, photoMimetype, id, clinicId]
            );

            // Clean up temporary file
            fs.unlinkSync(req.file.path);

            // Log photo upload
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'patient_photo_upload',
                entity: 'patient',
                entity_id: id,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: { photo_filename: photoFilename, photo_size: photoData.length }
            });

            res.json({
                success: true,
                message: 'Photo uploaded successfully',
                data: { 
                    photo_filename: photoFilename,
                    photo_size: photoData.length
                }
            });

        } catch (error) {
            // Clean up temporary file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            console.error('Error uploading photo:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload photo',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get patient photo
     */
    async getPhoto(req, res) {
        try {
            const { id } = req.params;
            const clinicId = req.user.clinic_id;

            const [rows] = await db.execute(
                'SELECT photo_data, photo_filename, photo_mimetype FROM patients WHERE id = ? AND clinic_id = ?',
                [id, clinicId]
            );

            if (rows.length === 0 || !rows[0].photo_data) {
                return res.status(404).json({
                    success: false,
                    message: 'Photo not found'
                });
            }

            const { photo_data, photo_filename, photo_mimetype } = rows[0];

            res.set({
                'Content-Type': photo_mimetype,
                'Content-Disposition': `inline; filename="${photo_filename}"`,
                'Content-Length': photo_data.length
            });

            res.send(photo_data);

        } catch (error) {
            console.error('Error getting photo:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get photo',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Delete patient photo
     * Required Permission: patient.edit
     */
    async deletePhoto(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.edit');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.edit'
                });
            }

            const { id } = req.params;
            const clinicId = req.user.clinic_id;

            // Check if photo exists
            const [rows] = await db.execute(
                'SELECT photo_filename FROM patients WHERE id = ? AND clinic_id = ?',
                [id, clinicId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            if (!rows[0].photo_filename) {
                return res.status(400).json({
                    success: false,
                    message: 'No photo to delete'
                });
            }

            // Remove photo from database
            await db.execute(
                'UPDATE patients SET photo_data = NULL, photo_filename = NULL, photo_mimetype = NULL, updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [id, clinicId]
            );

            // Log photo deletion
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'patient_photo_delete',
                entity: 'patient',
                entity_id: id,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                old_value: { photo_filename: rows[0].photo_filename }
            });

            res.json({
                success: true,
                message: 'Photo deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting photo:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete photo',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Delete patient (soft delete)
     * DELETE /api/v1/patients/:id
     * Required Permission: patient.delete
     */
    async deletePatient(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.delete');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.delete'
                });
            }

            const { id } = req.params;
            const clinicId = req.user.clinic_id;

            // Verify patient exists
            const patient = await this.patientModel.getById(id);
            if (!patient || patient.clinic_id !== clinicId) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Soft delete patient
            await db.execute(
                'UPDATE patients SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [id, clinicId]
            );

            // Log patient deletion
            await AuditService.logCRUD(req, 'delete', 'patient', id, patient, null);

            res.json({
                success: true,
                message: 'Patient deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting patient:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete patient',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Validation rules for patient creation
     */
    static getCreateValidation() {
        return [
            body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
            body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
            body('date_of_birth').isISO8601().withMessage('Valid date of birth is required'),
            body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
            body('patient_type').isIn(['adult', 'child']).withMessage('Valid patient type is required'),
            body('contact_number').optional().trim(),
            body('email').optional().isEmail().withMessage('Valid email is required'),
            body('address').optional().trim(),
            body('emergency_contact_name').optional().trim(),
            body('emergency_contact_number').optional().trim()
        ];
    }

    /**
     * Validation rules for patient update
     */
    static getUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid patient ID is required'),
            body('first_name').optional().trim().isLength({ min: 1 }).withMessage('First name must not be empty'),
            body('last_name').optional().trim().isLength({ min: 1 }).withMessage('Last name must not be empty'),
            body('contact_number').optional().trim(),
            body('email').optional().isEmail().withMessage('Valid email is required'),
            body('address').optional().trim(),
            body('emergency_contact_name').optional().trim(),
            body('emergency_contact_number').optional().trim()
        ];
    }

    /**
     * Validation rules for adding child
     */
    static getChildValidation() {
        return [
            param('id').isInt().withMessage('Valid parent ID is required'),
            body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
            body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
            body('date_of_birth').isISO8601().withMessage('Valid date of birth is required'),
            body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required')
        ];
    }
}

module.exports = PatientController;