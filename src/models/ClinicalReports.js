const db = require('../config/database');

class ClinicalReports {
  // Get common diagnoses report (ICD-10 compatible)
  static async getCommonDiagnoses(clinicId, dateFrom, dateTo, limit = 20) {
    let query = `
      SELECT 
        vd.diagnosis_name,
        vd.diagnosis_code,
        COUNT(*) as frequency,
        COUNT(DISTINCT vd.visit_id) as unique_visits,
        COUNT(DISTINCT p.id) as unique_patients,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM visit_diagnoses vd2 
          JOIN visits v2 ON vd2.visit_id = v2.id 
          WHERE v2.clinic_id = ?), 2) as percentage
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.clinic_id = ?
    `;
    
    const params = [clinicId, clinicId];
    
    if (dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY vd.diagnosis_name, vd.diagnosis_code
      ORDER BY frequency DESC
      LIMIT ?
    `;
    params.push(limit);
    
    const [diagnoses] = await db.execute(query, params);
    return diagnoses;
  }

  // Implement diagnosis frequency analysis with demographics
  static async getDiagnosisFrequencyAnalysis(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        vd.diagnosis_name,
        vd.diagnosis_code,
        p.gender,
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) < 18 THEN 'pediatric'
          WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) < 65 THEN 'adult'
          ELSE 'senior'
        END as age_group,
        COUNT(*) as frequency,
        AVG(TIMESTAMPDIFF(YEAR, p.birth_date, v.visit_date)) as avg_age
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY vd.diagnosis_name, vd.diagnosis_code, p.gender, age_group
      ORDER BY vd.diagnosis_name, frequency DESC
    `;
    
    const [analysis] = await db.execute(query, params);
    return analysis;
  }

  // Add seasonal diagnosis trending
  static async getSeasonalDiagnosisTrends(clinicId, year) {
    const query = `
      SELECT 
        vd.diagnosis_name,
        MONTH(v.visit_date) as month,
        MONTHNAME(v.visit_date) as month_name,
        COUNT(*) as frequency,
        COUNT(DISTINCT p.id) as unique_patients
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.clinic_id = ? AND YEAR(v.visit_date) = ?
      GROUP BY vd.diagnosis_name, MONTH(v.visit_date), MONTHNAME(v.visit_date)
      ORDER BY vd.diagnosis_name, month
    `;
    
    const [trends] = await db.execute(query, [clinicId, year]);
    
    // Group by diagnosis for easier consumption
    const grouped = {};
    trends.forEach(trend => {
      if (!grouped[trend.diagnosis_name]) {
        grouped[trend.diagnosis_name] = {
          diagnosis_name: trend.diagnosis_name,
          monthly_data: []
        };
      }
      grouped[trend.diagnosis_name].monthly_data.push({
        month: trend.month,
        month_name: trend.month_name,
        frequency: trend.frequency,
        unique_patients: trend.unique_patients
      });
    });
    
    return Object.values(grouped);
  }

  // Disease prevalence analytics
  static async getDiseasePrevalence(clinicId, category = null) {
    let query = `
      SELECT 
        vd.diagnosis_name,
        vd.diagnosis_code,
        COUNT(DISTINCT p.id) as affected_patients,
        (SELECT COUNT(DISTINCT id) FROM patients WHERE clinic_id = ?) as total_patients,
        ROUND(COUNT(DISTINCT p.id) * 100.0 / (SELECT COUNT(DISTINCT id) FROM patients WHERE clinic_id = ?), 2) as prevalence_rate,
        MIN(v.visit_date) as first_occurrence,
        MAX(v.visit_date) as last_occurrence,
        COUNT(*) as total_diagnoses
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.clinic_id = ?
    `;
    
    const params = [clinicId, clinicId, clinicId];
    
    if (category) {
      // This would require a diagnosis_categories table or ICD-10 category mapping
      query += ' AND vd.diagnosis_code LIKE ?';
      params.push(`${category}%`);
    }
    
    query += `
      GROUP BY vd.diagnosis_name, vd.diagnosis_code
      HAVING affected_patients >= 2
      ORDER BY prevalence_rate DESC
    `;
    
    const [prevalence] = await db.execute(query, params);
    return prevalence;
  }

  // Chronic disease management tracking
  static async getChronicDiseaseTracking(clinicId) {
    const query = `
      SELECT 
        p.id as patient_id,
        p.patient_code,
        p.full_name,
        vd.diagnosis_name,
        vd.diagnosis_code,
        COUNT(DISTINCT v.id) as visit_count,
        MIN(v.visit_date) as first_diagnosis,
        MAX(v.visit_date) as last_visit,
        DATEDIFF(MAX(v.visit_date), MIN(v.visit_date)) as management_duration_days,
        COUNT(DISTINCT lr.id) as lab_tests_ordered
      FROM patients p
      JOIN visits v ON p.id = v.patient_id
      JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN lab_requests lr ON v.id = lr.visit_id
      WHERE p.clinic_id = ?
      GROUP BY p.id, vd.diagnosis_name, vd.diagnosis_code
      HAVING visit_count >= 3
      ORDER BY p.full_name, management_duration_days DESC
    `;
    
    const [chronic] = await db.execute(query, [clinicId]);
    return chronic;
  }

  // Lab test volume reporting
  static async getLabTestVolumes(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        lt.test_name,
        lt.category,
        COUNT(DISTINCT lr.id) as requests_count,
        COUNT(DISTINCT lres.id) as completed_count,
        COUNT(DISTINCT CASE WHEN lrd.is_abnormal = 1 THEN lres.id END) as abnormal_results,
        ROUND(COUNT(DISTINCT lres.id) * 100.0 / COUNT(DISTINCT lr.id), 2) as completion_rate,
        ROUND(COUNT(DISTINCT CASE WHEN lrd.is_abnormal = 1 THEN lres.id END) * 100.0 / COUNT(DISTINCT lres.id), 2) as abnormal_rate,
        AVG(DATEDIFF(lres.result_date, lr.request_date)) as avg_turnaround_days
      FROM lab_tests lt
      JOIN lab_request_items lri ON lt.id = lri.lab_test_id
      JOIN lab_requests lr ON lri.lab_request_id = lr.id
      LEFT JOIN lab_results lres ON lr.id = lres.lab_request_id
      LEFT JOIN lab_result_details lrd ON lres.id = lrd.lab_result_id AND lt.id = lrd.lab_test_id
      WHERE lr.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND lr.request_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND lr.request_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY lt.id, lt.test_name, lt.category
      ORDER BY requests_count DESC
    `;
    
    const [volumes] = await db.execute(query, params);
    return volumes;
  }

  // Lab revenue analytics
  static async getLabRevenue(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        lt.test_name,
        lt.category,
        lt.price,
        COUNT(DISTINCT lr.id) as tests_ordered,
        COUNT(DISTINCT lres.id) as tests_completed,
        SUM(lt.price) as potential_revenue,
        SUM(CASE WHEN lres.id IS NOT NULL THEN lt.price ELSE 0 END) as actual_revenue,
        ROUND(SUM(CASE WHEN lres.id IS NOT NULL THEN lt.price ELSE 0 END) * 100.0 / SUM(lt.price), 2) as revenue_realization_rate
      FROM lab_tests lt
      JOIN lab_request_items lri ON lt.id = lri.lab_test_id
      JOIN lab_requests lr ON lri.lab_request_id = lr.id
      LEFT JOIN lab_results lres ON lr.id = lres.lab_request_id
      WHERE lr.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND lr.request_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND lr.request_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY lt.id, lt.test_name, lt.category, lt.price
      ORDER BY actual_revenue DESC
    `;
    
    const [revenue] = await db.execute(query, params);
    return revenue;
  }

  // Lab turnaround time analysis
  static async getLabTurnaroundAnalysis(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        lt.test_name,
        lt.category,
        lr.urgency,
        COUNT(*) as total_tests,
        AVG(DATEDIFF(lres.result_date, lr.request_date)) as avg_turnaround_days,
        MIN(DATEDIFF(lres.result_date, lr.request_date)) as min_turnaround_days,
        MAX(DATEDIFF(lres.result_date, lr.request_date)) as max_turnaround_days,
        COUNT(CASE WHEN DATEDIFF(lres.result_date, lr.request_date) <= 1 THEN 1 END) as same_day_results,
        ROUND(COUNT(CASE WHEN DATEDIFF(lres.result_date, lr.request_date) <= 1 THEN 1 END) * 100.0 / COUNT(*), 2) as same_day_percentage
      FROM lab_tests lt
      JOIN lab_request_items lri ON lt.id = lri.lab_test_id
      JOIN lab_requests lr ON lri.lab_request_id = lr.id
      JOIN lab_results lres ON lr.id = lres.lab_request_id
      WHERE lr.clinic_id = ? AND lres.result_date IS NOT NULL
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND lr.request_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND lr.request_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY lt.test_name, lt.category, lr.urgency
      ORDER BY avg_turnaround_days ASC
    `;
    
    const [analysis] = await db.execute(query, params);
    return analysis;
  }

  // Get clinic overview analytics
  static async getClinicOverview(clinicId, dateFrom, dateTo) {
    const params = [clinicId];
    let dateFilter = '';
    
    if (dateFrom || dateTo) {
      if (dateFrom) {
        dateFilter += ' AND v.visit_date >= ?';
        params.push(dateFrom);
      }
      if (dateTo) {
        dateFilter += ' AND v.visit_date <= ?';
        params.push(dateTo);
      }
    }

    // Get basic stats
    const [basicStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT p.id) as total_patients,
        COUNT(DISTINCT v.id) as total_visits,
        COUNT(DISTINCT vd.id) as total_diagnoses,
        COUNT(DISTINCT lr.id) as total_lab_requests,
        COUNT(DISTINCT lres.id) as completed_lab_results
      FROM patients p
      LEFT JOIN visits v ON p.id = v.patient_id ${dateFilter}
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN lab_requests lr ON v.id = lr.visit_id
      LEFT JOIN lab_results lres ON lr.id = lres.lab_request_id
      WHERE p.clinic_id = ?
    `, params);

    // Get top diagnoses
    const topDiagnoses = await this.getCommonDiagnoses(clinicId, dateFrom, dateTo, 10);

    // Get lab performance
    const labPerformance = await this.getLabTestVolumes(clinicId, dateFrom, dateTo);

    return {
      basic_stats: basicStats[0],
      top_diagnoses: topDiagnoses,
      lab_performance: labPerformance.slice(0, 10),
      date_range: { from: dateFrom, to: dateTo }
    };
  }

  // Doctor productivity metrics
  static async getDoctorProductivity(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        u.id as doctor_id,
        u.full_name as doctor_name,
        COUNT(DISTINCT v.id) as total_visits,
        COUNT(DISTINCT v.patient_id) as unique_patients,
        COUNT(DISTINCT vd.id) as total_diagnoses,
        COUNT(DISTINCT lr.id) as lab_requests_made,
        ROUND(COUNT(DISTINCT v.id) / COUNT(DISTINCT DATE(v.visit_date)), 2) as avg_visits_per_day,
        ROUND(COUNT(DISTINCT vd.id) / COUNT(DISTINCT v.id), 2) as avg_diagnoses_per_visit,
        MIN(v.visit_date) as first_visit_date,
        MAX(v.visit_date) as last_visit_date
      FROM auth_users u
      JOIN visits v ON u.id = v.doctor_id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN lab_requests lr ON v.id = lr.visit_id
      WHERE u.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY u.id, u.full_name
      HAVING total_visits > 0
      ORDER BY total_visits DESC
    `;
    
    const [productivity] = await db.execute(query, params);
    return productivity;
  }

  // Appointment efficiency tracking
  static async getAppointmentEfficiency(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        u.id as doctor_id,
        u.full_name as doctor_name,
        COUNT(DISTINCT a.id) as total_appointments,
        COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
        COUNT(DISTINCT CASE WHEN a.status = 'no_show' THEN a.id END) as no_shows,
        COUNT(DISTINCT CASE WHEN a.status = 'cancelled' THEN a.id END) as cancelled,
        ROUND(COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) * 100.0 / COUNT(DISTINCT a.id), 2) as completion_rate,
        ROUND(COUNT(DISTINCT CASE WHEN a.status = 'no_show' THEN a.id END) * 100.0 / COUNT(DISTINCT a.id), 2) as no_show_rate
      FROM auth_users u
      JOIN appointments a ON u.id = a.doctor_id
      WHERE u.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND a.scheduled_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND a.scheduled_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY u.id, u.full_name
      HAVING total_appointments > 0
      ORDER BY completion_rate DESC
    `;
    
    const [efficiency] = await db.execute(query, params);
    return efficiency;
  }

  // Clinical documentation completeness
  static async getDocumentationCompleteness(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        u.id as doctor_id,
        u.full_name as doctor_name,
        COUNT(DISTINCT v.id) as total_visits,
        COUNT(DISTINCT vd.id) as visits_with_diagnosis,
        COUNT(DISTINCT vn.id) as visits_with_notes,
        COUNT(DISTINCT vs.id) as visits_with_vitals,
        ROUND(COUNT(DISTINCT vd.id) * 100.0 / COUNT(DISTINCT v.id), 2) as diagnosis_completion_rate,
        ROUND(COUNT(DISTINCT vn.id) * 100.0 / COUNT(DISTINCT v.id), 2) as notes_completion_rate,
        ROUND(COUNT(DISTINCT vs.id) * 100.0 / COUNT(DISTINCT v.id), 2) as vitals_completion_rate
      FROM auth_users u
      JOIN visits v ON u.id = v.doctor_id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN visit_notes vn ON v.id = vn.visit_id
      LEFT JOIN visit_vital_signs vs ON v.id = vs.visit_id
      WHERE u.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY u.id, u.full_name
      HAVING total_visits > 0
      ORDER BY diagnosis_completion_rate DESC
    `;
    
    const [completeness] = await db.execute(query, params);
    return completeness;
  }

  // Follow-up compliance tracking
  static async getFollowUpCompliance(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        p.id as patient_id,
        p.patient_code,
        p.full_name as patient_name,
        vd.diagnosis_name,
        COUNT(DISTINCT v.id) as total_visits,
        MIN(v.visit_date) as first_visit,
        MAX(v.visit_date) as last_visit,
        DATEDIFF(MAX(v.visit_date), MIN(v.visit_date)) as follow_up_duration_days,
        CASE 
          WHEN COUNT(DISTINCT v.id) >= 3 THEN 'Good'
          WHEN COUNT(DISTINCT v.id) = 2 THEN 'Fair'
          ELSE 'Poor'
        END as compliance_level
      FROM patients p
      JOIN visits v ON p.id = v.patient_id
      JOIN visit_diagnoses vd ON v.id = vd.visit_id
      WHERE p.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(dateTo);
    }
    
    query += `
      GROUP BY p.id, vd.diagnosis_name
      HAVING total_visits >= 2
      ORDER BY compliance_level DESC, total_visits DESC
    `;
    
    const [compliance] = await db.execute(query, params);
    return compliance;
  }

  // Clinical quality indicators
  static async getClinicalQualityIndicators(clinicId, dateFrom, dateTo) {
    const params = [clinicId];
    let dateFilter = '';
    
    if (dateFrom || dateTo) {
      if (dateFrom) {
        dateFilter += ' AND v.visit_date >= ?';
        params.push(dateFrom);
      }
      if (dateTo) {
        dateFilter += ' AND v.visit_date <= ?';
        params.push(dateTo);
      }
    }

    // Get quality metrics
    const [qualityMetrics] = await db.execute(`
      SELECT 
        COUNT(DISTINCT v.id) as total_visits,
        COUNT(DISTINCT CASE WHEN vd.id IS NOT NULL THEN v.id END) as visits_with_diagnosis,
        COUNT(DISTINCT CASE WHEN vs.id IS NOT NULL THEN v.id END) as visits_with_vitals,
        COUNT(DISTINCT CASE WHEN lr.id IS NOT NULL THEN v.id END) as visits_with_labs,
        COUNT(DISTINCT CASE WHEN lrd.is_abnormal = 1 THEN lr.id END) as abnormal_lab_results,
        COUNT(DISTINCT lr.id) as total_lab_requests,
        ROUND(COUNT(DISTINCT CASE WHEN vd.id IS NOT NULL THEN v.id END) * 100.0 / COUNT(DISTINCT v.id), 2) as diagnosis_rate,
        ROUND(COUNT(DISTINCT CASE WHEN vs.id IS NOT NULL THEN v.id END) * 100.0 / COUNT(DISTINCT v.id), 2) as vitals_documentation_rate,
        ROUND(COUNT(DISTINCT CASE WHEN lrd.is_abnormal = 1 THEN lr.id END) * 100.0 / COUNT(DISTINCT lr.id), 2) as abnormal_result_rate
      FROM visits v
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN visit_vital_signs vs ON v.id = vs.visit_id
      LEFT JOIN lab_requests lr ON v.id = lr.visit_id
      LEFT JOIN lab_results lres ON lr.id = lres.lab_request_id
      LEFT JOIN lab_result_details lrd ON lres.id = lrd.lab_result_id
      WHERE v.clinic_id = ? ${dateFilter}
    `, params);

    return qualityMetrics[0];
  }
}

module.exports = ClinicalReports;