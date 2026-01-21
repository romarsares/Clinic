/**
 * Developmental Milestones Controller
 * Age-appropriate milestone tracking for pediatric patients
 */

const db = require('../config/database');
const { checkUserPermission } = require('../middleware/permissions');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class DevelopmentalMilestonesController {
    // Standard developmental milestones by age (months)
    static MILESTONE_DATA = {
        2: [
            { category: 'motor', milestone: 'Lifts head when on tummy', type: 'gross_motor' },
            { category: 'social', milestone: 'Begins to smile at people', type: 'social_emotional' },
            { category: 'communication', milestone: 'Makes gurgling sounds', type: 'language' }
        ],
        4: [
            { category: 'motor', milestone: 'Holds head steady', type: 'gross_motor' },
            { category: 'motor', milestone: 'Brings hands to mouth', type: 'fine_motor' },
            { category: 'social', milestone: 'Smiles spontaneously', type: 'social_emotional' },
            { category: 'communication', milestone: 'Babbles with expression', type: 'language' }
        ],
        6: [
            { category: 'motor', milestone: 'Rolls over in both directions', type: 'gross_motor' },
            { category: 'motor', milestone: 'Sits without support', type: 'gross_motor' },
            { category: 'cognitive', milestone: 'Looks around at things nearby', type: 'cognitive' },
            { category: 'communication', milestone: 'Responds to sounds by making sounds', type: 'language' }
        ],
        9: [
            { category: 'motor', milestone: 'Stands while holding on', type: 'gross_motor' },
            { category: 'motor', milestone: 'Picks up things with thumb and finger', type: 'fine_motor' },
            { category: 'cognitive', milestone: 'Looks for things when dropped', type: 'cognitive' },
            { category: 'communication', milestone: 'Understands "no"', type: 'language' }
        ],
        12: [
            { category: 'motor', milestone: 'Walks holding on to furniture', type: 'gross_motor' },
            { category: 'motor', milestone: 'Drinks from a cup', type: 'fine_motor' },
            { category: 'social', milestone: 'Plays games such as peek-a-boo', type: 'social_emotional' },
            { category: 'communication', milestone: 'Says "mama" and "dada"', type: 'language' }
        ],
        18: [
            { category: 'motor', milestone: 'Walks alone', type: 'gross_motor' },
            { category: 'motor', milestone: 'Scribbles on own', type: 'fine_motor' },
            { category: 'cognitive', milestone: 'Knows what ordinary things are for', type: 'cognitive' },
            { category: 'communication', milestone: 'Says several single words', type: 'language' }
        ],
        24: [
            { category: 'motor', milestone: 'Kicks a ball', type: 'gross_motor' },
            { category: 'motor', milestone: 'Builds tower of 4 or more blocks', type: 'fine_motor' },
            { category: 'social', milestone: 'Shows defiant behavior', type: 'social_emotional' },
            { category: 'communication', milestone: 'Points to things when named', type: 'language' }
        ],
        36: [
            { category: 'motor', milestone: 'Climbs well', type: 'gross_motor' },
            { category: 'motor', milestone: 'Turns book pages one at a time', type: 'fine_motor' },
            { category: 'cognitive', milestone: 'Plays make-believe', type: 'cognitive' },
            { category: 'communication', milestone: 'Follows 2-step instructions', type: 'language' }
        ]
    };

    // Get patient milestones with achievement status
    // Required Permission: patient.view
    static async getPatientMilestones(req, res) {
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

            // Get milestone achievements
            const [achievements] = await db.execute(`
                SELECT ma.*, dm.milestone_text, dm.category, dm.type, dm.expected_age_months
                FROM milestone_achievements ma
                INNER JOIN developmental_milestones dm ON ma.milestone_id = dm.id
                WHERE ma.patient_id = ? AND ma.clinic_id = ?
                ORDER BY dm.expected_age_months, dm.category
            `, [patientId, req.user.clinic_id]);

            // Get expected milestones for current age
            const expectedMilestones = this.getExpectedMilestones(ageMonths);
            
            // Combine with achievements
            const milestonesWithStatus = expectedMilestones.map(milestone => {
                const achievement = achievements.find(a => 
                    a.milestone_text === milestone.milestone && 
                    a.expected_age_months === milestone.age_months
                );
                
                return {
                    ...milestone,
                    achieved: !!achievement,
                    achievement_date: achievement?.achievement_date || null,
                    notes: achievement?.notes || null,
                    assessed_by: achievement?.assessed_by_name || null
                };
            });

            // Log access
            await AuditService.logClinicalAccess(req, 'milestone_access', patientId);

            res.json({
                success: true,
                data: {
                    patient,
                    age_months: ageMonths,
                    milestones: milestonesWithStatus,
                    milestone_summary: this.generateMilestoneSummary(milestonesWithStatus, ageMonths)
                }
            });
        } catch (error) {
            console.error('Error fetching patient milestones:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch patient milestones'
            });
        }
    }

    // Record milestone achievement
    // Required Permission: clinical.visit.create
    static async recordMilestoneAchievement(req, res) {
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
                milestone_id: Joi.number().required(),
                achieved: Joi.boolean().required(),
                achievement_date: Joi.date().optional(),
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

            // Check if milestone exists
            const [milestones] = await db.execute(`
                SELECT id FROM developmental_milestones WHERE id = ?
            `, [value.milestone_id]);

            if (milestones.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Milestone not found'
                });
            }

            // Insert or update achievement
            const [result] = await db.execute(`
                INSERT INTO milestone_achievements (
                    patient_id, milestone_id, achieved, achievement_date,
                    notes, assessed_by, visit_id, clinic_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    achieved = VALUES(achieved),
                    achievement_date = VALUES(achievement_date),
                    notes = VALUES(notes),
                    assessed_by = VALUES(assessed_by),
                    visit_id = VALUES(visit_id),
                    updated_at = NOW()
            `, [
                value.patient_id, value.milestone_id, value.achieved,
                value.achievement_date || new Date(), value.notes,
                req.user.id, value.visit_id, req.user.clinic_id
            ]);

            // Log milestone recording
            await AuditService.logAction({
                clinic_id: req.user.clinic_id,
                user_id: req.user.id,
                action: 'milestone_achievement_record',
                entity: 'milestone_achievement',
                entity_id: result.insertId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: {
                    patient_id: value.patient_id,
                    milestone_id: value.milestone_id,
                    achieved: value.achieved
                }
            });

            res.status(201).json({
                success: true,
                message: 'Milestone achievement recorded successfully',
                data: { id: result.insertId }
            });
        } catch (error) {
            console.error('Error recording milestone achievement:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to record milestone achievement'
            });
        }
    }

    // Get milestone screening checklist for age
    static async getMilestoneScreening(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            const { ageMonths } = req.query;
            
            if (!ageMonths) {
                return res.status(400).json({
                    success: false,
                    error: 'Age in months is required'
                });
            }

            const screeningMilestones = this.getExpectedMilestones(parseInt(ageMonths));
            
            res.json({
                success: true,
                data: {
                    age_months: parseInt(ageMonths),
                    screening_milestones: screeningMilestones
                }
            });
        } catch (error) {
            console.error('Error fetching milestone screening:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch milestone screening'
            });
        }
    }

    // Get milestone summary for dashboard
    static async getMilestoneSummary(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            // Get milestone achievement statistics
            const [summaryData] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT ma.patient_id) as patients_assessed,
                    COUNT(*) as total_assessments,
                    SUM(CASE WHEN ma.achieved = 1 THEN 1 ELSE 0 END) as milestones_achieved,
                    SUM(CASE WHEN ma.achieved = 0 THEN 1 ELSE 0 END) as milestones_delayed
                FROM milestone_achievements ma
                WHERE ma.clinic_id = ? AND ma.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            `, [req.user.clinic_id]);

            // Get patients with delayed milestones
            const [delayedPatients] = await db.execute(`
                SELECT 
                    p.id, p.first_name, p.last_name,
                    COUNT(*) as delayed_milestones
                FROM patients p
                INNER JOIN milestone_achievements ma ON p.id = ma.patient_id
                WHERE p.clinic_id = ? AND ma.achieved = 0
                GROUP BY p.id, p.first_name, p.last_name
                ORDER BY delayed_milestones DESC
                LIMIT 10
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: {
                    summary: summaryData[0],
                    patients_with_delays: delayedPatients
                }
            });
        } catch (error) {
            console.error('Error fetching milestone summary:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch milestone summary'
            });
        }
    }

    // Helper methods
    static calculateAgeInMonths(birthDate) {
        const birth = new Date(birthDate);
        const now = new Date();
        return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    }

    static getExpectedMilestones(ageMonths) {
        const milestones = [];
        
        // Get milestones for current age and previous ages
        Object.keys(this.MILESTONE_DATA).forEach(age => {
            const milestoneAge = parseInt(age);
            if (milestoneAge <= ageMonths + 3) { // Include upcoming milestones
                this.MILESTONE_DATA[age].forEach(milestone => {
                    milestones.push({
                        ...milestone,
                        age_months: milestoneAge,
                        status: milestoneAge <= ageMonths ? 'expected' : 'upcoming'
                    });
                });
            }
        });

        return milestones.sort((a, b) => a.age_months - b.age_months);
    }

    static generateMilestoneSummary(milestones, currentAge) {
        const expectedMilestones = milestones.filter(m => m.age_months <= currentAge);
        const achievedCount = expectedMilestones.filter(m => m.achieved).length;
        const totalExpected = expectedMilestones.length;
        const delayedMilestones = expectedMilestones.filter(m => !m.achieved);

        return {
            total_expected: totalExpected,
            achieved: achievedCount,
            achievement_rate: totalExpected > 0 ? Math.round((achievedCount / totalExpected) * 100) : 0,
            delayed_count: delayedMilestones.length,
            status: delayedMilestones.length === 0 ? 'on_track' : 
                   delayedMilestones.length <= 2 ? 'minor_delays' : 'significant_delays',
            delayed_milestones: delayedMilestones.map(m => ({
                milestone: m.milestone,
                category: m.category,
                expected_age: m.age_months
            }))
        };
    }
}

module.exports = DevelopmentalMilestonesController;