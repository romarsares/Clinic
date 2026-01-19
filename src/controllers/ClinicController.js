/**
 * Clinic Controller - Tenant Management API
 * 
 * Author: Antigravity
 * Created: 2026-01-19
 * Purpose: Handles API endpoints for clinic profile and settings management
 */

const { body, param, validationResult } = require('express-validator');
const Clinic = require('../models/Clinic');
const db = require('../config/database');

class ClinicController {
    constructor() {
        this.clinicModel = new Clinic(db);
    }

    /**
     * Get clinic details
     * GET /api/v1/clinics/:id
     */
    async getClinicDetails(req, res) {
        try {
            const { id } = req.params;

            // Multi-tenant check: User can only access their own clinic unless they are a Super Admin
            if (req.user.clinic_id !== parseInt(id) && !req.user.roles.includes('SuperAdmin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only access your own clinic details.'
                });
            }

            const clinic = await this.clinicModel.getById(id);
            if (!clinic) {
                return res.status(404).json({
                    success: false,
                    message: 'Clinic not found'
                });
            }

            res.json({
                success: true,
                data: clinic
            });
        } catch (error) {
            console.error('Error fetching clinic details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch clinic details',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update clinic info
     * PUT /api/v1/clinics/:id
     */
    async updateClinicInfo(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;

            // Authorization: Only Owner or SuperAdmin can update clinic info
            if (req.user.clinic_id !== parseInt(id) && !req.user.roles.includes('SuperAdmin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied.'
                });
            }

            if (!req.user.roles.includes('Owner') && !req.user.roles.includes('SuperAdmin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Only clinic owners can update clinic information.'
                });
            }

            const updatedClinic = await this.clinicModel.update(id, req.body);
            res.json({
                success: true,
                message: 'Clinic updated successfully',
                data: updatedClinic
            });
        } catch (error) {
            console.error('Error updating clinic:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update clinic',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get clinic settings
     * GET /api/v1/clinics/:id/settings
     */
    async getSettings(req, res) {
        try {
            const { id } = req.params;

            if (req.user.clinic_id !== parseInt(id) && !req.user.roles.includes('SuperAdmin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied.'
                });
            }

            const settings = await this.clinicModel.getSettings(id);
            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Error fetching clinic settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch clinic settings',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update a specific clinic setting
     * POST /api/v1/clinics/:id/settings
     */
    async updateSetting(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const { key, value } = req.body;

            if (req.user.clinic_id !== parseInt(id) && !req.user.roles.includes('SuperAdmin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied.'
                });
            }

            // Only Owner or Admin can update settings
            if (!['Owner', 'Admin', 'SuperAdmin'].some(role => req.user.roles.includes(role))) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions to update settings.'
                });
            }

            const result = await this.clinicModel.updateSetting(id, key, value);
            res.json({
                success: true,
                message: 'Setting updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error updating clinic setting:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update clinic setting',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * List all clinics (SuperAdmin only)
     * GET /api/v1/clinics
     */
    async listClinics(req, res) {
        try {
            if (!req.user.roles.includes('SuperAdmin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin only.'
                });
            }

            const clinics = await this.clinicModel.list();
            res.json({
                success: true,
                data: clinics
            });
        } catch (error) {
            console.error('Error listing clinics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list clinics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Validation rules for clinic update
     */
    static getUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid clinic ID is required'),
            body('name').notEmpty().trim().withMessage('Clinic name is required'),
            body('email').isEmail().withMessage('Valid email is required'),
            body('contact_number').optional().trim(),
            body('address').optional().trim(),
            body('timezone').optional().trim()
        ];
    }

    /**
     * Validation rules for setting update
     */
    static getSettingValidation() {
        return [
            param('id').isInt().withMessage('Valid clinic ID is required'),
            body('key').notEmpty().trim().withMessage('Setting key is required'),
            body('value').notEmpty().withMessage('Setting value is required')
        ];
    }
}

module.exports = ClinicController;
