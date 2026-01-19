const TenantDB = require('../middleware/tenant');

class SearchFilter {
  static async searchByDiagnosis(tenantId, diagnosisQuery, filters = {}) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT DISTINCT p.id, p.first_name, p.last_name, p.date_of_birth,
                 vd.diagnosis_code, vd.diagnosis_description, v.visit_date,
                 u.first_name as doctor_first_name, u.last_name as doctor_last_name
                 FROM patients p
                 JOIN visits v ON p.id = v.patient_id
                 JOIN visit_diagnoses vd ON v.id = vd.visit_id
                 JOIN users u ON v.doctor_id = u.id
                 WHERE p.tenant_id = ? AND (vd.diagnosis_code LIKE ? OR vd.diagnosis_description LIKE ?)`;
    
    const params = [tenantId, `%${diagnosisQuery}%`, `%${diagnosisQuery}%`];

    if (filters.date_from) {
      query += ' AND v.visit_date >= ?';
      params.push(filters.date_from);
    }
    if (filters.date_to) {
      query += ' AND v.visit_date <= ?';
      params.push(filters.date_to);
    }
    if (filters.doctor_id) {
      query += ' AND v.doctor_id = ?';
      params.push(filters.doctor_id);
    }

    query += ' ORDER BY v.visit_date DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async filterByDateRange(tenantId, patientId, dateFrom, dateTo, recordType = 'visits') {
    const db = TenantDB.getConnection(tenantId);
    let query, params;

    switch (recordType) {
      case 'visits':
        query = `SELECT v.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
                 FROM visits v
                 JOIN users u ON v.doctor_id = u.id
                 WHERE v.patient_id = ? AND v.tenant_id = ? AND v.visit_date BETWEEN ? AND ?
                 ORDER BY v.visit_date DESC`;
        params = [patientId, tenantId, dateFrom, dateTo];
        break;
      case 'lab_results':
        query = `SELECT lr.*, lreq.test_name, lreq.test_type, lreq.requested_at
                 FROM lab_results lr
                 JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
                 WHERE lreq.patient_id = ? AND lr.tenant_id = ? AND lr.completed_at BETWEEN ? AND ?
                 ORDER BY lr.completed_at DESC`;
        params = [patientId, tenantId, dateFrom, dateTo];
        break;
      case 'vaccines':
        query = `SELECT * FROM patient_vaccines 
                 WHERE patient_id = ? AND tenant_id = ? AND administered_date BETWEEN ? AND ?
                 ORDER BY administered_date DESC`;
        params = [patientId, tenantId, dateFrom, dateTo];
        break;
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findSpecificLabResults(tenantId, patientId, testName) {
    const db = TenantDB.getConnection(tenantId);
    const [rows] = await db.execute(
      `SELECT lr.*, lreq.test_name, lreq.test_type, lreq.requested_at,
       u.first_name as technician_first_name, u.last_name as technician_last_name
       FROM lab_results lr
       JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
       JOIN users u ON lr.technician_id = u.id
       WHERE lreq.patient_id = ? AND lr.tenant_id = ? AND lreq.test_name LIKE ?
       ORDER BY lr.completed_at DESC`,
      [patientId, tenantId, `%${testName}%`]
    );
    return rows;
  }

  static async filterByDoctor(tenantId, doctorId, recordType = 'visits', dateFrom = null, dateTo = null) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT v.*, p.first_name, p.last_name, p.date_of_birth
                 FROM visits v
                 JOIN patients p ON v.patient_id = p.id
                 WHERE v.doctor_id = ? AND v.tenant_id = ?`;
    
    const params = [doctorId, tenantId];

    if (dateFrom) {
      query += ' AND v.visit_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND v.visit_date <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY v.visit_date DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async searchPatients(tenantId, searchQuery) {
    const db = TenantDB.getConnection(tenantId);
    const [rows] = await db.execute(
      `SELECT id, first_name, last_name, date_of_birth, phone, email
       FROM patients 
       WHERE tenant_id = ? AND (
         first_name LIKE ? OR 
         last_name LIKE ? OR 
         phone LIKE ? OR 
         email LIKE ?
       )
       ORDER BY first_name, last_name`,
      [tenantId, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
    );
    return rows;
  }

  static async advancedSearch(tenantId, criteria) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT DISTINCT p.id, p.first_name, p.last_name, p.date_of_birth, p.phone
                 FROM patients p`;
    let joins = [];
    let conditions = ['p.tenant_id = ?'];
    let params = [tenantId];

    if (criteria.diagnosis) {
      joins.push('JOIN visits v ON p.id = v.patient_id');
      joins.push('JOIN visit_diagnoses vd ON v.id = vd.visit_id');
      conditions.push('(vd.diagnosis_code LIKE ? OR vd.diagnosis_description LIKE ?)');
      params.push(`%${criteria.diagnosis}%`, `%${criteria.diagnosis}%`);
    }

    if (criteria.lab_test) {
      joins.push('JOIN visits v2 ON p.id = v2.patient_id');
      joins.push('JOIN lab_requests lr ON v2.id = lr.visit_id');
      conditions.push('lr.test_name LIKE ?');
      params.push(`%${criteria.lab_test}%`);
    }

    if (criteria.age_min || criteria.age_max) {
      if (criteria.age_min) {
        conditions.push('TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) >= ?');
        params.push(criteria.age_min);
      }
      if (criteria.age_max) {
        conditions.push('TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) <= ?');
        params.push(criteria.age_max);
      }
    }

    if (joins.length > 0) {
      query += ' ' + joins.join(' ');
    }
    query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY p.first_name, p.last_name';

    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = SearchFilter;