/**
 * Vaccine Schedule Controller
 * Immunization tracking and compliance monitoring
 */

const db = require('../config/database');
const { checkUserPermission } = require('../middleware/permissions');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class VaccineScheduleController {
    // Standard vaccine schedule (CDC recommended)
    static VACCINE_SCHEDULE = {
        'Hepatitis B': [
            { dose: 1, age_months: 0, window_start: 0, window_end: 1 },
            { dose: 2, age_months: 2, window_start: 1, window_end: 4 },
            { dose: 3, age_months: 6, window_start: 6, window_end: 18 }
        ],
        'DTaP': [
            { dose: 1, age_months: 2, window_start: 2, window_end: 4 },
            { dose: 2, age_months: 4, window_start: 4, window_end: 6 },
            { dose: 3, age_months: 6, window_start: 6, window_end: 8 },
            { dose: 4, age_months: 18, window_start: 15, window_end: 20 }
        ],
        'Polio (IPV)': [
            { dose: 1, age_months: 2, window_start: 2, window_end: 4 },
            { dose: 2, age_months: 4, window_start: 4, window_end: 6 },
            { dose: 3, age_months: 18, window_start: 6, window_end: 20 }
        ],
        'MMR': [
            { dose: 1, age_months: 12, window_start: 12, window_end: 15 },
            { dose: 2, age_months: 48, window_start: 48, window_end: 72 }
        ],
        'Varicella': [
            { dose: 1, age_months: 12, window_start: 12, window_end: 15 },
            { dose: 2, age_months: 48, window_start: 48, window_end: 72 }
        ]
    };

    // Get patient vaccine compliance status
    // Required Permission: patient.view
    static async getPatientVaccineStatus(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            const patientId = req.params.patientId;

            // Get patient info
            const [patients] = await db.execute(`
                SELECT id, first_name, last_name, date_of_birth, gender
                FROM patients 
                WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL
            `, [patientId, req.user.clinic_id]);

            if (patients.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Patient not found'
                });
            }

            const patient = patients[0];
            const ageMonths = this.calculateAgeInMonths(patient.date_of_birth);

            // Get vaccine records
            const [vaccineRecords] = await db.execute(`
                SELECT vr.*, u.full_name as administered_by_name
                FROM vaccine_records vr
                LEFT JOIN auth_users u ON vr.administered_by = u.id
                WHERE vr.patient_id = ? AND vr.clinic_id = ?
                ORDER BY vr.vaccine_name, vr.due_date
            `, [patientId, req.user.clinic_id]);

            // Generate compliance status
            const complianceStatus = this.generateComplianceStatus(ageMonths, vaccineRecords);

            // Log access
            await AuditService.logClinicalAccess(req, 'vaccine_status_access', patientId);

            res.json({
                success: true,
                data: {
                    patient,
                    age_months: ageMonths,
                    vaccine_records: vaccineRecords,
                    compliance_status: complianceStatus
                }
            });
        } catch (error) {
            console.error('Error fetching vaccine status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch vaccine status'
            });
        }
    }

    // Record vaccine administration
    // Required Permission: clinical.visit.create
    static async recordVaccineAdministration(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'clinical.visit.create');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'clinical.visit.create'
                });
            }

            const schema = Joi.object({
                patient_id: Joi.number().required(),
                vaccine_name: Joi.string().required(),
                vaccine_code: Joi.string().optional(),
                date_given: Joi.date().required(),
                batch_number: Joi.string().optional(),
                manufacturer: Joi.string().optional(),
                notes: Joi.string().optional(),
                visit_id: Joi.number().optional()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
            }

            // Insert vaccine record
            const [result] = await db.execute(`
                INSERT INTO vaccine_records (
                    patient_id, vaccine_name, vaccine_code, date_given,
                    status, batch_number, manufacturer, administered_by,
                    notes, clinic_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'given', ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                value.patient_id, value.vaccine_name, value.vaccine_code,
                value.date_given, value.batch_number, value.manufacturer,
                req.user.id, value.notes, req.user.clinic_id
            ]);

            // Log vaccine administration
            await AuditService.logAction({
                clinic_id: req.user.clinic_id,
                user_id: req.user.id,
                action: 'vaccine_administration',
                entity: 'vaccine_record',
                entity_id: result.insertId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: {
                    patient_id: value.patient_id,
                    vaccine_name: value.vaccine_name,
                    date_given: value.date_given
                }
            });

            res.status(201).json({
                success: true,
                message: 'Vaccine administration recorded successfully',
                data: { id: result.insertId }
            });
        } catch (error) {
            console.error('Error recording vaccine administration:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to record vaccine administration'
            });
        }
    }

    // Get overdue vaccinations
    static async getOverdueVaccinations(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            // Get patients with overdue vaccines
            const [overdueData] = await db.execute(`
                SELECT 
                    p.id, p.first_name, p.last_name, p.date_of_birth,
                    vr.vaccine_name, vr.due_date,
                    DATEDIFF(NOW(), vr.due_date) as days_overdue
                FROM patients p
                INNER JOIN vaccine_records vr ON p.id = vr.patient_id
                WHERE p.clinic_id = ? AND vr.status = 'scheduled' 
                AND vr.due_date < NOW()
                ORDER BY days_overdue DESC, p.last_name
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: overdueData
            });
        } catch (error) {
            console.error('Error fetching overdue vaccinations:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch overdue vaccinations'
            });
        }
    }

    // Get vaccination coverage statistics
    static async getVaccinationCoverage(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'reports.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'reports.view'
                });
            }

            // Get coverage statistics by vaccine
            const [coverageData] = await db.execute(`
                SELECT 
                    vr.vaccine_name,
                    COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN vr.patient_id END) as vaccinated_patients,
                    COUNT(DISTINCT p.id) as eligible_patients,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN vr.patient_id END) / 
                         COUNT(DISTINCT p.id)) * 100, 1
                    ) as coverage_percentage
                FROM patients p
                LEFT JOIN vaccine_records vr ON p.id = vr.patient_id AND vr.clinic_id = p.clinic_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
                GROUP BY vr.vaccine_name
                ORDER BY coverage_percentage DESC
            `, [req.user.clinic_id]);

            // Get overall statistics
            const [overallStats] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT p.id) as total_pediatric_patients,
                    COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN vr.patient_id END) as patients_with_vaccines,
                    COUNT(CASE WHEN vr.status = 'given' THEN 1 END) as total_vaccines_given,
                    COUNT(CASE WHEN vr.status = 'scheduled' AND vr.due_date < NOW() THEN 1 END) as overdue_vaccines
                FROM patients p
                LEFT JOIN vaccine_records vr ON p.id = vr.patient_id AND vr.clinic_id = p.clinic_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: {
                    coverage_by_vaccine: coverageData,
                    overall_statistics: overallStats[0]
                }
            });
        } catch (error) {
            console.error('Error fetching vaccination coverage:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch vaccination coverage'
            });
        }
    }

    // Generate catch-up schedule
    static async generateCatchUpSchedule(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'clinical.visit.create');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'clinical.visit.create'
                });
            }

            const patientId = req.params.patientId;

            // Get patient info
            const [patients] = await db.execute(`
                SELECT date_of_birth FROM patients 
                WHERE id = ? AND clinic_id = ?
            `, [patientId, req.user.clinic_id]);

            if (patients.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Patient not found'
                });
            }

            const ageMonths = this.calculateAgeInMonths(patients[0].date_of_birth);
            
            // Get existing vaccines
            const [existingVaccines] = await db.execute(`
                SELECT vaccine_name, date_given FROM vaccine_records
                WHERE patient_id = ? AND clinic_id = ? AND status = 'given'
            `, [patientId, req.user.clinic_id]);

            // Generate catch-up schedule
            const catchUpSchedule = this.generateCatchUpSchedule(ageMonths, existingVaccines);

            res.json({
                success: true,
                data: {
                    patient_age_months: ageMonths,
                    catch_up_schedule: catchUpSchedule
                }
            });
        } catch (error) {
            console.error('Error generating catch-up schedule:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate catch-up schedule'
            });
        }
    }

    // Helper methods
    static calculateAgeInMonths(birthDate) {
        const birth = new Date(birthDate);
        const now = new Date();
        return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    }

    static generateComplianceStatus(ageMonths, vaccineRecords) {
        const compliance = {
            up_to_date: true,
            overdue_vaccines: [],
            upcoming_vaccines: [],
            completed_vaccines: []
        };

        Object.keys(this.VACCINE_SCHEDULE).forEach(vaccineName => {
            const schedule = this.VACCINE_SCHEDULE[vaccineName];
            const patientVaccines = vaccineRecords.filter(v => v.vaccine_name === vaccineName && v.status === 'given');

            schedule.forEach(dose => {
                if (dose.age_months <= ageMonths) {
                    // Should have received this dose
                    const hasReceived = patientVaccines.some(v => 
                        new Date(v.date_given) >= this.addMonthsToDate(new Date(), dose.window_start - ageMonths)
                    );

                    if (hasReceived) {
                        compliance.completed_vaccines.push({
                            vaccine: vaccineName,
                            dose: dose.dose,
                            expected_age: dose.age_months
                        });
                    } else {
                        compliance.up_to_date = false;
                        compliance.overdue_vaccines.push({
                            vaccine: vaccineName,
                            dose: dose.dose,
                            expected_age: dose.age_months,
                            months_overdue: ageMonths - dose.window_end
                        });
                    }
                } else if (dose.age_months <= ageMonths + 3) {
                    // Upcoming in next 3 months
                    compliance.upcoming_vaccines.push({
                        vaccine: vaccineName,
                        dose: dose.dose,
                        due_age: dose.age_months
                    });
                }
            });
        });

        return compliance;
    }

    static generateCatchUpSchedule(ageMonths, existingVaccines) {
        const catchUp = [];
        const givenVaccines = existingVaccines.map(v => v.vaccine_name);

        Object.keys(this.VACCINE_SCHEDULE).forEach(vaccineName => {
            const schedule = this.VACCINE_SCHEDULE[vaccineName];
            const receivedDoses = existingVaccines.filter(v => v.vaccine_name === vaccineName).length;

            schedule.forEach(dose => {
                if (dose.dose > receivedDoses && dose.age_months <= ageMonths) {
                    catchUp.push({
                        vaccine: vaccineName,
                        dose: dose.dose,
                        priority: ageMonths - dose.window_end > 0 ? 'high' : 'medium',
                        recommended_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
                    });
                }
            });
        });

        return catchUp.sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0));
    }

    static addMonthsToDate(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
}

module.exports = VaccineScheduleController;