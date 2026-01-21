const db = require('../config/database');

class PatientHistory {
  // Get chronological visit timeline with summary cards
  static async getChronologicalTimeline(clinicId, patientId, filters = {}) {
    let query = `
      SELECT v.id, v.visit_date, v.status,
             u.full_name as doctor_name,
             COUNT(DISTINCT vd.id) as diagnosis_count,
             COUNT(DISTINCT lr.id) as lab_count,
             GROUP_CONCAT(DISTINCT vd.diagnosis_name SEPARATOR ', ') as diagnoses_summary
      FROM visits v
      LEFT JOIN auth_users u ON v.doctor_id = u.id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN lab_requests lreq ON v.id = lreq.visit_id
      LEFT JOIN lab_results lr ON lreq.id = lr.lab_request_id
      WHERE v.patient_id = ? AND v.clinic_id = ?
    `;
    
    const params = [patientId, clinicId];
    
    if (filters.dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(filters.dateTo);
    }
    
    query += ' GROUP BY v.id ORDER BY v.visit_date DESC';
    
    const [visits] = await db.execute(query, params);
    return visits;
  }

  // Get all diagnoses with grouping and timeline
  static async getDiagnosisHistory(clinicId, patientId, filters = {}) {
    let query = `
      SELECT vd.*, v.visit_date, u.full_name as doctor_name,
             vd.diagnosis_type, vd.diagnosis_code, vd.clinical_notes
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      LEFT JOIN auth_users u ON vd.diagnosed_by = u.id
      WHERE v.patient_id = ? AND v.clinic_id = ?
    `;
    
    const params = [patientId, clinicId];
    
    if (filters.diagnosisType) {
      query += ' AND vd.diagnosis_type = ?';
      params.push(filters.diagnosisType);
    }
    
    query += ' ORDER BY v.visit_date DESC, vd.diagnosis_type';
    
    const [diagnoses] = await db.execute(query, params);
    
    // Group by condition for trend analysis
    const grouped = {};
    diagnoses.forEach(d => {
      const key = d.diagnosis_name;
      if (!grouped[key]) {
        grouped[key] = {
          diagnosis_name: d.diagnosis_name,
          diagnosis_code: d.diagnosis_code,
          occurrences: [],
          first_diagnosed: d.visit_date,
          last_diagnosed: d.visit_date
        };
      }
      grouped[key].occurrences.push({
        visit_date: d.visit_date,
        diagnosis_type: d.diagnosis_type,
        clinical_notes: d.clinical_notes,
        doctor_name: d.doctor_name
      });
      if (d.visit_date < grouped[key].first_diagnosed) {
        grouped[key].first_diagnosed = d.visit_date;
      }
      if (d.visit_date > grouped[key].last_diagnosed) {
        grouped[key].last_diagnosed = d.visit_date;
      }
    });
    
    return { diagnoses, grouped: Object.values(grouped) };
  }

  // Get treatment history with medications and procedures
  static async getTreatmentHistory(clinicId, patientId) {
    const [medications] = await db.execute(`
      SELECT pm.*, u.full_name as prescribed_by_name
      FROM patient_medications pm
      LEFT JOIN auth_users u ON pm.prescribed_by = u.id
      WHERE pm.patient_id = ? AND pm.clinic_id = ?
      ORDER BY pm.start_date DESC
    `, [patientId, clinicId]);
    
    const [procedures] = await db.execute(`
      SELECT vn.*, v.visit_date, u.full_name as doctor_name
      FROM visit_notes vn
      JOIN visits v ON vn.visit_id = v.id
      LEFT JOIN auth_users u ON v.doctor_id = u.id
      WHERE v.patient_id = ? AND v.clinic_id = ? AND vn.note_type = 'treatment'
      ORDER BY v.visit_date DESC
    `, [patientId, clinicId]);
    
    return { medications, procedures };
  }

  // Get comprehensive lab results history with trending
  static async getLabResultsHistory(clinicId, patientId, filters = {}) {
    let query = `
      SELECT lr.*, lreq.request_number, lreq.request_date, lreq.urgency,
             lrd.parameter_name, lrd.result_value, lrd.unit, lrd.normal_range, lrd.is_abnormal,
             lt.test_name, lt.category,
             u1.full_name as requested_by_name,
             u2.full_name as entered_by_name
      FROM lab_results lr
      JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
      LEFT JOIN lab_result_details lrd ON lr.id = lrd.lab_result_id
      LEFT JOIN lab_tests lt ON lrd.lab_test_id = lt.id
      LEFT JOIN auth_users u1 ON lreq.requested_by = u1.id
      LEFT JOIN auth_users u2 ON lr.entered_by = u2.id
      WHERE lreq.patient_id = ? AND lreq.clinic_id = ?
    `;
    
    const params = [patientId, clinicId];
    
    if (filters.abnormalOnly) {
      query += ' AND lrd.is_abnormal = 1';
    }
    if (filters.testCategory) {
      query += ' AND lt.category = ?';
      params.push(filters.testCategory);
    }
    
    query += ' ORDER BY lr.result_date DESC';
    
    const [results] = await db.execute(query, params);
    
    // Group by test for trending
    const trending = {};
    results.forEach(r => {
      if (r.parameter_name) {
        const key = `${r.test_name}_${r.parameter_name}`;
        if (!trending[key]) {
          trending[key] = {
            test_name: r.test_name,
            parameter_name: r.parameter_name,
            unit: r.unit,
            normal_range: r.normal_range,
            values: []
          };
        }
        trending[key].values.push({
          date: r.result_date,
          value: r.result_value,
          is_abnormal: r.is_abnormal
        });
      }
    });
    
    return { results, trending: Object.values(trending) };
  }

  // Get medication history with timeline
  static async getMedicationHistory(clinicId, patientId) {
    const [medications] = await db.execute(`
      SELECT pm.*, u.full_name as prescribed_by_name
      FROM patient_medications pm
      LEFT JOIN auth_users u ON pm.prescribed_by = u.id
      WHERE pm.patient_id = ? AND pm.clinic_id = ?
      ORDER BY pm.start_date DESC
    `, [patientId, clinicId]);
    
    // Separate current vs past medications
    const current = medications.filter(m => m.status === 'active' && (!m.end_date || new Date(m.end_date) > new Date()));
    const past = medications.filter(m => m.status === 'discontinued' || (m.end_date && new Date(m.end_date) <= new Date()));
    
    return { current, past, all: medications };
  }

  // Get growth chart data for pediatric patients
  static async getGrowthChartData(clinicId, patientId) {
    const [growthData] = await db.execute(`
      SELECT vs.weight, vs.height, vs.bmi, v.visit_date,
             TIMESTAMPDIFF(MONTH, p.birth_date, v.visit_date) as age_months,
             TIMESTAMPDIFF(YEAR, p.birth_date, v.visit_date) as age_years,
             p.gender
      FROM visit_vital_signs vs
      JOIN visits v ON vs.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.patient_id = ? AND v.clinic_id = ?
      AND (vs.weight IS NOT NULL OR vs.height IS NOT NULL)
      ORDER BY v.visit_date ASC
    `, [patientId, clinicId]);
    
    // Calculate percentiles and growth trends
    const trends = {
      weight: [],
      height: [],
      bmi: []
    };
    
    growthData.forEach(point => {
      if (point.weight) trends.weight.push({ date: point.visit_date, value: point.weight, age_months: point.age_months });
      if (point.height) trends.height.push({ date: point.visit_date, value: point.height, age_months: point.age_months });
      if (point.bmi) trends.bmi.push({ date: point.visit_date, value: point.bmi, age_months: point.age_months });
    });
    
    return { raw_data: growthData, trends, gender: growthData[0]?.gender };
  }

  // Get complete patient history with all sections
  static async getCompleteHistory(clinicId, patientId, filters = {}) {
    const [timeline, diagnosisHistory, treatmentHistory, labHistory, medicationHistory, growthData] = await Promise.all([
      this.getChronologicalTimeline(clinicId, patientId, filters),
      this.getDiagnosisHistory(clinicId, patientId, filters),
      this.getTreatmentHistory(clinicId, patientId),
      this.getLabResultsHistory(clinicId, patientId, filters),
      this.getMedicationHistory(clinicId, patientId),
      this.getGrowthChartData(clinicId, patientId)
    ]);

    // Get patient basic info
    const [patientInfo] = await db.execute(`
      SELECT p.*, 
             COUNT(DISTINCT v.id) as total_visits,
             MAX(v.visit_date) as last_visit_date,
             MIN(v.visit_date) as first_visit_date
      FROM patients p
      LEFT JOIN visits v ON p.id = v.patient_id
      WHERE p.id = ? AND p.clinic_id = ?
      GROUP BY p.id
    `, [patientId, clinicId]);

    return {
      patient: patientInfo[0] || null,
      timeline,
      diagnoses: diagnosisHistory,
      treatments: treatmentHistory,
      lab_results: labHistory,
      medications: medicationHistory,
      growth_data: growthData
    };
  }

  // Search functionality
  static async searchByDiagnosis(clinicId, diagnosisQuery, filters = {}) {
    let query = `
      SELECT DISTINCT p.id, p.patient_code, p.full_name, p.birth_date,
             vd.diagnosis_name, vd.diagnosis_code, v.visit_date,
             u.full_name as doctor_name
      FROM patients p
      JOIN visits v ON p.id = v.patient_id
      JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN auth_users u ON vd.diagnosed_by = u.id
      WHERE p.clinic_id = ? AND (
        vd.diagnosis_name LIKE ? OR 
        vd.diagnosis_code LIKE ?
      )
    `;
    
    const params = [clinicId, `%${diagnosisQuery}%`, `%${diagnosisQuery}%`];
    
    if (filters.dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(filters.dateTo);
    }
    if (filters.doctorId) {
      query += ' AND vd.diagnosed_by = ?';
      params.push(filters.doctorId);
    }
    
    query += ' ORDER BY v.visit_date DESC';
    
    const [results] = await db.execute(query, params);
    return results;
  }

  // Filter by date range
  static async filterByDateRange(clinicId, patientId, dateFrom, dateTo) {
    return this.getCompleteHistory(clinicId, patientId, { dateFrom, dateTo });
  }
}

module.exports = PatientHistory;