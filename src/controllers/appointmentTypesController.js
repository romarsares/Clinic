const db = require('../config/database');

const appointmentTypesController = {
    // Get all appointment types for a clinic
    async getAppointmentTypes(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            
            const [appointmentTypes] = await db.execute(
                `SELECT id, name, description, duration_minutes, color, is_active, created_at, updated_at 
                 FROM appointment_types 
                 WHERE clinic_id = ? AND is_active = TRUE 
                 ORDER BY name`,
                [clinicId]
            );

            res.json({
                success: true,
                data: appointmentTypes
            });
        } catch (error) {
            console.error('Error fetching appointment types:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch appointment types'
            });
        }
    },

    // Create new appointment type
    async createAppointmentType(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const { name, description, duration_minutes = 30, color = '#007bff' } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment type name is required'
                });
            }

            const [result] = await db.execute(
                `INSERT INTO appointment_types (clinic_id, name, description, duration_minutes, color) 
                 VALUES (?, ?, ?, ?, ?)`,
                [clinicId, name, description, duration_minutes, color]
            );

            // Log audit using AuditService
            const AuditService = require('../services/AuditService');
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'create',
                entity: 'appointment_type',
                entity_id: result.insertId,
                new_value: { name, description, duration_minutes, color }
            });

            res.status(201).json({
                success: true,
                message: 'Appointment type created successfully',
                data: { id: result.insertId }
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment type name already exists'
                });
            }
            console.error('Error creating appointment type:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create appointment type'
            });
        }
    },

    // Update appointment type
    async updateAppointmentType(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const { id } = req.params;
            const { name, description, duration_minutes, color } = req.body;

            // Get current data for audit
            const [current] = await db.execute(
                'SELECT * FROM appointment_types WHERE id = ? AND clinic_id = ?',
                [id, clinicId]
            );

            if (current.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment type not found'
                });
            }

            const [result] = await db.execute(
                `UPDATE appointment_types 
                 SET name = ?, description = ?, duration_minutes = ?, color = ? 
                 WHERE id = ? AND clinic_id = ?`,
                [name, description, duration_minutes, color, id, clinicId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment type not found'
                });
            }

            // Log audit using AuditService
            const AuditService = require('../services/AuditService');
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'update',
                entity: 'appointment_type',
                entity_id: id,
                old_value: current[0],
                new_value: { name, description, duration_minutes, color }
            });

            res.json({
                success: true,
                message: 'Appointment type updated successfully'
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment type name already exists'
                });
            }
            console.error('Error updating appointment type:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update appointment type'
            });
        }
    },

    // Delete (deactivate) appointment type
    async deleteAppointmentType(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const { id } = req.params;

            // Check if appointment type is in use
            const [appointments] = await db.execute(
                'SELECT COUNT(*) as count FROM appointments WHERE appointment_type_id = ? AND clinic_id = ?',
                [id, clinicId]
            );

            if (appointments[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete appointment type that is in use'
                });
            }

            const [result] = await db.execute(
                'UPDATE appointment_types SET is_active = FALSE WHERE id = ? AND clinic_id = ?',
                [id, clinicId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment type not found'
                });
            }

            // Log audit using AuditService
            const AuditService = require('../services/AuditService');
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'delete',
                entity: 'appointment_type',
                entity_id: id
            });

            res.json({
                success: true,
                message: 'Appointment type deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting appointment type:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete appointment type'
            });
        }
    }
};

module.exports = appointmentTypesController;