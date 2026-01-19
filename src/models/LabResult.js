const TenantDB = require('../middleware/tenant');

class LabResult {
  static async create(tenantId, resultData) {
    const db = TenantDB.getConnection(tenantId);
    const [result] = await db.execute(
      `INSERT INTO lab_results (lab_request_id, technician_id, test_values, 
       normal_ranges, abnormal_flags, result_file, notes, completed_at, tenant_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [resultData.lab_request_id, resultData.technician_id, 
       JSON.stringify(resultData.test_values), JSON.stringify(resultData.normal_ranges),
       JSON.stringify(resultData.abnormal_flags), resultData.result_file,
       resultData.notes, tenantId]
    );

    // Update lab request status to completed
    await db.execute(
      'UPDATE lab_requests SET status = "completed", completed_at = NOW() WHERE id = ? AND tenant_id = ?',
      [resultData.lab_request_id, tenantId]
    );

    return { id: result.insertId, ...resultData };
  }

  static async findByLabRequest(tenantId, labRequestId) {
    const db = TenantDB.getConnection(tenantId);
    const [rows] = await db.execute(
      `SELECT lr.*, u.first_name as technician_first_name, u.last_name as technician_last_name
       FROM lab_results lr
       JOIN users u ON lr.technician_id = u.id
       WHERE lr.lab_request_id = ? AND lr.tenant_id = ?`,
      [labRequestId, tenantId]
    );
    return rows[0];
  }

  static async findByPatient(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [rows] = await db.execute(
      `SELECT lr.*, lreq.test_name, lreq.test_type, lreq.requested_at,
       u.first_name as technician_first_name, u.last_name as technician_last_name
       FROM lab_results lr
       JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
       JOIN users u ON lr.technician_id = u.id
       WHERE lreq.patient_id = ? AND lr.tenant_id = ?
       ORDER BY lr.completed_at DESC`,
      [patientId, tenantId]
    );
    return rows;
  }

  static async checkAbnormalValues(testValues, normalRanges) {
    const abnormalFlags = {};
    
    for (const [test, value] of Object.entries(testValues)) {
      if (normalRanges[test]) {
        const range = normalRanges[test];
        const numValue = parseFloat(value);
        
        if (!isNaN(numValue)) {
          if (range.min !== undefined && numValue < range.min) {
            abnormalFlags[test] = 'LOW';
          } else if (range.max !== undefined && numValue > range.max) {
            abnormalFlags[test] = 'HIGH';
          }
        }
      }
    }
    
    return abnormalFlags;
  }

  static getDefaultNormalRanges() {
    return {
      'Hemoglobin': { min: 12.0, max: 16.0, unit: 'g/dL' },
      'White Blood Cells': { min: 4.0, max: 11.0, unit: '10³/μL' },
      'Platelets': { min: 150, max: 450, unit: '10³/μL' },
      'Blood Glucose': { min: 70, max: 100, unit: 'mg/dL' },
      'Cholesterol': { min: 0, max: 200, unit: 'mg/dL' },
      'Creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL' },
      'ALT': { min: 7, max: 56, unit: 'U/L' },
      'AST': { min: 10, max: 40, unit: 'U/L' }
    };
  }

  static async getCriticalResults(tenantId) {
    const db = TenantDB.getConnection(tenantId);
    const [rows] = await db.execute(
      `SELECT lr.*, lreq.test_name, lreq.patient_id, p.first_name, p.last_name
       FROM lab_results lr
       JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
       JOIN patients p ON lreq.patient_id = p.id
       WHERE lr.tenant_id = ? AND JSON_LENGTH(lr.abnormal_flags) > 0
       AND DATE(lr.completed_at) = CURDATE()
       ORDER BY lr.completed_at DESC`,
      [tenantId]
    );
    return rows;
  }
}

module.exports = LabResult;