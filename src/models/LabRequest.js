const TenantDB = require('../middleware/tenant');

class LabRequest {
  static async create(tenantId, requestData) {
    const db = TenantDB.getConnection(tenantId);
    const [result] = await db.execute(
      `INSERT INTO lab_requests (patient_id, visit_id, doctor_id, test_type, test_name, 
       priority, status, notes, requested_at, tenant_id) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), ?)`,
      [requestData.patient_id, requestData.visit_id, requestData.doctor_id, 
       requestData.test_type, requestData.test_name, requestData.priority || 'normal',
       requestData.notes, tenantId]
    );
    return { id: result.insertId, ...requestData };
  }

  static async findByTenant(tenantId, filters = {}) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT lr.*, p.first_name, p.last_name, u.first_name as doctor_first_name, 
                 u.last_name as doctor_last_name FROM lab_requests lr
                 JOIN patients p ON lr.patient_id = p.id
                 JOIN users u ON lr.doctor_id = u.id
                 WHERE lr.tenant_id = ?`;
    const params = [tenantId];

    if (filters.status) {
      query += ' AND lr.status = ?';
      params.push(filters.status);
    }
    if (filters.patient_id) {
      query += ' AND lr.patient_id = ?';
      params.push(filters.patient_id);
    }
    if (filters.doctor_id) {
      query += ' AND lr.doctor_id = ?';
      params.push(filters.doctor_id);
    }

    query += ' ORDER BY lr.requested_at DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(tenantId, id) {
    const db = TenantDB.getConnection(tenantId);
    const [rows] = await db.execute(
      `SELECT lr.*, p.first_name, p.last_name FROM lab_requests lr
       JOIN patients p ON lr.patient_id = p.id
       WHERE lr.id = ? AND lr.tenant_id = ?`,
      [id, tenantId]
    );
    return rows[0];
  }

  static async updateStatus(tenantId, id, status, notes = null) {
    const db = TenantDB.getConnection(tenantId);
    const [result] = await db.execute(
      'UPDATE lab_requests SET status = ?, notes = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ?',
      [status, notes, id, tenantId]
    );
    return result.affectedRows > 0;
  }

  static async getLabTemplates() {
    return [
      { category: 'Hematology', tests: ['Complete Blood Count (CBC)', 'Hemoglobin', 'Hematocrit', 'Platelet Count'] },
      { category: 'Chemistry', tests: ['Blood Glucose', 'Cholesterol Panel', 'Liver Function Tests', 'Kidney Function Tests'] },
      { category: 'Urine', tests: ['Urinalysis', 'Urine Culture', 'Urine Microscopy'] },
      { category: 'Microbiology', tests: ['Blood Culture', 'Throat Swab', 'Stool Culture'] },
      { category: 'Serology', tests: ['Hepatitis Panel', 'HIV Test', 'Dengue Test'] }
    ];
  }

  static async getDashboardStats(tenantId) {
    const db = TenantDB.getConnection(tenantId);
    const [stats] = await db.execute(
      `SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_today,
        AVG(CASE WHEN status = 'completed' AND completed_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, requested_at, completed_at) END) as avg_turnaround_hours
       FROM lab_requests 
       WHERE tenant_id = ? AND DATE(requested_at) = CURDATE()`,
      [tenantId]
    );
    return stats[0];
  }
}

module.exports = LabRequest;