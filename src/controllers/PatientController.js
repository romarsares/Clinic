/**
 * Patient Controller - Simplified (Role-based access only)
 */

const { body, param, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const AuditService = require('../services/AuditService');
const db = require('../config/database');
const fs = require('fs');

class PatientController {
    constructor() {
        this.patientModel = new Patient(db);
    }

    async listPatients(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const { page = 1, limit = 20, type = 'all' } = req.query;
            
            const patients = await this.patientModel.listByClinic(clinicId, {
                page: parseInt(page),
                limit: parseInt(limit),
                type
            });
            
            res.json({ success: true, data: patients });
        } catch (error) {
            console.error('Error listing patients:', error);
            res.status(500).json({ success: false, message: 'Failed to list patients' });
        }
    }

    async createPatient(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const patient = await this.patientModel.create({ ...req.body, clinic_id: req.user.clinic_id });
            await AuditService.logCRUD(req, 'create', 'patient', patient.id, null, patient);
            
            res.status(201).json({ success: true, message: 'Patient created successfully', data: patient });
        } catch (error) {
            console.error('Error creating patient:', error);
            res.status(500).json({ success: false, message: 'Failed to create patient' });
        }
    }

    async searchPatients(req, res) {
        try {
            const { q: searchTerm, limit = 10 } = req.query;
            if (!searchTerm) {
                return res.status(400).json({ success: false, message: 'Search term is required' });
            }

            const patients = await this.patientModel.search(req.user.clinic_id, searchTerm, { limit: parseInt(limit) });
            res.json({ success: true, data: patients });
        } catch (error) {
            console.error('Error searching patients:', error);
            res.status(500).json({ success: false, message: 'Failed to search patients' });
        }
    }

    async getPatientDetails(req, res) {
        try {
            const patient = await this.patientModel.getById(req.params.id);
            if (!patient || patient.clinic_id !== req.user.clinic_id) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            await AuditService.logClinicalAccess(req, 'patient_demographics', req.params.id);
            res.json({ success: true, data: patient });
        } catch (error) {
            console.error('Error fetching patient:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch patient details' });
        }
    }

    async updatePatient(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const patient = await this.patientModel.getById(req.params.id);
            if (!patient || patient.clinic_id !== req.user.clinic_id) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            const updated = await this.patientModel.update(req.params.id, req.body, patient.clinic_id);
            await AuditService.logCRUD(req, 'update', 'patient', req.params.id, patient, updated);
            
            res.json({ success: true, message: 'Patient updated successfully', data: updated });
        } catch (error) {
            console.error('Error updating patient:', error);
            res.status(500).json({ success: false, message: 'Failed to update patient' });
        }
    }

    async addChild(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const parent = await this.patientModel.getById(req.params.id);
            if (!parent || parent.clinic_id !== req.user.clinic_id) {
                return res.status(404).json({ success: false, message: 'Parent not found' });
            }

            const child = await this.patientModel.createChild(req.params.id, { ...req.body, clinic_id: req.user.clinic_id });
            res.status(201).json({ success: true, message: 'Child added successfully', data: child });
        } catch (error) {
            console.error('Error adding child:', error);
            res.status(500).json({ success: false, message: 'Failed to add child' });
        }
    }

    async getChildren(req, res) {
        try {
            const patient = await this.patientModel.getById(req.params.id);
            if (!patient || patient.clinic_id !== req.user.clinic_id) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            const children = await this.patientModel.getChildren(req.params.id, patient.clinic_id);
            res.json({ success: true, data: children });
        } catch (error) {
            console.error('Error fetching children:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch children' });
        }
    }

    async getParent(req, res) {
        try {
            const patient = await this.patientModel.getById(req.params.id);
            if (!patient || patient.clinic_id !== req.user.clinic_id) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            const parent = await this.patientModel.getParent(req.params.id, patient.clinic_id);
            res.json({ success: true, data: parent });
        } catch (error) {
            console.error('Error fetching parent:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch parent' });
        }
    }

    async uploadPhoto(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            const patient = await this.patientModel.getById(req.params.id);
            if (!patient || patient.clinic_id !== req.user.clinic_id) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            const photoData = fs.readFileSync(req.file.path);
            await db.execute(
                'UPDATE patients SET photo_data = ?, photo_filename = ?, photo_mimetype = ?, updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [photoData, req.file.originalname, req.file.mimetype, req.params.id, req.user.clinic_id]
            );

            fs.unlinkSync(req.file.path);
            res.json({ success: true, message: 'Photo uploaded successfully' });
        } catch (error) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            console.error('Error uploading photo:', error);
            res.status(500).json({ success: false, message: 'Failed to upload photo' });
        }
    }

    async getPhoto(req, res) {
        try {
            const [rows] = await db.execute(
                'SELECT photo_data, photo_filename, photo_mimetype FROM patients WHERE id = ? AND clinic_id = ?',
                [req.params.id, req.user.clinic_id]
            );

            if (rows.length === 0 || !rows[0].photo_data) {
                return res.status(404).json({ success: false, message: 'Photo not found' });
            }

            res.set({
                'Content-Type': rows[0].photo_mimetype,
                'Content-Disposition': `inline; filename="${rows[0].photo_filename}"`,
                'Content-Length': rows[0].photo_data.length
            });
            res.send(rows[0].photo_data);
        } catch (error) {
            console.error('Error getting photo:', error);
            res.status(500).json({ success: false, message: 'Failed to get photo' });
        }
    }

    async deletePhoto(req, res) {
        try {
            await db.execute(
                'UPDATE patients SET photo_data = NULL, photo_filename = NULL, photo_mimetype = NULL, updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [req.params.id, req.user.clinic_id]
            );
            res.json({ success: true, message: 'Photo deleted successfully' });
        } catch (error) {
            console.error('Error deleting photo:', error);
            res.status(500).json({ success: false, message: 'Failed to delete photo' });
        }
    }

    async deletePatient(req, res) {
        try {
            const patient = await this.patientModel.getById(req.params.id);
            if (!patient || patient.clinic_id !== req.user.clinic_id) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            await db.execute(
                'UPDATE patients SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [req.params.id, req.user.clinic_id]
            );

            await AuditService.logCRUD(req, 'delete', 'patient', req.params.id, patient, null);
            res.json({ success: true, message: 'Patient deleted successfully' });
        } catch (error) {
            console.error('Error deleting patient:', error);
            res.status(500).json({ success: false, message: 'Failed to delete patient' });
        }
    }

    static getCreateValidation() {
        return [
            body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
            body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
            body('birth_date').isISO8601().withMessage('Valid birth date is required'),
            body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
            body('contact_number').optional().trim(),
            body('email').optional().isEmail().withMessage('Valid email is required'),
            body('notes').optional().trim()
        ];
    }

    static getUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid patient ID is required'),
            body('first_name').optional().trim().isLength({ min: 1 }),
            body('last_name').optional().trim().isLength({ min: 1 }),
            body('contact_number').optional().trim(),
            body('email').optional().isEmail()
        ];
    }

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
