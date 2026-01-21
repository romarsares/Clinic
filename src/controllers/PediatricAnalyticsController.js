/**
 * Pediatric Analytics Controller
 * Comprehensive analytics for pediatric healthcare
 */

const db = require('../config/database');
const { checkUserPermission } = require('../middleware/permissions');
const AuditService = require('../services/AuditService');

class PediatricAnalyticsController {
    // Get pediatric dashboard overview
    // Required Permission: reports.view
    static async getPediatricDashboard(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'reports.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'reports.view'
                });
            }

            // Get pediatric patient statistics
            const [patientStats] = await db.execute(`
                SELECT 
                    COUNT(*) as total_pediatric_patients,
                    COUNT(CASE WHEN TIMESTAMPDIFF(MONTH, date_of_birth, NOW()) <= 12 THEN 1 END) as infants,
                    COUNT(CASE WHEN TIMESTAMPDIFF(MONTH, date_of_birth, NOW()) BETWEEN 13 AND 36 THEN 1 END) as toddlers,
                    COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, date_of_birth, NOW()) BETWEEN 3 AND 12 THEN 1 END) as children,
                    COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, date_of_birth, NOW()) BETWEEN 13 AND 17 THEN 1 END) as adolescents
                FROM patients 
                WHERE clinic_id = ? AND patient_type = 'child' AND deleted_at IS NULL
            `, [req.user.clinic_id]);

            // Get vaccination coverage
            const [vaccineStats] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN vr.patient_id END) as vaccinated_patients,
                    COUNT(DISTINCT p.id) as total_patients,
                    COUNT(CASE WHEN vr.status = 'scheduled' AND vr.due_date < NOW() THEN 1 END) as overdue_vaccines
                FROM patients p
                LEFT JOIN vaccine_records vr ON p.id = vr.patient_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
            `, [req.user.clinic_id]);

            // Get growth monitoring stats
            const [growthStats] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT gm.patient_id) as patients_with_growth_data,
                    COUNT(*) as total_measurements,
                    COUNT(CASE WHEN gm.percentile_height < 3 OR gm.percentile_weight < 3 THEN 1 END) as growth_concerns
                FROM growth_measurements gm
                INNER JOIN patients p ON gm.patient_id = p.id
                WHERE gm.clinic_id = ? AND p.patient_type = 'child'
                AND gm.measurement_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            `, [req.user.clinic_id]);

            // Get milestone tracking stats
            const [milestoneStats] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT ma.patient_id) as patients_assessed,
                    COUNT(*) as total_assessments,
                    COUNT(CASE WHEN ma.achieved = 0 THEN 1 END) as delayed_milestones
                FROM milestone_achievements ma
                INNER JOIN patients p ON ma.patient_id = p.id
                WHERE ma.clinic_id = ? AND p.patient_type = 'child'
                AND ma.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: {
                    patient_demographics: patientStats[0],
                    vaccination_coverage: vaccineStats[0],
                    growth_monitoring: growthStats[0],
                    milestone_tracking: milestoneStats[0]
                }
            });
        } catch (error) {
            console.error('Error fetching pediatric dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch pediatric dashboard'
            });
        }
    }

    // Get childhood disease tracking
    static async getChildhoodDiseaseTracking(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'reports.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'reports.view'
                });
            }

            // Common pediatric conditions
            const pediatricConditions = [
                'Upper respiratory infection', 'Otitis media', 'Gastroenteritis',
                'Bronchiolitis', 'Pneumonia', 'Asthma', 'Allergic rhinitis',
                'Eczema', 'Conjunctivitis', 'Fever of unknown origin'
            ];

            const conditionsList = pediatricConditions.map(c => `'${c}'`).join(',');

            // Get disease prevalence in pediatric population
            const [diseaseData] = await db.execute(`
                SELECT 
                    v.diagnosis,
                    COUNT(DISTINCT v.patient_id) as affected_patients,
                    COUNT(*) as total_visits,
                    ROUND(AVG(TIMESTAMPDIFF(MONTH, p.date_of_birth, v.visit_date)), 1) as avg_age_months
                FROM visits v
                INNER JOIN patients p ON v.patient_id = p.id
                WHERE v.clinic_id = ? AND p.patient_type = 'child'
                AND v.diagnosis IN (${conditionsList})
                AND v.visit_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY v.diagnosis
                ORDER BY affected_patients DESC
            `, [req.user.clinic_id]);

            // Get seasonal patterns
            const [seasonalData] = await db.execute(`
                SELECT 
                    MONTH(v.visit_date) as month,
                    v.diagnosis,
                    COUNT(*) as visit_count
                FROM visits v
                INNER JOIN patients p ON v.patient_id = p.id
                WHERE v.clinic_id = ? AND p.patient_type = 'child'
                AND v.diagnosis IN (${conditionsList})
                AND v.visit_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY MONTH(v.visit_date), v.diagnosis
                ORDER BY month, visit_count DESC
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: {
                    disease_prevalence: diseaseData,
                    seasonal_patterns: seasonalData
                }
            });
        } catch (error) {
            console.error('Error fetching childhood disease tracking:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch childhood disease tracking'
            });
        }
    }

    // Get vaccination coverage statistics
    static async getVaccinationStatistics(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'reports.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'reports.view'
                });
            }

            // Coverage by vaccine type
            const [coverageByVaccine] = await db.execute(`
                SELECT 
                    vr.vaccine_name,
                    COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN vr.patient_id END) as vaccinated,
                    COUNT(DISTINCT p.id) as eligible,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN vr.patient_id END) / 
                         COUNT(DISTINCT p.id)) * 100, 1
                    ) as coverage_percentage
                FROM patients p
                LEFT JOIN vaccine_records vr ON p.id = vr.patient_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
                GROUP BY vr.vaccine_name
                HAVING vr.vaccine_name IS NOT NULL
                ORDER BY coverage_percentage DESC
            `, [req.user.clinic_id]);

            // Coverage by age group
            const [coverageByAge] = await db.execute(`
                SELECT 
                    CASE 
                        WHEN TIMESTAMPDIFF(MONTH, p.date_of_birth, NOW()) <= 12 THEN '0-12 months'
                        WHEN TIMESTAMPDIFF(MONTH, p.date_of_birth, NOW()) <= 24 THEN '13-24 months'
                        WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, NOW()) <= 5 THEN '2-5 years'
                        ELSE '6+ years'
                    END as age_group,
                    COUNT(DISTINCT p.id) as total_patients,
                    COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN vr.patient_id END) as vaccinated_patients
                FROM patients p
                LEFT JOIN vaccine_records vr ON p.id = vr.patient_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
                GROUP BY age_group
                ORDER BY MIN(TIMESTAMPDIFF(MONTH, p.date_of_birth, NOW()))
            `, [req.user.clinic_id]);

            // Overdue vaccinations
            const [overdueVaccines] = await db.execute(`
                SELECT 
                    p.id, p.first_name, p.last_name,
                    TIMESTAMPDIFF(MONTH, p.date_of_birth, NOW()) as age_months,
                    vr.vaccine_name, vr.due_date,
                    DATEDIFF(NOW(), vr.due_date) as days_overdue
                FROM patients p
                INNER JOIN vaccine_records vr ON p.id = vr.patient_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child'
                AND vr.status = 'scheduled' AND vr.due_date < NOW()
                ORDER BY days_overdue DESC
                LIMIT 20
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: {
                    coverage_by_vaccine: coverageByVaccine,
                    coverage_by_age_group: coverageByAge,
                    overdue_vaccinations: overdueVaccines
                }
            });
        } catch (error) {
            console.error('Error fetching vaccination statistics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch vaccination statistics'
            });
        }
    }

    // Get pediatric growth analytics
    static async getPediatricGrowthAnalytics(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'reports.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'reports.view'
                });
            }

            // Growth percentile distribution
            const [percentileDistribution] = await db.execute(`
                SELECT 
                    CASE 
                        WHEN gm.percentile_height < 10 THEN '<10th percentile'
                        WHEN gm.percentile_height < 25 THEN '10-25th percentile'
                        WHEN gm.percentile_height < 75 THEN '25-75th percentile'
                        WHEN gm.percentile_height < 90 THEN '75-90th percentile'
                        ELSE '>90th percentile'
                    END as height_percentile_range,
                    COUNT(*) as patient_count
                FROM growth_measurements gm
                INNER JOIN patients p ON gm.patient_id = p.id
                WHERE gm.clinic_id = ? AND p.patient_type = 'child'
                AND gm.measurement_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                AND gm.percentile_height IS NOT NULL
                GROUP BY height_percentile_range
                ORDER BY MIN(gm.percentile_height)
            `, [req.user.clinic_id]);

            // Growth concerns by age
            const [growthConcernsByAge] = await db.execute(`
                SELECT 
                    CASE 
                        WHEN TIMESTAMPDIFF(MONTH, p.date_of_birth, gm.measurement_date) <= 12 THEN '0-12 months'
                        WHEN TIMESTAMPDIFF(MONTH, p.date_of_birth, gm.measurement_date) <= 24 THEN '13-24 months'
                        WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, gm.measurement_date) <= 5 THEN '2-5 years'
                        ELSE '6+ years'
                    END as age_group,
                    COUNT(*) as total_measurements,
                    COUNT(CASE WHEN gm.percentile_height < 3 OR gm.percentile_weight < 3 THEN 1 END) as growth_concerns
                FROM growth_measurements gm
                INNER JOIN patients p ON gm.patient_id = p.id
                WHERE gm.clinic_id = ? AND p.patient_type = 'child'
                AND gm.measurement_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY age_group
                ORDER BY MIN(TIMESTAMPDIFF(MONTH, p.date_of_birth, gm.measurement_date))
            `, [req.user.clinic_id]);

            // BMI trends
            const [bmiTrends] = await db.execute(`
                SELECT 
                    DATE_FORMAT(gm.measurement_date, '%Y-%m') as month,
                    AVG(gm.bmi) as avg_bmi,
                    COUNT(*) as measurement_count
                FROM growth_measurements gm
                INNER JOIN patients p ON gm.patient_id = p.id
                WHERE gm.clinic_id = ? AND p.patient_type = 'child'
                AND gm.bmi IS NOT NULL
                AND gm.measurement_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(gm.measurement_date, '%Y-%m')
                ORDER BY month
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: {
                    percentile_distribution: percentileDistribution,
                    growth_concerns_by_age: growthConcernsByAge,
                    bmi_trends: bmiTrends
                }
            });
        } catch (error) {
            console.error('Error fetching pediatric growth analytics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch pediatric growth analytics'
            });
        }
    }

    // Get pediatric quality indicators
    static async getPediatricQualityIndicators(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'reports.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'reports.view'
                });
            }

            // Well-child visit compliance
            const [wellChildVisits] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT p.id) as total_children,
                    COUNT(DISTINCT CASE WHEN v.visit_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) THEN p.id END) as children_with_annual_visit,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN v.visit_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) THEN p.id END) / 
                         COUNT(DISTINCT p.id)) * 100, 1
                    ) as annual_visit_rate
                FROM patients p
                LEFT JOIN visits v ON p.id = v.patient_id AND v.clinic_id = p.clinic_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
            `, [req.user.clinic_id]);

            // Immunization rates
            const [immunizationRates] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT p.id) as total_children,
                    COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN p.id END) as immunized_children,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN vr.status = 'given' THEN p.id END) / 
                         COUNT(DISTINCT p.id)) * 100, 1
                    ) as immunization_rate
                FROM patients p
                LEFT JOIN vaccine_records vr ON p.id = vr.patient_id AND vr.clinic_id = p.clinic_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
            `, [req.user.clinic_id]);

            // Growth monitoring compliance
            const [growthMonitoring] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT p.id) as total_children,
                    COUNT(DISTINCT CASE WHEN gm.measurement_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) THEN p.id END) as children_with_growth_data,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN gm.measurement_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) THEN p.id END) / 
                         COUNT(DISTINCT p.id)) * 100, 1
                    ) as growth_monitoring_rate
                FROM patients p
                LEFT JOIN growth_measurements gm ON p.id = gm.patient_id AND gm.clinic_id = p.clinic_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
            `, [req.user.clinic_id]);

            // Developmental screening compliance
            const [developmentalScreening] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT p.id) as total_children,
                    COUNT(DISTINCT CASE WHEN ma.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) THEN p.id END) as children_screened,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN ma.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) THEN p.id END) / 
                         COUNT(DISTINCT p.id)) * 100, 1
                    ) as screening_rate
                FROM patients p
                LEFT JOIN milestone_achievements ma ON p.id = ma.patient_id AND ma.clinic_id = p.clinic_id
                WHERE p.clinic_id = ? AND p.patient_type = 'child' AND p.deleted_at IS NULL
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: {
                    well_child_visits: wellChildVisits[0],
                    immunization_rates: immunizationRates[0],
                    growth_monitoring: growthMonitoring[0],
                    developmental_screening: developmentalScreening[0]
                }
            });
        } catch (error) {
            console.error('Error fetching pediatric quality indicators:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch pediatric quality indicators'
            });
        }
    }
}

module.exports = PediatricAnalyticsController;