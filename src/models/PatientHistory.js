const TenantDB = require('../middleware/tenant');

class PatientHistory {
  static async getChronologicalTimeline(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [visits] = await db.execute(
      `SELECT v.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM visits v
       JOIN users u ON v.doctor_id = u.id
       WHERE v.patient_id = ? AND v.tenant_id = ?
       ORDER BY v.visit_date DESC`,
      [patientId, tenantId]
    );
    return visits;
  }

  static async getAllDiagnoses(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [diagnoses] = await db.execute(
      `SELECT vd.*, v.visit_date, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM visit_diagnoses vd
       JOIN visits v ON vd.visit_id = v.id
       JOIN users u ON v.doctor_id = u.id
       WHERE v.patient_id = ? AND v.tenant_id = ?
       ORDER BY v.visit_date DESC`,
      [patientId, tenantId]
    );
    return diagnoses;
  }

  static async getTreatmentHistory(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [treatments] = await db.execute(
      `SELECT vt.*, v.visit_date, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM visit_treatments vt
       JOIN visits v ON vt.visit_id = v.id
       JOIN users u ON v.doctor_id = u.id
       WHERE v.patient_id = ? AND v.tenant_id = ?
       ORDER BY v.visit_date DESC`,
      [patientId, tenantId]
    );
    return treatments;
  }

  static async getLabResultsHistory(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [labResults] = await db.execute(
      `SELECT lr.*, lreq.test_name, lreq.test_type, lreq.requested_at,
       u.first_name as technician_first_name, u.last_name as technician_last_name
       FROM lab_results lr
       JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
       JOIN users u ON lr.technician_id = u.id
       WHERE lreq.patient_id = ? AND lr.tenant_id = ?
       ORDER BY lr.completed_at DESC`,
      [patientId, tenantId]
    );
    return labResults;
  }

  static async getMedicationHistory(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [medications] = await db.execute(
      `SELECT * FROM patient_medications 
       WHERE patient_id = ? AND tenant_id = ?
       ORDER BY created_at DESC`,
      [patientId, tenantId]
    );
    return medications;
  }

  static async getGrowthChartData(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [growthData] = await db.execute(
      `SELECT vs.weight, vs.height, v.visit_date,
       TIMESTAMPDIFF(MONTH, p.date_of_birth, v.visit_date) as age_months
       FROM visit_vital_signs vs
       JOIN visits v ON vs.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       WHERE v.patient_id = ? AND v.tenant_id = ?
       AND vs.weight IS NOT NULL AND vs.height IS NOT NULL
       ORDER BY v.visit_date ASC`,
      [patientId, tenantId]
    );
    return growthData;
  }

  static async getVaccineRecords(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [vaccines] = await db.execute(
      `SELECT * FROM patient_vaccines 
       WHERE patient_id = ? AND tenant_id = ?
       ORDER BY administered_date DESC`,
      [patientId, tenantId]
    );
    return vaccines;
  }

  static async getCompleteHistory(tenantId, patientId) {
    const [timeline, diagnoses, treatments, labResults, medications, growthData, vaccines] = await Promise.all([
      this.getChronologicalTimeline(tenantId, patientId),
      this.getAllDiagnoses(tenantId, patientId),
      this.getTreatmentHistory(tenantId, patientId),
      this.getLabResultsHistory(tenantId, patientId),
      this.getMedicationHistory(tenantId, patientId),
      this.getGrowthChartData(tenantId, patientId),
      this.getVaccineRecords(tenantId, patientId)
    ]);

    return {
      timeline,
      diagnoses,
      treatments,
      lab_results: labResults,
      medications,
      growth_data: growthData,
      vaccines
    };
  }
}

module.exports = PatientHistory;