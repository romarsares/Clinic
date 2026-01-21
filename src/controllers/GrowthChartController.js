/**
 * Growth Chart Controller
 * WHO Growth Standards Implementation for Pediatric Patients
 */

const db = require('../config/database');
const { checkUserPermission } = require('../middleware/permissions');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class GrowthChartController {
    // WHO Growth Standards Data (simplified - would use full WHO tables in production)
    static WHO_PERCENTILES = {
        // Height percentiles for boys (cm) by age in months
        height_boys: {
            0: { p3: 46.1, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.7 },
            6: { p3: 63.3, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.9 },
            12: { p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.5 },
            24: { p3: 81.7, p15: 84.8, p50: 87.8, p85: 90.9, p97: 93.9 },
            36: { p3: 88.7, p15: 92.4, p50: 96.1, p85: 99.8, p97: 103.5 }
        },
        // Height percentiles for girls (cm) by age in months
        height_girls: {
            0: { p3: 45.4, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.9 },
            6: { p3: 61.8, p15: 64.0, p50: 66.2, p85: 68.3, p97: 70.3 },
            12: { p3: 69.2, p15: 71.4, p50: 73.7, p85: 76.0, p97: 78.4 },
            24: { p3: 80.0, p15: 83.2, p50: 86.4, p85: 89.6, p97: 92.9 },
            36: { p3: 87.4, p15: 91.2, p50: 95.1, p85: 99.0, p97: 102.7 }
        },
        // Weight percentiles for boys (kg) by age in months
        weight_boys: {
            0: { p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
            6: { p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
            12: { p3: 8.4, p15: 9.4, p50: 10.5, p85: 11.8, p97: 13.3 },
            24: { p3: 10.5, p15: 11.8, p50: 13.4, p85: 15.3, p97: 17.8 },
            36: { p3: 12.1, p15: 13.8, p50: 15.7, p85: 18.3, p97: 21.2 }
        },
        // Weight percentiles for girls (kg) by age in months
        weight_girls: {
            0: { p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
            6: { p3: 5.7, p15: 6.5, p50: 7.3, p85: 8.2, p97: 9.3 },
            12: { p3: 7.7, p15: 8.5, p50: 9.5, p85: 10.8, p97: 12.4 },
            24: { p3: 9.7, p15: 10.8, p50: 12.4, p85: 14.8, p97: 17.7 },
            36: { p3: 11.6, p15: 13.1, p50: 15.1, p85: 17.9, p97: 21.5 }
        }
    };

    // Get patient growth data with WHO percentiles
    // Required Permission: patient.view
    static async getPatientGrowthData(req, res) {
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
                SELECT id, first_name, last_name, date_of_birth, gender, patient_type
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

            // Get growth measurements
            const [measurements] = await db.execute(`
                SELECT gm.*, v.visit_date, u.full_name as measured_by_name
                FROM growth_measurements gm
                LEFT JOIN visits v ON gm.visit_id = v.id
                LEFT JOIN auth_users u ON gm.measured_by = u.id
                WHERE gm.patient_id = ? AND gm.clinic_id = ?
                ORDER BY gm.measurement_date ASC
            `, [patientId, req.user.clinic_id]);

            // Calculate percentiles for each measurement
            const enrichedMeasurements = measurements.map(measurement => {
                const ageMonths = measurement.age_months;
                const heightPercentile = this.calculatePercentile(
                    measurement.height_cm, 
                    ageMonths, 
                    patient.gender, 
                    'height'
                );
                const weightPercentile = this.calculatePercentile(
                    measurement.weight_kg, 
                    ageMonths, 
                    patient.gender, 
                    'weight'
                );

                return {
                    ...measurement,
                    height_percentile: heightPercentile,
                    weight_percentile: weightPercentile,
                    bmi_calculated: measurement.height_cm ? 
                        (measurement.weight_kg / Math.pow(measurement.height_cm / 100, 2)).toFixed(1) : null
                };
            });

            // Log access
            await AuditService.logClinicalAccess(req, 'growth_chart_access', patientId);

            res.json({
                success: true,
                data: {
                    patient,
                    measurements: enrichedMeasurements,
                    growth_analysis: this.analyzeGrowthPattern(enrichedMeasurements)
                }
            });
        } catch (error) {
            console.error('Error fetching growth data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch growth data'
            });
        }
    }

    // Add new growth measurement
    // Required Permission: clinical.visit.create
    static async addGrowthMeasurement(req, res) {
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
                visit_id: Joi.number().optional(),
                measurement_date: Joi.date().required(),
                height_cm: Joi.number().min(30).max(250).optional(),
                weight_kg: Joi.number().min(1).max(200).optional(),
                head_circumference_cm: Joi.number().min(20).max(70).optional(),
                notes: Joi.string().optional()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
            }

            // Get patient info for age calculation
            const [patients] = await db.execute(`
                SELECT date_of_birth, gender FROM patients 
                WHERE id = ? AND clinic_id = ?
            `, [value.patient_id, req.user.clinic_id]);

            if (patients.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Patient not found'
                });
            }

            const patient = patients[0];
            const ageMonths = this.calculateAgeInMonths(patient.date_of_birth, value.measurement_date);
            
            // Calculate BMI if both height and weight provided
            let bmi = null;
            if (value.height_cm && value.weight_kg) {
                bmi = (value.weight_kg / Math.pow(value.height_cm / 100, 2)).toFixed(2);
            }

            // Calculate percentiles
            const heightPercentile = value.height_cm ? 
                this.calculatePercentile(value.height_cm, ageMonths, patient.gender, 'height') : null;
            const weightPercentile = value.weight_kg ? 
                this.calculatePercentile(value.weight_kg, ageMonths, patient.gender, 'weight') : null;

            // Insert measurement
            const [result] = await db.execute(`
                INSERT INTO growth_measurements (
                    patient_id, visit_id, measurement_date, age_months,
                    height_cm, weight_kg, head_circumference_cm, bmi,
                    percentile_height, percentile_weight, measured_by,
                    notes, clinic_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                value.patient_id, value.visit_id, value.measurement_date, ageMonths,
                value.height_cm, value.weight_kg, value.head_circumference_cm, bmi,
                heightPercentile, weightPercentile, req.user.id,
                value.notes, req.user.clinic_id
            ]);

            // Log measurement addition
            await AuditService.logAction({
                clinic_id: req.user.clinic_id,
                user_id: req.user.id,
                action: 'growth_measurement_add',
                entity: 'growth_measurement',
                entity_id: result.insertId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: {
                    patient_id: value.patient_id,
                    height_cm: value.height_cm,
                    weight_kg: value.weight_kg,
                    height_percentile: heightPercentile,
                    weight_percentile: weightPercentile
                }
            });

            res.status(201).json({
                success: true,
                message: 'Growth measurement added successfully',
                data: {
                    id: result.insertId,
                    age_months: ageMonths,
                    bmi,
                    height_percentile: heightPercentile,
                    weight_percentile: weightPercentile
                }
            });
        } catch (error) {
            console.error('Error adding growth measurement:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to add growth measurement'
            });
        }
    }

    // Get WHO growth chart data for visualization
    static async getWHOChartData(req, res) {
        try {
            const { gender, type } = req.query; // type: 'height' or 'weight'
            
            if (!gender || !type) {
                return res.status(400).json({
                    success: false,
                    error: 'Gender and type parameters required'
                });
            }

            const chartKey = `${type}_${gender === 'male' ? 'boys' : 'girls'}`;
            const whoData = this.WHO_PERCENTILES[chartKey];

            if (!whoData) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid gender or type'
                });
            }

            // Convert to chart-friendly format
            const chartData = Object.keys(whoData).map(ageMonths => ({
                age_months: parseInt(ageMonths),
                p3: whoData[ageMonths].p3,
                p15: whoData[ageMonths].p15,
                p50: whoData[ageMonths].p50,
                p85: whoData[ageMonths].p85,
                p97: whoData[ageMonths].p97
            }));

            res.json({
                success: true,
                data: {
                    gender,
                    type,
                    percentiles: chartData
                }
            });
        } catch (error) {
            console.error('Error fetching WHO chart data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch WHO chart data'
            });
        }
    }

    // Calculate percentile for a measurement
    static calculatePercentile(value, ageMonths, gender, type) {
        const chartKey = `${type}_${gender === 'male' ? 'boys' : 'girls'}`;
        const whoData = this.WHO_PERCENTILES[chartKey];

        // Find closest age in WHO data
        const ages = Object.keys(whoData).map(Number).sort((a, b) => a - b);
        let closestAge = ages[0];
        
        for (const age of ages) {
            if (Math.abs(age - ageMonths) < Math.abs(closestAge - ageMonths)) {
                closestAge = age;
            }
        }

        const percentiles = whoData[closestAge];
        
        // Determine percentile range
        if (value <= percentiles.p3) return 3;
        if (value <= percentiles.p15) return 15;
        if (value <= percentiles.p50) return 50;
        if (value <= percentiles.p85) return 85;
        if (value <= percentiles.p97) return 97;
        return 97; // Above 97th percentile
    }

    // Calculate age in months from birth date
    static calculateAgeInMonths(birthDate, measurementDate = new Date()) {
        const birth = new Date(birthDate);
        const measurement = new Date(measurementDate);
        
        const yearDiff = measurement.getFullYear() - birth.getFullYear();
        const monthDiff = measurement.getMonth() - birth.getMonth();
        
        return yearDiff * 12 + monthDiff;
    }

    // Analyze growth pattern for concerns
    static analyzeGrowthPattern(measurements) {
        if (measurements.length < 2) {
            return {
                status: 'insufficient_data',
                message: 'Need at least 2 measurements for analysis',
                alerts: []
            };
        }

        const alerts = [];
        const latest = measurements[measurements.length - 1];
        
        // Check for concerning percentiles
        if (latest.height_percentile && latest.height_percentile < 3) {
            alerts.push({
                type: 'height_concern',
                severity: 'high',
                message: 'Height below 3rd percentile - consider evaluation'
            });
        }
        
        if (latest.weight_percentile && latest.weight_percentile < 3) {
            alerts.push({
                type: 'weight_concern',
                severity: 'high',
                message: 'Weight below 3rd percentile - consider evaluation'
            });
        }

        // Check growth velocity (simplified)
        if (measurements.length >= 3) {
            const recent = measurements.slice(-3);
            const heightGrowth = recent[2].height_cm - recent[0].height_cm;
            const timeSpan = recent[2].age_months - recent[0].age_months;
            
            if (timeSpan > 0 && heightGrowth / timeSpan < 0.5) { // Less than 0.5cm per month
                alerts.push({
                    type: 'growth_velocity',
                    severity: 'medium',
                    message: 'Slow growth velocity detected'
                });
            }
        }

        return {
            status: alerts.length > 0 ? 'concerns_detected' : 'normal',
            message: alerts.length > 0 ? 
                `${alerts.length} growth concern(s) detected` : 
                'Growth pattern appears normal',
            alerts,
            latest_percentiles: {
                height: latest.height_percentile,
                weight: latest.weight_percentile
            }
        };
    }

    // Get growth summary for dashboard
    static async getGrowthSummary(req, res) {
        try {
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'patient.view');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'patient.view'
                });
            }

            // Get growth concerns summary
            const [concernsData] = await db.execute(`
                SELECT 
                    COUNT(*) as total_measurements,
                    SUM(CASE WHEN percentile_height < 3 OR percentile_weight < 3 THEN 1 ELSE 0 END) as below_3rd_percentile,
                    SUM(CASE WHEN percentile_height > 97 OR percentile_weight > 97 THEN 1 ELSE 0 END) as above_97th_percentile,
                    COUNT(DISTINCT patient_id) as patients_measured
                FROM growth_measurements 
                WHERE clinic_id = ? AND measurement_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            `, [req.user.clinic_id]);

            res.json({
                success: true,
                data: concernsData[0]
            });
        } catch (error) {
            console.error('Error fetching growth summary:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch growth summary'
            });
        }
    }
}

module.exports = GrowthChartController;