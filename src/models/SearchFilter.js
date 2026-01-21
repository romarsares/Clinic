const db = require('../config/database');

class SearchFilter {
  // Advanced search across multiple criteria
  static async advancedSearch(clinicId, criteria) {
    let query = `
      SELECT DISTINCT p.id, p.patient_code, p.full_name, p.birth_date, p.gender,
             v.visit_date, v.id as visit_id,
             vd.diagnosis_name, vd.diagnosis_code,
             u.full_name as doctor_name
      FROM patients p
      LEFT JOIN visits v ON p.id = v.patient_id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN auth_users u ON v.doctor_id = u.id
      WHERE p.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    // Diagnosis filter
    if (criteria.diagnosis) {
      query += ' AND (vd.diagnosis_name LIKE ? OR vd.diagnosis_code LIKE ?)';
      params.push(`%${criteria.diagnosis}%`, `%${criteria.diagnosis}%`);
    }
    
    // Lab test filter
    if (criteria.lab_test) {
      query += ` AND EXISTS (
        SELECT 1 FROM lab_requests lr 
        JOIN lab_tests lt ON lr.id = lr.id 
        WHERE lr.patient_id = p.id AND lt.test_name LIKE ?
      )`;
      params.push(`%${criteria.lab_test}%`);
    }
    
    // Age range filter
    if (criteria.age_min !== null || criteria.age_max !== null) {
      const currentDate = new Date();
      
      if (criteria.age_min !== null) {
        const maxBirthDate = new Date(currentDate.getFullYear() - criteria.age_min, currentDate.getMonth(), currentDate.getDate());
        query += ' AND p.birth_date <= ?';
        params.push(maxBirthDate.toISOString().split('T')[0]);
      }
      
      if (criteria.age_max !== null) {
        const minBirthDate = new Date(currentDate.getFullYear() - criteria.age_max - 1, currentDate.getMonth(), currentDate.getDate());
        query += ' AND p.birth_date > ?';
        params.push(minBirthDate.toISOString().split('T')[0]);
      }
    }
    
    // Gender filter
    if (criteria.gender) {
      query += ' AND p.gender = ?';
      params.push(criteria.gender);
    }
    
    // Date range filter
    if (criteria.date_from) {
      query += ' AND v.visit_date >= ?';
      params.push(criteria.date_from);
    }
    if (criteria.date_to) {
      query += ' AND v.visit_date <= ?';
      params.push(criteria.date_to);
    }
    
    // Doctor filter
    if (criteria.doctor_id) {
      query += ' AND v.doctor_id = ?';
      params.push(criteria.doctor_id);
    }
    
    query += ' ORDER BY v.visit_date DESC, p.full_name';
    
    const [results] = await db.execute(query, params);
    return results;
  }

  // Search by diagnosis with filters
  static async searchByDiagnosis(clinicId, diagnosisQuery, filters = {}) {
    let query = `
      SELECT DISTINCT p.id, p.patient_code, p.full_name, p.birth_date,
             vd.diagnosis_name, vd.diagnosis_code, vd.diagnosis_type,
             v.visit_date, v.id as visit_id,
             u.full_name as doctor_name,
             TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as current_age
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
    
    if (filters.date_from) {
      query += ' AND v.visit_date >= ?';
      params.push(filters.date_from);
    }
    if (filters.date_to) {
      query += ' AND v.visit_date <= ?';
      params.push(filters.date_to);
    }
    if (filters.doctor_id) {
      query += ' AND vd.diagnosed_by = ?';
      params.push(filters.doctor_id);
    }
    if (filters.diagnosis_type) {
      query += ' AND vd.diagnosis_type = ?';
      params.push(filters.diagnosis_type);
    }
    
    query += ' ORDER BY v.visit_date DESC';
    
    const [results] = await db.execute(query, params);
    return results;
  }

  // Filter by lab results
  static async filterByLabResults(clinicId, filters = {}) {
    let query = `
      SELECT DISTINCT p.id, p.patient_code, p.full_name, p.birth_date,
             lr.result_date, lreq.request_number,
             lt.test_name, lt.category,
             lrd.parameter_name, lrd.result_value, lrd.is_abnormal,
             u1.full_name as requested_by_name,
             u2.full_name as entered_by_name
      FROM patients p
      JOIN lab_requests lreq ON p.id = lreq.patient_id
      JOIN lab_results lr ON lreq.id = lr.lab_request_id
      LEFT JOIN lab_result_details lrd ON lr.id = lrd.lab_result_id
      LEFT JOIN lab_tests lt ON lrd.lab_test_id = lt.id
      LEFT JOIN auth_users u1 ON lreq.requested_by = u1.id
      LEFT JOIN auth_users u2 ON lr.entered_by = u2.id
      WHERE p.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (filters.test_name) {
      query += ' AND lt.test_name LIKE ?';
      params.push(`%${filters.test_name}%`);
    }
    if (filters.test_category) {
      query += ' AND lt.category = ?';
      params.push(filters.test_category);
    }
    if (filters.abnormal_only) {
      query += ' AND lrd.is_abnormal = 1';
    }
    if (filters.date_from) {
      query += ' AND lr.result_date >= ?';
      params.push(filters.date_from);
    }
    if (filters.date_to) {
      query += ' AND lr.result_date <= ?';
      params.push(filters.date_to);
    }
    
    query += ' ORDER BY lr.result_date DESC';
    
    const [results] = await db.execute(query, params);
    return results;
  }

  // Filter by visit type
  static async filterByVisitType(clinicId, filters = {}) {
    let query = `
      SELECT v.*, p.patient_code, p.full_name as patient_name,
             u.full_name as doctor_name,
             COUNT(DISTINCT vd.id) as diagnosis_count,
             COUNT(DISTINCT lreq.id) as lab_request_count
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      LEFT JOIN auth_users u ON v.doctor_id = u.id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN lab_requests lreq ON v.id = lreq.visit_id
      WHERE v.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (filters.doctor_id) {
      query += ' AND v.doctor_id = ?';
      params.push(filters.doctor_id);
    }
    if (filters.status) {
      query += ' AND v.status = ?';
      params.push(filters.status);
    }
    if (filters.date_from) {
      query += ' AND v.visit_date >= ?';
      params.push(filters.date_from);
    }
    if (filters.date_to) {
      query += ' AND v.visit_date <= ?';
      params.push(filters.date_to);
    }
    if (filters.has_diagnosis) {
      query += ' AND EXISTS (SELECT 1 FROM visit_diagnoses WHERE visit_id = v.id)';
    }
    if (filters.has_lab_requests) {
      query += ' AND EXISTS (SELECT 1 FROM lab_requests WHERE visit_id = v.id)';
    }
    
    query += ' GROUP BY v.id ORDER BY v.visit_date DESC';
    
    const [results] = await db.execute(query, params);
    return results;
  }

  // Multi-criteria search with demographics
  static async searchWithDemographics(clinicId, criteria) {
    let query = `
      SELECT DISTINCT p.*, 
             TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as current_age,
             COUNT(DISTINCT v.id) as total_visits,
             MAX(v.visit_date) as last_visit_date,
             COUNT(DISTINCT vd.id) as total_diagnoses,
             COUNT(DISTINCT lreq.id) as total_lab_requests
      FROM patients p
      LEFT JOIN visits v ON p.id = v.patient_id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN lab_requests lreq ON v.id = lreq.visit_id
      WHERE p.clinic_id = ?
    `;
    
    const params = [clinicId];
    
    // Name search
    if (criteria.name) {
      query += ' AND p.full_name LIKE ?';
      params.push(`%${criteria.name}%`);
    }
    
    // Patient code search
    if (criteria.patient_code) {
      query += ' AND p.patient_code LIKE ?';
      params.push(`%${criteria.patient_code}%`);
    }
    
    // Gender filter
    if (criteria.gender) {
      query += ' AND p.gender = ?';
      params.push(criteria.gender);
    }
    
    // Age range
    if (criteria.age_min !== null || criteria.age_max !== null) {
      const currentDate = new Date();
      
      if (criteria.age_min !== null) {
        const maxBirthDate = new Date(currentDate.getFullYear() - criteria.age_min, currentDate.getMonth(), currentDate.getDate());
        query += ' AND p.birth_date <= ?';
        params.push(maxBirthDate.toISOString().split('T')[0]);
      }
      
      if (criteria.age_max !== null) {
        const minBirthDate = new Date(currentDate.getFullYear() - criteria.age_max - 1, currentDate.getMonth(), currentDate.getDate());
        query += ' AND p.birth_date > ?';
        params.push(minBirthDate.toISOString().split('T')[0]);
      }
    }
    
    // Contact information
    if (criteria.contact_number) {
      query += ' AND p.contact_number LIKE ?';
      params.push(`%${criteria.contact_number}%`);
    }
    
    if (criteria.email) {
      query += ' AND p.email LIKE ?';
      params.push(`%${criteria.email}%`);
    }
    
    query += ' GROUP BY p.id ORDER BY p.full_name';
    
    const [results] = await db.execute(query, params);
    return results;
  }

  // Get saved filter preferences for a user
  static async getSavedFilters(clinicId, userId) {
    const [filters] = await db.execute(`
      SELECT * FROM user_saved_filters 
      WHERE clinic_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `, [clinicId, userId]);
    
    return filters;
  }

  // Save filter preferences
  static async saveFilter(clinicId, userId, filterData) {
    const { name, filter_criteria, description } = filterData;
    
    const [result] = await db.execute(`
      INSERT INTO user_saved_filters (clinic_id, user_id, filter_name, filter_criteria, description, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [clinicId, userId, name, JSON.stringify(filter_criteria), description]);
    
    return result.insertId;
  }
}

module.exports = SearchFilter;