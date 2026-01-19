const TenantDB = require('../middleware/tenant');

class ClinicalReports {
  static async getCommonDiagnoses(tenantId, dateFrom = null, dateTo = null) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT vd.diagnosis_code, vd.diagnosis_description, 
                 COUNT(*) as frequency,
                 COUNT(DISTINCT v.patient_id) as unique_patients
                 FROM visit_diagnoses vd
                 JOIN visits v ON vd.visit_id = v.id
                 WHERE v.tenant_id = ?`;
    
    const params = [tenantId];

    if (dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(dateTo);
    }

    query += ` GROUP BY vd.diagnosis_code, vd.diagnosis_description
               ORDER BY frequency DESC
               LIMIT 20`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getDiseasePrevalence(tenantId, diseaseCategory = null) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT vd.diagnosis_code, vd.diagnosis_description,
                 COUNT(DISTINCT v.patient_id) as affected_patients,
                 (SELECT COUNT(DISTINCT id) FROM patients WHERE tenant_id = ?) as total_patients,
                 ROUND((COUNT(DISTINCT v.patient_id) * 100.0 / 
                       (SELECT COUNT(DISTINCT id) FROM patients WHERE tenant_id = ?)), 2) as prevalence_percentage
                 FROM visit_diagnoses vd
                 JOIN visits v ON vd.visit_id = v.id
                 WHERE v.tenant_id = ?`;
    
    const params = [tenantId, tenantId, tenantId];

    if (diseaseCategory) {
      query += ' AND vd.diagnosis_code LIKE ?';
      params.push(`${diseaseCategory}%`);
    }

    query += ` GROUP BY vd.diagnosis_code, vd.diagnosis_description
               HAVING affected_patients > 1
               ORDER BY prevalence_percentage DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getLabTestVolumes(tenantId, dateFrom = null, dateTo = null) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT lr.test_name, lr.test_type,
                 COUNT(*) as total_requests,
                 COUNT(CASE WHEN lr.status = 'completed' THEN 1 END) as completed_tests,
                 AVG(CASE WHEN lr.status = 'completed' AND lr.completed_at IS NOT NULL 
                     THEN TIMESTAMPDIFF(HOUR, lr.requested_at, lr.completed_at) END) as avg_turnaround_hours
                 FROM lab_requests lr
                 WHERE lr.tenant_id = ?`;
    
    const params = [tenantId];

    if (dateFrom) {
      query += ' AND lr.requested_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND lr.requested_at <= ?';
      params.push(dateTo);
    }

    query += ` GROUP BY lr.test_name, lr.test_type
               ORDER BY total_requests DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getLabRevenue(tenantId, dateFrom = null, dateTo = null) {
    const db = TenantDB.getConnection(tenantId);
    
    // Lab pricing (simplified - in real system would be in database)
    const labPricing = {
      'Complete Blood Count (CBC)': 150,
      'Urinalysis': 100,
      'Blood Glucose': 80,
      'Cholesterol Panel': 200,
      'Liver Function Tests': 250,
      'Kidney Function Tests': 200
    };

    const volumes = await this.getLabTestVolumes(tenantId, dateFrom, dateTo);
    
    return volumes.map(test => ({
      ...test,
      price_per_test: labPricing[test.test_name] || 100,
      total_revenue: (labPricing[test.test_name] || 100) * test.completed_tests
    }));
  }

  static async getDoctorProductivity(tenantId, dateFrom = null, dateTo = null) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT u.id, u.first_name, u.last_name,
                 COUNT(DISTINCT v.id) as total_visits,
                 COUNT(DISTINCT v.patient_id) as unique_patients,
                 COUNT(DISTINCT vd.id) as diagnoses_made,
                 AVG(TIMESTAMPDIFF(MINUTE, v.created_at, v.updated_at)) as avg_visit_duration_minutes
                 FROM users u
                 LEFT JOIN visits v ON u.id = v.doctor_id AND v.tenant_id = ?
                 LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
                 WHERE u.role = 'Doctor' AND u.tenant_id = ?`;
    
    const params = [tenantId, tenantId];

    if (dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(dateTo);
    }

    query += ` GROUP BY u.id, u.first_name, u.last_name
               ORDER BY total_visits DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getTreatmentOutcomes(tenantId, diagnosisCode = null) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT vd.diagnosis_code, vd.diagnosis_description,
                 vt.treatment_type, vt.medication_name,
                 COUNT(*) as treatment_frequency,
                 COUNT(DISTINCT v.patient_id) as patients_treated
                 FROM visit_diagnoses vd
                 JOIN visits v ON vd.visit_id = v.id
                 JOIN visit_treatments vt ON v.id = vt.visit_id
                 WHERE v.tenant_id = ?`;
    
    const params = [tenantId];

    if (diagnosisCode) {
      query += ' AND vd.diagnosis_code = ?';
      params.push(diagnosisCode);
    }

    query += ` GROUP BY vd.diagnosis_code, vd.diagnosis_description, vt.treatment_type, vt.medication_name
               ORDER BY treatment_frequency DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getClinicOverview(tenantId, dateFrom = null, dateTo = null) {
    const db = TenantDB.getConnection(tenantId);
    
    // Get basic statistics
    const [stats] = await db.execute(
      `SELECT 
        (SELECT COUNT(*) FROM patients WHERE tenant_id = ?) as total_patients,
        (SELECT COUNT(*) FROM visits WHERE tenant_id = ? 
         ${dateFrom ? 'AND visit_date >= ?' : ''} 
         ${dateTo ? 'AND visit_date <= ?' : ''}) as total_visits,
        (SELECT COUNT(*) FROM lab_requests WHERE tenant_id = ? 
         ${dateFrom ? 'AND requested_at >= ?' : ''} 
         ${dateTo ? 'AND requested_at <= ?' : ''}) as total_lab_requests,
        (SELECT COUNT(DISTINCT diagnosis_code) FROM visit_diagnoses vd 
         JOIN visits v ON vd.visit_id = v.id WHERE v.tenant_id = ?
         ${dateFrom ? 'AND v.visit_date >= ?' : ''} 
         ${dateTo ? 'AND v.visit_date <= ?' : ''}) as unique_diagnoses`,
      [
        tenantId, tenantId, 
        ...(dateFrom ? [dateFrom] : []), 
        ...(dateTo ? [dateTo] : []),
        tenantId,
        ...(dateFrom ? [dateFrom] : []), 
        ...(dateTo ? [dateTo] : []),
        tenantId,
        ...(dateFrom ? [dateFrom] : []), 
        ...(dateTo ? [dateTo] : [])
      ]
    );

    const commonDiagnoses = await this.getCommonDiagnoses(tenantId, dateFrom, dateTo);
    const doctorProductivity = await this.getDoctorProductivity(tenantId, dateFrom, dateTo);
    const labVolumes = await this.getLabTestVolumes(tenantId, dateFrom, dateTo);

    return {
      overview: stats[0],
      top_diagnoses: commonDiagnoses.slice(0, 5),
      doctor_performance: doctorProductivity,
      lab_summary: labVolumes.slice(0, 5),
      report_period: {
        from: dateFrom,
        to: dateTo,
        generated_at: new Date().toISOString()
      }
    };
  }
}

module.exports = ClinicalReports;