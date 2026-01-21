const db = require('../config/database');

class BillingController {
    // Service-Based Billing
    static async linkServiceToBilling(req, res) {
        try {
            const { serviceId, billingCode, basePrice, description } = req.body;
            
            const query = `
                INSERT INTO billing_services (service_id, billing_code, base_price, description, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `;
            
            await db.execute(query, [serviceId, billingCode, basePrice, description]);
            
            res.json({
                success: true,
                message: 'Service linked to billing successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async calculateConsultationFee(req, res) {
        try {
            const { visitId, doctorId, visitType, duration } = req.body;
            
            // Get doctor's consultation rates
            const doctorQuery = `
                SELECT consultation_rate, specialty_rate 
                FROM doctors 
                WHERE id = ?
            `;
            const [doctorRates] = await db.execute(doctorQuery, [doctorId]);
            
            // Calculate fee based on visit type and duration
            let baseFee = doctorRates[0].consultation_rate;
            if (visitType === 'specialty') baseFee = doctorRates[0].specialty_rate;
            
            const durationMultiplier = Math.ceil(duration / 30); // 30-minute blocks
            const totalFee = baseFee * durationMultiplier;
            
            // Create billing record
            const billingQuery = `
                INSERT INTO billing_charges (visit_id, service_type, description, amount, billing_code, created_at)
                VALUES (?, 'consultation', ?, ?, 'CONS001', NOW())
            `;
            
            await db.execute(billingQuery, [
                visitId, 
                `${visitType} consultation - ${duration} minutes`, 
                totalFee
            ]);
            
            res.json({
                success: true,
                data: { totalFee, baseFee, durationMultiplier }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async addProcedureBilling(req, res) {
        try {
            const { visitId, procedureCode, quantity = 1, modifiers = [] } = req.body;
            
            // Get procedure pricing
            const procedureQuery = `
                SELECT * FROM billing_procedures 
                WHERE code = ?
            `;
            const [procedures] = await db.execute(procedureQuery, [procedureCode]);
            
            if (procedures.length === 0) {
                return res.status(404).json({ success: false, message: 'Procedure not found' });
            }
            
            const procedure = procedures[0];
            let totalAmount = procedure.base_price * quantity;
            
            // Apply modifiers
            for (const modifier of modifiers) {
                if (modifier.type === 'percentage') {
                    totalAmount *= (1 + modifier.value / 100);
                } else if (modifier.type === 'fixed') {
                    totalAmount += modifier.value;
                }
            }
            
            const billingQuery = `
                INSERT INTO billing_charges (visit_id, service_type, description, amount, billing_code, quantity, created_at)
                VALUES (?, 'procedure', ?, ?, ?, ?, NOW())
            `;
            
            await db.execute(billingQuery, [
                visitId, 
                procedure.description, 
                totalAmount, 
                procedureCode, 
                quantity
            ]);
            
            res.json({
                success: true,
                data: { totalAmount, basePrice: procedure.base_price, quantity }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Lab Charges Integration
    static async addLabCharges(req, res) {
        try {
            const { labRequestId } = req.body;
            
            // Get lab tests for the request
            const testsQuery = `
                SELECT lt.*, bp.base_price, bp.billing_code
                FROM lab_tests lt
                JOIN billing_procedures bp ON lt.test_code = bp.code
                WHERE lt.lab_request_id = ?
            `;
            const [tests] = await db.execute(testsQuery, [labRequestId]);
            
            let totalLabCharges = 0;
            
            for (const test of tests) {
                const amount = test.base_price;
                totalLabCharges += amount;
                
                // Add billing charge for each test
                const billingQuery = `
                    INSERT INTO billing_charges (visit_id, service_type, description, amount, billing_code, lab_test_id, created_at)
                    VALUES ((SELECT visit_id FROM lab_requests WHERE id = ?), 'laboratory', ?, ?, ?, ?, NOW())
                `;
                
                await db.execute(billingQuery, [
                    labRequestId,
                    test.test_name,
                    amount,
                    test.billing_code,
                    test.id
                ]);
            }
            
            res.json({
                success: true,
                data: { totalLabCharges, testsCount: tests.length }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateLabPricing(req, res) {
        try {
            const { testCode, newPrice, effectiveDate } = req.body;
            
            const query = `
                UPDATE billing_procedures 
                SET base_price = ?, effective_date = ?, updated_at = NOW()
                WHERE code = ? AND type = 'laboratory'
            `;
            
            await db.execute(query, [newPrice, effectiveDate, testCode]);
            
            res.json({
                success: true,
                message: 'Lab pricing updated successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Visit-Based Billing
    static async calculateVisitCharges(req, res) {
        try {
            const { visitId } = req.params;
            
            // Get visit details with diagnoses
            const visitQuery = `
                SELECT v.*, vd.diagnosis_code, vd.diagnosis_type
                FROM visits v
                LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
                WHERE v.id = ?
            `;
            const [visitData] = await db.execute(visitQuery, [visitId]);
            
            if (visitData.length === 0) {
                return res.status(404).json({ success: false, message: 'Visit not found' });
            }
            
            const visit = visitData[0];
            let complexityMultiplier = 1.0;
            
            // Calculate complexity based on diagnoses
            const primaryDiagnoses = visitData.filter(d => d.diagnosis_type === 'primary');
            const secondaryDiagnoses = visitData.filter(d => d.diagnosis_type === 'secondary');
            
            if (primaryDiagnoses.length > 1) complexityMultiplier += 0.2;
            if (secondaryDiagnoses.length > 2) complexityMultiplier += 0.15;
            
            // Get existing charges
            const chargesQuery = `
                SELECT SUM(amount) as total_charges
                FROM billing_charges
                WHERE visit_id = ?
            `;
            const [charges] = await db.execute(chargesQuery, [visitId]);
            
            const baseCharges = charges[0].total_charges || 0;
            const adjustedCharges = baseCharges * complexityMultiplier;
            
            // Update visit with final charges
            const updateQuery = `
                UPDATE visits 
                SET total_charges = ?, complexity_multiplier = ?, updated_at = NOW()
                WHERE id = ?
            `;
            
            await db.execute(updateQuery, [adjustedCharges, complexityMultiplier, visitId]);
            
            res.json({
                success: true,
                data: {
                    visitId,
                    baseCharges,
                    complexityMultiplier,
                    totalCharges: adjustedCharges,
                    primaryDiagnoses: primaryDiagnoses.length,
                    secondaryDiagnoses: secondaryDiagnoses.length
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async addInsuranceCoverage(req, res) {
        try {
            const { visitId, insuranceId, coveragePercentage, deductible, copay } = req.body;
            
            // Get total visit charges
            const chargesQuery = `
                SELECT total_charges FROM visits WHERE id = ?
            `;
            const [visit] = await db.execute(chargesQuery, [visitId]);
            
            const totalCharges = visit[0].total_charges;
            const insuranceCoverage = (totalCharges - deductible - copay) * (coveragePercentage / 100);
            const patientResponsibility = totalCharges - insuranceCoverage;
            
            // Create insurance billing record
            const insuranceQuery = `
                INSERT INTO insurance_billing (visit_id, insurance_id, total_charges, coverage_amount, 
                                             patient_responsibility, deductible, copay, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            await db.execute(insuranceQuery, [
                visitId, insuranceId, totalCharges, insuranceCoverage, 
                patientResponsibility, deductible, copay
            ]);
            
            res.json({
                success: true,
                data: {
                    totalCharges,
                    insuranceCoverage,
                    patientResponsibility,
                    coveragePercentage
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Revenue Analytics
    static async getRevenueByService(req, res) {
        try {
            const { startDate, endDate, tenantId } = req.query;
            
            const query = `
                SELECT 
                    bc.service_type,
                    COUNT(*) as service_count,
                    SUM(bc.amount) as total_revenue,
                    AVG(bc.amount) as avg_revenue
                FROM billing_charges bc
                JOIN visits v ON bc.visit_id = v.id
                WHERE v.tenant_id = ? 
                AND DATE(bc.created_at) BETWEEN ? AND ?
                GROUP BY bc.service_type
                ORDER BY total_revenue DESC
            `;
            
            const [results] = await db.execute(query, [tenantId, startDate, endDate]);
            
            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getDoctorRevenue(req, res) {
        try {
            const { startDate, endDate, tenantId } = req.query;
            
            const query = `
                SELECT 
                    d.first_name,
                    d.last_name,
                    COUNT(DISTINCT v.id) as total_visits,
                    SUM(bc.amount) as total_revenue,
                    AVG(bc.amount) as avg_per_visit
                FROM doctors d
                JOIN visits v ON d.id = v.doctor_id
                JOIN billing_charges bc ON v.id = bc.visit_id
                WHERE v.tenant_id = ?
                AND DATE(v.visit_date) BETWEEN ? AND ?
                GROUP BY d.id, d.first_name, d.last_name
                ORDER BY total_revenue DESC
            `;
            
            const [results] = await db.execute(query, [tenantId, startDate, endDate]);
            
            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getPaymentAnalytics(req, res) {
        try {
            const { tenantId, period = '30' } = req.query;
            
            const query = `
                SELECT 
                    p.payment_method,
                    COUNT(*) as payment_count,
                    SUM(p.amount) as total_amount,
                    AVG(p.amount) as avg_payment
                FROM payments p
                JOIN visits v ON p.visit_id = v.id
                WHERE v.tenant_id = ?
                AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY p.payment_method
                ORDER BY total_amount DESC
            `;
            
            const [results] = await db.execute(query, [tenantId, period]);
            
            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Billing Dashboard
    static async getBillingDashboard(req, res) {
        try {
            const { tenantId } = req.query;
            
            // Outstanding payments
            const outstandingQuery = `
                SELECT 
                    COUNT(*) as outstanding_count,
                    SUM(total_charges - COALESCE(paid_amount, 0)) as outstanding_amount
                FROM visits v
                LEFT JOIN (
                    SELECT visit_id, SUM(amount) as paid_amount
                    FROM payments
                    GROUP BY visit_id
                ) p ON v.id = p.visit_id
                WHERE v.tenant_id = ?
                AND (total_charges - COALESCE(paid_amount, 0)) > 0
            `;
            
            // Today's revenue
            const todayQuery = `
                SELECT 
                    COUNT(DISTINCT v.id) as visits_today,
                    SUM(bc.amount) as revenue_today
                FROM visits v
                JOIN billing_charges bc ON v.id = bc.visit_id
                WHERE v.tenant_id = ?
                AND DATE(v.visit_date) = CURDATE()
            `;
            
            // Monthly revenue
            const monthlyQuery = `
                SELECT 
                    SUM(bc.amount) as revenue_month
                FROM visits v
                JOIN billing_charges bc ON v.id = bc.visit_id
                WHERE v.tenant_id = ?
                AND MONTH(v.visit_date) = MONTH(CURDATE())
                AND YEAR(v.visit_date) = YEAR(CURDATE())
            `;
            
            const [outstanding] = await db.execute(outstandingQuery, [tenantId]);
            const [today] = await db.execute(todayQuery, [tenantId]);
            const [monthly] = await db.execute(monthlyQuery, [tenantId]);
            
            res.json({
                success: true,
                data: {
                    outstanding: outstanding[0],
                    today: today[0],
                    monthly: monthly[0]
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getBillingAlerts(req, res) {
        try {
            const { tenantId } = req.query;
            
            const alertsQuery = `
                SELECT 
                    v.id as visit_id,
                    CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                    v.total_charges,
                    COALESCE(paid.amount, 0) as paid_amount,
                    (v.total_charges - COALESCE(paid.amount, 0)) as outstanding,
                    DATEDIFF(NOW(), v.visit_date) as days_overdue
                FROM visits v
                JOIN patients p ON v.patient_id = p.id
                LEFT JOIN (
                    SELECT visit_id, SUM(amount) as amount
                    FROM payments
                    GROUP BY visit_id
                ) paid ON v.id = paid.visit_id
                WHERE v.tenant_id = ?
                AND (v.total_charges - COALESCE(paid.amount, 0)) > 0
                AND DATEDIFF(NOW(), v.visit_date) > 30
                ORDER BY days_overdue DESC
                LIMIT 10
            `;
            
            const [alerts] = await db.execute(alertsQuery, [tenantId]);
            
            res.json({
                success: true,
                data: alerts
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = BillingController;