/**
 * Clinical Workflow Controller
 * Enhanced visit documentation with auto-save and clinical decision support
 */

const db = require('../config/database');
const { checkUserPermission } = require('../middleware/permissions');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class ClinicalWorkflowController {
    // ICD-10 diagnosis codes for quick lookup
    static COMMON_DIAGNOSES = [
        { code: 'J06.9', name: 'Upper respiratory infection, unspecified', category: 'respiratory' },
        { code: 'H66.9', name: 'Otitis media, unspecified', category: 'ear' },
        { code: 'K59.1', name: 'Diarrhea, unspecified', category: 'gastrointestinal' },
        { code: 'J21.9', name: 'Acute bronchiolitis, unspecified', category: 'respiratory' },
        { code: 'J18.9', name: 'Pneumonia, unspecified organism', category: 'respiratory' },
        { code: 'J45.9', name: 'Asthma, unspecified', category: 'respiratory' },
        { code: 'J30.9', name: 'Allergic rhinitis, unspecified', category: 'respiratory' },
        { code: 'L20.9', name: 'Atopic dermatitis, unspecified', category: 'dermatological' },
        { code: 'H10.9', name: 'Conjunctivitis, unspecified', category: 'eye' },
        { code: 'R50.9', name: 'Fever, unspecified', category: 'general' }
    ];

    // Visit templates for quick documentation
    static VISIT_TEMPLATES = {
        routine_checkup: {
            name: 'Routine Well-Child Visit',
            chief_complaint: 'Routine well-child examination',
            hpi_template: 'Patient presents for routine well-child visit. No acute concerns reported by parent/guardian.',
            examination_template: {
                general: 'Well-appearing, alert, and cooperative child',
                heent: 'Normocephalic, atraumatic. PERRLA. TMs clear bilaterally. Throat non-erythematous.',
                cardiovascular: 'Regular rate and rhythm, no murmurs, rubs, or gallops',
                respiratory: 'Clear to auscultation bilaterally, no wheezing or rales',
                abdomen: 'Soft, non-tender, no organomegaly',
                extremities: 'No clubbing, cyanosis, or edema',
                neurological: 'Alert and oriented, appropriate for age'
            }
        },
        sick_visit: {
            name: 'Acute Illness Visit',
            chief_complaint: 'Acute illness',
            hpi_template: 'Patient presents with acute symptoms as described.',
            examination_template: {
                general: 'Appears mildly ill but alert and responsive'
            }
        },
        follow_up: {
            name: 'Follow-up Visit',
            chief_complaint: 'Follow-up visit',
            hpi_template: 'Patient returns for follow-up of previously diagnosed condition.',
            examination_template: {
                general: 'Appears well, no acute distress'
            }
        }
    };

    // Get diagnosis suggestions with autocomplete
    static async getDiagnosisSuggestions(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'clinical.visit.create');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'clinical.visit.create'
                });
            }

            const { query } = req.query;
            
            if (!query || query.length < 2) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            // Filter common diagnoses
            const suggestions = this.COMMON_DIAGNOSES.filter(diagnosis =>
                diagnosis.name.toLowerCase().includes(query.toLowerCase()) ||
                diagnosis.code.toLowerCase().includes(query.toLowerCase())
            );

            // Get recent diagnoses from database
            const [recentDiagnoses] = await db.execute(`
                SELECT DISTINCT diagnosis as name, COUNT(*) as frequency
                FROM visits 
                WHERE clinic_id = ? AND diagnosis LIKE ? 
                AND visit_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY diagnosis
                ORDER BY frequency DESC
                LIMIT 10
            `, [req.user.clinic_id, `%${query}%`]);

            // Combine and deduplicate
            const combined = [...suggestions];
            recentDiagnoses.forEach(recent => {
                if (!combined.some(c => c.name.toLowerCase() === recent.name.toLowerCase())) {
                    combined.push({
                        code: 'RECENT',
                        name: recent.name,
                        category: 'recent',
                        frequency: recent.frequency
                    });
                }
            });

            res.json({
                success: true,
                data: combined.slice(0, 15) // Limit to 15 suggestions
            });
        } catch (error) {
            console.error('Error fetching diagnosis suggestions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch diagnosis suggestions'
            });
        }
    }

    // Get visit templates
    static async getVisitTemplates(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'clinical.visit.create');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'clinical.visit.create'
                });
            }

            res.json({
                success: true,
                data: this.VISIT_TEMPLATES
            });
        } catch (error) {
            console.error('Error fetching visit templates:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch visit templates'
            });
        }
    }

    // Auto-save visit draft
    static async autoSaveVisitDraft(req, res) {
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
                visit_id: Joi.number().optional(),
                patient_id: Joi.number().required(),
                chief_complaint: Joi.string().optional(),
                history_present_illness: Joi.string().optional(),
                vital_signs: Joi.object().optional(),
                physical_examination: Joi.object().optional(),
                diagnoses: Joi.array().optional(),
                treatment_plan: Joi.string().optional(),
                medications: Joi.string().optional(),
                follow_up_instructions: Joi.string().optional()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
            }

            // Save as draft in visit_drafts table
            const draftData = {
                ...value,
                doctor_id: req.user.id,
                clinic_id: req.user.clinic_id,
                draft_data: JSON.stringify(value),
                last_saved: new Date()
            };

            const [result] = await db.execute(`
                INSERT INTO visit_drafts (
                    patient_id, doctor_id, clinic_id, draft_data, last_saved, created_at, updated_at
                ) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    draft_data = VALUES(draft_data),
                    last_saved = NOW(),
                    updated_at = NOW()
            `, [value.patient_id, req.user.id, req.user.clinic_id, JSON.stringify(value)]);

            res.json({
                success: true,
                message: 'Draft auto-saved successfully',
                data: {
                    draft_id: result.insertId || result.affectedRows,
                    last_saved: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error auto-saving visit draft:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to auto-save visit draft'
            });
        }
    }

    // Get visit draft
    static async getVisitDraft(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'clinical.visit.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'clinical.visit.view'
                });
            }

            const { patientId } = req.params;

            const [drafts] = await db.execute(`
                SELECT draft_data, last_saved
                FROM visit_drafts
                WHERE patient_id = ? AND doctor_id = ? AND clinic_id = ?
                ORDER BY last_saved DESC
                LIMIT 1
            `, [patientId, req.user.id, req.user.clinic_id]);

            if (drafts.length === 0) {
                return res.json({
                    success: true,
                    data: null
                });
            }

            const draft = drafts[0];
            res.json({
                success: true,
                data: {
                    ...JSON.parse(draft.draft_data),
                    last_saved: draft.last_saved
                }
            });
        } catch (error) {
            console.error('Error fetching visit draft:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch visit draft'
            });
        }
    }

    // Get clinical decision support alerts
    static async getClinicalAlerts(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'clinical.visit.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'clinical.visit.view'
                });
            }

            const { patientId } = req.params;

            // Get patient allergies
            const [allergies] = await db.execute(`
                SELECT allergy_name, severity
                FROM patient_allergies
                WHERE patient_id = ? AND clinic_id = ?
            `, [patientId, req.user.clinic_id]);

            // Get recent medications
            const [medications] = await db.execute(`
                SELECT medication_name, dosage
                FROM visit_medications vm
                INNER JOIN visits v ON vm.visit_id = v.id
                WHERE v.patient_id = ? AND v.clinic_id = ?
                AND v.visit_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `, [patientId, req.user.clinic_id]);

            // Get recent vital signs for trends
            const [recentVitals] = await db.execute(`
                SELECT temperature, heart_rate, blood_pressure, visit_date
                FROM visits
                WHERE patient_id = ? AND clinic_id = ?
                AND visit_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                ORDER BY visit_date DESC
                LIMIT 5
            `, [patientId, req.user.clinic_id]);

            const alerts = [];

            // Generate allergy alerts
            if (allergies.length > 0) {
                alerts.push({
                    type: 'allergy',
                    severity: 'high',
                    message: `Patient has ${allergies.length} known allergies`,
                    details: allergies.map(a => `${a.allergy_name} (${a.severity})`).join(', ')
                });
            }

            // Generate medication interaction alerts (simplified)
            if (medications.length > 2) {
                alerts.push({
                    type: 'medication',
                    severity: 'medium',
                    message: 'Multiple recent medications - check for interactions',
                    details: medications.map(m => m.medication_name).join(', ')
                });
            }

            // Generate vital signs trend alerts
            if (recentVitals.length >= 2) {
                const latest = recentVitals[0];
                const previous = recentVitals[1];
                
                if (latest.temperature && previous.temperature) {
                    const tempDiff = parseFloat(latest.temperature) - parseFloat(previous.temperature);
                    if (tempDiff > 2) {
                        alerts.push({
                            type: 'vital_trend',
                            severity: 'medium',
                            message: 'Significant temperature increase from last visit',
                            details: `${previous.temperature}°F → ${latest.temperature}°F`
                        });
                    }
                }
            }

            res.json({
                success: true,
                data: {
                    alerts,
                    patient_allergies: allergies,
                    recent_medications: medications,
                    vital_trends: recentVitals
                }
            });
        } catch (error) {
            console.error('Error fetching clinical alerts:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch clinical alerts'
            });
        }
    }

    // Get patient medical history summary
    static async getPatientHistorySummary(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            const { patientId } = req.params;

            // Get recent visits
            const [recentVisits] = await db.execute(`
                SELECT visit_date, chief_complaint, diagnosis, doctor_name
                FROM visits v
                LEFT JOIN auth_users u ON v.doctor_id = u.id
                WHERE v.patient_id = ? AND v.clinic_id = ?
                ORDER BY v.visit_date DESC
                LIMIT 10
            `, [patientId, req.user.clinic_id]);

            // Get chronic conditions
            const [chronicConditions] = await db.execute(`
                SELECT DISTINCT diagnosis, COUNT(*) as frequency
                FROM visits
                WHERE patient_id = ? AND clinic_id = ?
                AND visit_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY diagnosis
                HAVING frequency > 1
                ORDER BY frequency DESC
            `, [patientId, req.user.clinic_id]);

            // Get recent lab results
            const [labResults] = await db.execute(`
                SELECT lr.test_name, lr.result_value, lr.normal_range, lr.result_date
                FROM lab_results lr
                INNER JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
                WHERE lreq.patient_id = ? AND lreq.clinic_id = ?
                ORDER BY lr.result_date DESC
                LIMIT 5
            `, [patientId, req.user.clinic_id]);

            // Log access to medical history
            await AuditService.logClinicalAccess(req, 'medical_history_summary', patientId);

            res.json({
                success: true,
                data: {
                    recent_visits: recentVisits,
                    chronic_conditions: chronicConditions,
                    recent_lab_results: labResults
                }
            });
        } catch (error) {
            console.error('Error fetching patient history summary:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch patient history summary'
            });
        }
    }

    // Complete visit with validation
    static async completeVisit(req, res) {
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
                chief_complaint: Joi.string().required(),
                history_present_illness: Joi.string().required(),
                vital_signs: Joi.object().optional(),
                physical_examination: Joi.object().optional(),
                diagnosis: Joi.string().required(),
                treatment_plan: Joi.string().optional(),
                medications: Joi.string().optional(),
                follow_up_instructions: Joi.string().optional(),
                visit_duration: Joi.number().optional(),
                billing_code: Joi.string().optional()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
            }

            // Create completed visit record
            const [result] = await db.execute(`
                INSERT INTO visits (
                    patient_id, doctor_id, clinic_id, visit_date, chief_complaint,
                    history_present_illness, physical_examination, diagnosis,
                    treatment_plan, medications, follow_up_instructions,
                    visit_duration, billing_code, status, created_at, updated_at
                ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW(), NOW())
            `, [
                value.patient_id, req.user.id, req.user.clinic_id,
                value.chief_complaint, value.history_present_illness,
                JSON.stringify(value.physical_examination), value.diagnosis,
                value.treatment_plan, value.medications, value.follow_up_instructions,
                value.visit_duration, value.billing_code
            ]);

            // Store vital signs if provided
            if (value.vital_signs) {
                await db.execute(`
                    UPDATE visits SET 
                        temperature = ?, heart_rate = ?, blood_pressure = ?,
                        respiratory_rate = ?, weight = ?, height = ?
                    WHERE id = ?
                `, [
                    value.vital_signs.temperature, value.vital_signs.heartRate,
                    value.vital_signs.bloodPressure, value.vital_signs.respiratoryRate,
                    value.vital_signs.weight, value.vital_signs.height, result.insertId
                ]);
            }

            // Remove draft if exists
            await db.execute(`
                DELETE FROM visit_drafts 
                WHERE patient_id = ? AND doctor_id = ? AND clinic_id = ?
            `, [value.patient_id, req.user.id, req.user.clinic_id]);

            // Log visit completion
            await AuditService.logAction({
                clinic_id: req.user.clinic_id,
                user_id: req.user.id,
                action: 'visit_completed',
                entity: 'visit',
                entity_id: result.insertId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: {
                    patient_id: value.patient_id,
                    diagnosis: value.diagnosis,
                    visit_duration: value.visit_duration
                }
            });

            res.status(201).json({
                success: true,
                message: 'Visit completed successfully',
                data: {
                    visit_id: result.insertId,
                    status: 'completed'
                }
            });
        } catch (error) {
            console.error('Error completing visit:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to complete visit'
            });
        }
    }
}

module.exports = ClinicalWorkflowController;