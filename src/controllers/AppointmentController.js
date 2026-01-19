/**
 * Appointment Controller - Basic Scheduling Operations
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles appointment scheduling, updates, and cancellations
 */

const { body, param, query, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const db = require('../config/database');

class AppointmentController {
    constructor() {
        this.appointmentModel = new Appointment(db);
    }

    /**
     * List appointments in clinic
     * GET /api/v1/appointments
     */
    async listAppointments(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const { 
                page = 1, 
                limit = 20, 
                status = 'all', 
                doctor_id, 
                date_from, 
                date_to 
            } = req.query;

            const appointments = await this.appointmentModel.listByClinic(clinicId, {
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                doctor_id,
                date_from,
                date_to
            });
            
            res.json({
                success: true,
                data: appointments
            });
        } catch (error) {
            console.error('Error listing appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list appointments',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Create new appointment
     * POST /api/v1/appointments
     */
    async createAppointment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const clinicId = req.user.clinic_id;
            const appointmentData = { ...req.body, clinic_id: clinicId };

            // Check for scheduling conflicts
            const hasConflict = await this.appointmentModel.checkTimeConflict(
                clinicId,
                appointmentData.doctor_id,
                appointmentData.appointment_date,
                appointmentData.appointment_time,
                appointmentData.duration || 30
            );

            if (hasConflict) {
                return res.status(409).json({
                    success: false,
                    message: 'Time slot is already booked'
                });
            }

            const appointment = await this.appointmentModel.create(appointmentData);
            
            res.status(201).json({
                success: true,
                message: 'Appointment created successfully',
                data: appointment
            });
        } catch (error) {
            console.error('Error creating appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create appointment',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get calendar view
     * GET /api/v1/appointments/calendar
     */
    async getCalendarView(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const { date, doctor_id } = req.query;

            const appointments = await this.appointmentModel.getCalendarView(clinicId, {
                date,
                doctor_id
            });
            
            res.json({
                success: true,
                data: appointments
            });
        } catch (error) {
            console.error('Error fetching calendar view:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch calendar view',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get today's appointments
     * GET /api/v1/appointments/today
     */
    async getTodayAppointments(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const { doctor_id } = req.query;

            const appointments = await this.appointmentModel.getTodayAppointments(clinicId, {
                doctor_id
            });
            
            res.json({
                success: true,
                data: appointments
            });
        } catch (error) {
            console.error('Error fetching today\'s appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch today\'s appointments',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get appointment details
     * GET /api/v1/appointments/:id
     */
    async getAppointmentDetails(req, res) {
        try {
            const { id } = req.params;
            const appointment = await this.appointmentModel.getById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Multi-tenant check
            if (appointment.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Error fetching appointment details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch appointment details',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update appointment
     * PUT /api/v1/appointments/:id
     */
    async updateAppointment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const appointment = await this.appointmentModel.getById(id);

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Multi-tenant check
            if (appointment.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check for scheduling conflicts if time is being changed
            if (req.body.appointment_date || req.body.appointment_time) {
                const hasConflict = await this.appointmentModel.checkTimeConflict(
                    appointment.clinic_id,
                    req.body.doctor_id || appointment.doctor_id,
                    req.body.appointment_date || appointment.appointment_date,
                    req.body.appointment_time || appointment.appointment_time,
                    req.body.duration || appointment.duration,
                    id // Exclude current appointment from conflict check
                );

                if (hasConflict) {
                    return res.status(409).json({
                        success: false,
                        message: 'Time slot is already booked'
                    });
                }
            }

            const updatedAppointment = await this.appointmentModel.update(id, req.body);
            
            res.json({
                success: true,
                message: 'Appointment updated successfully',
                data: updatedAppointment
            });
        } catch (error) {
            console.error('Error updating appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update appointment',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update appointment status
     * PUT /api/v1/appointments/:id/status
     */
    async updateAppointmentStatus(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const { status, notes } = req.body;

            const appointment = await this.appointmentModel.getById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Multi-tenant check
            if (appointment.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await this.appointmentModel.updateStatus(id, status, notes);
            
            res.json({
                success: true,
                message: `Appointment ${status} successfully`
            });
        } catch (error) {
            console.error('Error updating appointment status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update appointment status',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Cancel appointment
     * DELETE /api/v1/appointments/:id
     */
    async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const appointment = await this.appointmentModel.getById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Multi-tenant check
            if (appointment.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await this.appointmentModel.cancel(id, reason);
            
            res.json({
                success: true,
                message: 'Appointment cancelled successfully'
            });
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel appointment',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Validation rules for appointment creation
     */
    static getCreateValidation() {
        return [
            body('patient_id').isInt().withMessage('Valid patient ID is required'),
            body('doctor_id').isInt().withMessage('Valid doctor ID is required'),
            body('appointment_date').isISO8601().withMessage('Valid appointment date is required'),
            body('appointment_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid appointment time is required (HH:MM format)'),
            body('appointment_type').isIn(['consultation', 'follow_up', 'vaccination', 'check_up']).withMessage('Valid appointment type is required'),
            body('duration').optional().isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
            body('notes').optional().trim()
        ];
    }

    /**
     * Validation rules for appointment update
     */
    static getUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid appointment ID is required'),
            body('patient_id').optional().isInt().withMessage('Valid patient ID is required'),
            body('doctor_id').optional().isInt().withMessage('Valid doctor ID is required'),
            body('appointment_date').optional().isISO8601().withMessage('Valid appointment date is required'),
            body('appointment_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid appointment time is required (HH:MM format)'),
            body('appointment_type').optional().isIn(['consultation', 'follow_up', 'vaccination', 'check_up']).withMessage('Valid appointment type is required'),
            body('duration').optional().isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
            body('notes').optional().trim()
        ];
    }

    /**
     * Validation rules for status update
     */
    static getStatusUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid appointment ID is required'),
            body('status').isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled']).withMessage('Valid status is required'),
            body('notes').optional().trim()
        ];
    }
}

module.exports = AppointmentController;