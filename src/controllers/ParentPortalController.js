/**
 * Parent Portal Controller
 * Handles parent-specific functionality and limited medical data access
 */

const db = require('../config/database');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class ParentPortalController {
    // Get parent profile
    static async getProfile(req, res) {
        try {
            // Only parents can access this endpoint
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const [users] = await db.execute(
                'SELECT id, email, first_name, last_name, full_name FROM auth_users WHERE id = ? AND clinic_id = ?',
                [req.user.id, req.user.clinic_id]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent profile not found'
                });
            }

            res.json({
                success: true,
                data: users[0]
            });
        } catch (error) {
            console.error('Error fetching parent profile:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch parent profile'
            });
        }
    }

    // Get parent's children
    static async getChildren(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const [children] = await db.execute(`
                SELECT p.id, p.first_name, p.last_name, p.date_of_birth, p.gender,
                       p.emergency_contact_name, p.emergency_contact_number,
                       (SELECT COUNT(*) FROM appointments a 
                        WHERE a.patient_id = p.id AND a.appointment_date >= CURDATE() 
                        AND a.status = 'scheduled') as has_upcoming_appointment
                FROM patients p
                INNER JOIN patient_parents pp ON p.id = pp.child_id
                WHERE pp.parent_user_id = ? AND p.clinic_id = ? AND p.deleted_at IS NULL
                ORDER BY p.first_name, p.last_name
            `, [req.user.id, req.user.clinic_id]);

            res.json({
                success: true,
                data: children.map(child => ({
                    ...child,
                    next_appointment: child.has_upcoming_appointment > 0
                }))
            });
        } catch (error) {
            console.error('Error fetching children:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch children'
            });
        }
    }

    // Get child details (limited view for parents)
    static async getChildDetails(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const childId = req.params.childId;

            // Verify parent-child relationship
            const [relationship] = await db.execute(
                'SELECT 1 FROM patient_parents WHERE parent_user_id = ? AND child_id = ?',
                [req.user.id, childId]
            );

            if (relationship.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Not your child'
                });
            }

            const [children] = await db.execute(`
                SELECT id, first_name, last_name, date_of_birth, gender,
                       emergency_contact_name, emergency_contact_number
                FROM patients 
                WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL
            `, [childId, req.user.clinic_id]);

            if (children.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Child not found'
                });
            }

            // Log access to child's data
            await AuditService.logClinicalAccess(req, 'parent_child_access', childId);

            res.json({
                success: true,
                data: children[0]
            });
        } catch (error) {
            console.error('Error fetching child details:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch child details'
            });
        }
    }

    // Get upcoming appointments for parent's children
    static async getUpcomingAppointments(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const [appointments] = await db.execute(`
                SELECT a.id, a.appointment_date, a.appointment_time, a.status,
                       p.first_name as child_first_name, p.last_name as child_last_name,
                       CONCAT(p.first_name, ' ', p.last_name) as child_name,
                       u.full_name as doctor_name
                FROM appointments a
                INNER JOIN patients p ON a.patient_id = p.id
                INNER JOIN patient_parents pp ON p.id = pp.child_id
                LEFT JOIN auth_users u ON a.doctor_id = u.id
                WHERE pp.parent_user_id = ? AND a.clinic_id = ? 
                AND a.appointment_date >= CURDATE()
                AND a.status IN ('scheduled', 'confirmed')
                ORDER BY a.appointment_date, a.appointment_time
                LIMIT 10
            `, [req.user.id, req.user.clinic_id]);

            res.json({
                success: true,
                data: appointments
            });
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch upcoming appointments'
            });
        }
    }

    // Get recent visits for parent's children (limited information)
    static async getRecentVisits(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const [visits] = await db.execute(`
                SELECT v.id, v.visit_date, v.chief_complaint,
                       p.first_name as child_first_name, p.last_name as child_last_name,
                       CONCAT(p.first_name, ' ', p.last_name) as child_name,
                       u.full_name as doctor_name
                FROM visits v
                INNER JOIN patients p ON v.patient_id = p.id
                INNER JOIN patient_parents pp ON p.id = pp.child_id
                LEFT JOIN auth_users u ON v.doctor_id = u.id
                WHERE pp.parent_user_id = ? AND v.clinic_id = ?
                ORDER BY v.visit_date DESC
                LIMIT 10
            `, [req.user.id, req.user.clinic_id]);

            // Log access to children's visit history
            await AuditService.logClinicalAccess(req, 'parent_visit_history', null);

            res.json({
                success: true,
                data: visits
            });
        } catch (error) {
            console.error('Error fetching recent visits:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch recent visits'
            });
        }
    }

    // Get child's medical history (limited view)
    static async getChildMedicalHistory(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const childId = req.params.childId;

            // Verify parent-child relationship
            const [relationship] = await db.execute(
                'SELECT 1 FROM patient_parents WHERE parent_user_id = ? AND child_id = ?',
                [req.user.id, childId]
            );

            if (relationship.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Not your child'
                });
            }

            const [history] = await db.execute(`
                SELECT v.visit_date, v.chief_complaint, 
                       v.diagnosis, v.notes,
                       u.full_name as doctor_name
                FROM visits v
                LEFT JOIN auth_users u ON v.doctor_id = u.id
                WHERE v.patient_id = ? AND v.clinic_id = ?
                ORDER BY v.visit_date DESC
                LIMIT 20
            `, [childId, req.user.clinic_id]);

            // Log access to child's medical history
            await AuditService.logClinicalAccess(req, 'parent_medical_history', childId);

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            console.error('Error fetching child medical history:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch child medical history'
            });
        }
    }

    // Get vaccine reminders for parent's children
    static async getVaccineReminders(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            // Mock vaccine reminders - would integrate with actual vaccine tracking system
            const [children] = await db.execute(`
                SELECT p.id, p.first_name, p.last_name, p.date_of_birth
                FROM patients p
                INNER JOIN patient_parents pp ON p.id = pp.child_id
                WHERE pp.parent_user_id = ? AND p.clinic_id = ? AND p.deleted_at IS NULL
            `, [req.user.id, req.user.clinic_id]);

            const reminders = [];
            
            // Generate sample vaccine reminders based on age
            children.forEach(child => {
                const ageInMonths = this.calculateAgeInMonths(child.date_of_birth);
                const childName = `${child.first_name} ${child.last_name}`;
                
                // Sample vaccine schedule logic
                if (ageInMonths >= 12 && ageInMonths < 15) {
                    reminders.push({
                        child_id: child.id,
                        child_name: childName,
                        vaccine_name: 'MMR (Measles, Mumps, Rubella)',
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                        is_overdue: false
                    });
                }
                
                if (ageInMonths >= 18 && ageInMonths < 24) {
                    reminders.push({
                        child_id: child.id,
                        child_name: childName,
                        vaccine_name: 'Hepatitis A',
                        due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago (overdue)
                        is_overdue: true
                    });
                }
            });

            res.json({
                success: true,
                data: reminders
            });
        } catch (error) {
            console.error('Error fetching vaccine reminders:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch vaccine reminders'
            });
        }
    }

    // Request appointment for child
    static async requestAppointment(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const schema = Joi.object({
                child_id: Joi.number().required(),
                preferred_date: Joi.date().min('now').required(),
                preferred_time: Joi.string().required(),
                reason: Joi.string().required()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
            }

            // Verify parent-child relationship
            const [relationship] = await db.execute(
                'SELECT 1 FROM patient_parents WHERE parent_user_id = ? AND child_id = ?',
                [req.user.id, value.child_id]
            );

            if (relationship.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Not your child'
                });
            }

            // Create appointment request (status: 'requested')
            const [result] = await db.execute(`
                INSERT INTO appointments (
                    clinic_id, patient_id, appointment_date, appointment_time,
                    status, notes, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'requested', ?, ?, NOW(), NOW())
            `, [
                req.user.clinic_id,
                value.child_id,
                value.preferred_date,
                value.preferred_time,
                `Parent request: ${value.reason}`,
                req.user.id
            ]);

            // Log appointment request
            await AuditService.logAction({
                clinic_id: req.user.clinic_id,
                user_id: req.user.id,
                action: 'parent_appointment_request',
                entity: 'appointment',
                entity_id: result.insertId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: {
                    child_id: value.child_id,
                    preferred_date: value.preferred_date,
                    reason: value.reason
                }
            });

            res.status(201).json({
                success: true,
                message: 'Appointment request submitted successfully',
                data: {
                    appointment_id: result.insertId,
                    status: 'requested'
                }
            });
        } catch (error) {
            console.error('Error requesting appointment:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to submit appointment request'
            });
        }
    }

    // Get child's vaccine records
    static async getChildVaccines(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const childId = req.params.childId;

            // Verify parent-child relationship
            const [relationship] = await db.execute(
                'SELECT 1 FROM patient_parents WHERE parent_user_id = ? AND child_id = ?',
                [req.user.id, childId]
            );

            if (relationship.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Not your child'
                });
            }

            // Mock vaccine records - would integrate with actual vaccine tracking
            const mockVaccines = [
                {
                    vaccine_name: 'Hepatitis B',
                    date_given: '2023-01-15',
                    status: 'completed',
                    next_due_date: null
                },
                {
                    vaccine_name: 'DTaP (Diphtheria, Tetanus, Pertussis)',
                    date_given: '2023-03-15',
                    status: 'completed',
                    next_due_date: '2024-03-15'
                },
                {
                    vaccine_name: 'MMR (Measles, Mumps, Rubella)',
                    date_given: null,
                    status: 'due',
                    next_due_date: new Date().toISOString().split('T')[0]
                }
            ];

            res.json({
                success: true,
                data: mockVaccines
            });
        } catch (error) {
            console.error('Error fetching child vaccines:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch child vaccines'
            });
        }
    }

    // Get child's growth chart data
    static async getChildGrowth(req, res) {
        try {
            if (!req.user.roles.includes('Parent')) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Parent role required'
                });
            }

            const childId = req.params.childId;

            // Verify parent-child relationship
            const [relationship] = await db.execute(
                'SELECT 1 FROM patient_parents WHERE parent_user_id = ? AND child_id = ?',
                [req.user.id, childId]
            );

            if (relationship.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - Not your child'
                });
            }

            // Get growth measurements from visits
            const [growthData] = await db.execute(`
                SELECT v.visit_date as measurement_date,
                       v.height, v.weight,
                       TIMESTAMPDIFF(MONTH, p.date_of_birth, v.visit_date) as age_months
                FROM visits v
                INNER JOIN patients p ON v.patient_id = p.id
                WHERE v.patient_id = ? AND v.clinic_id = ?
                AND (v.height IS NOT NULL OR v.weight IS NOT NULL)
                ORDER BY v.visit_date
            `, [childId, req.user.clinic_id]);

            res.json({
                success: true,
                data: growthData
            });
        } catch (error) {
            console.error('Error fetching child growth data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch child growth data'
            });
        }
    }

    // Helper method to calculate age in months
    static calculateAgeInMonths(birthDate) {
        const birth = new Date(birthDate);
        const now = new Date();
        return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    }
}

module.exports = ParentPortalController;