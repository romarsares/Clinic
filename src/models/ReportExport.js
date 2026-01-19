const TenantDB = require('../middleware/tenant');

class ReportExport {
  static async generatePatientSummary(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    
    // Get patient basic info
    const [patient] = await db.execute(
      'SELECT * FROM patients WHERE id = ? AND tenant_id = ?',
      [patientId, tenantId]
    );

    if (!patient[0]) return null;

    // Get recent visits
    const [visits] = await db.execute(
      `SELECT v.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM visits v
       JOIN users u ON v.doctor_id = u.id
       WHERE v.patient_id = ? AND v.tenant_id = ?
       ORDER BY v.visit_date DESC LIMIT 10`,
      [patientId, tenantId]
    );

    // Get diagnoses
    const [diagnoses] = await db.execute(
      `SELECT vd.*, v.visit_date
       FROM visit_diagnoses vd
       JOIN visits v ON vd.visit_id = v.id
       WHERE v.patient_id = ? AND v.tenant_id = ?
       ORDER BY v.visit_date DESC`,
      [patientId, tenantId]
    );

    // Get current medications
    const [medications] = await db.execute(
      `SELECT * FROM patient_medications 
       WHERE patient_id = ? AND tenant_id = ? AND status = 'active'
       ORDER BY created_at DESC`,
      [patientId, tenantId]
    );

    // Get allergies
    const [allergies] = await db.execute(
      `SELECT * FROM patient_allergies 
       WHERE patient_id = ? AND tenant_id = ? AND status = 'active'
       ORDER BY created_at DESC`,
      [patientId, tenantId]
    );

    return {
      patient: patient[0],
      recent_visits: visits,
      diagnoses,
      current_medications: medications,
      allergies,
      generated_at: new Date().toISOString()
    };
  }

  static async generateReferralReport(tenantId, patientId, visitId = null) {
    const summary = await this.generatePatientSummary(tenantId, patientId);
    if (!summary) return null;

    const db = TenantDB.getConnection(tenantId);

    // Get specific visit if provided
    let visitDetails = null;
    if (visitId) {
      const [visit] = await db.execute(
        `SELECT v.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
         FROM visits v
         JOIN users u ON v.doctor_id = u.id
         WHERE v.id = ? AND v.patient_id = ? AND v.tenant_id = ?`,
        [visitId, patientId, tenantId]
      );
      visitDetails = visit[0];
    }

    // Get recent lab results
    const [labResults] = await db.execute(
      `SELECT lr.*, lreq.test_name, lreq.test_type
       FROM lab_results lr
       JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
       WHERE lreq.patient_id = ? AND lr.tenant_id = ?
       ORDER BY lr.completed_at DESC LIMIT 5`,
      [patientId, tenantId]
    );

    return {
      ...summary,
      visit_details: visitDetails,
      recent_lab_results: labResults,
      report_type: 'referral',
      purpose: 'Medical referral documentation'
    };
  }

  static async generateVisitSummary(tenantId, visitId) {
    const db = TenantDB.getConnection(tenantId);

    // Get visit details
    const [visit] = await db.execute(
      `SELECT v.*, p.first_name, p.last_name, p.date_of_birth,
       u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM visits v
       JOIN patients p ON v.patient_id = p.id
       JOIN users u ON v.doctor_id = u.id
       WHERE v.id = ? AND v.tenant_id = ?`,
      [visitId, tenantId]
    );

    if (!visit[0]) return null;

    // Get diagnoses
    const [diagnoses] = await db.execute(
      'SELECT * FROM visit_diagnoses WHERE visit_id = ?',
      [visitId]
    );

    // Get treatments
    const [treatments] = await db.execute(
      'SELECT * FROM visit_treatments WHERE visit_id = ?',
      [visitId]
    );

    // Get vital signs
    const [vitalSigns] = await db.execute(
      'SELECT * FROM visit_vital_signs WHERE visit_id = ?',
      [visitId]
    );

    return {
      visit: visit[0],
      diagnoses,
      treatments,
      vital_signs: vitalSigns[0],
      generated_at: new Date().toISOString()
    };
  }

  static async generateLabResultsPrint(tenantId, labRequestId) {
    const db = TenantDB.getConnection(tenantId);

    // Get lab request and result
    const [labData] = await db.execute(
      `SELECT lr.*, lreq.test_name, lreq.test_type, lreq.requested_at,
       p.first_name, p.last_name, p.date_of_birth,
       u1.first_name as doctor_first_name, u1.last_name as doctor_last_name,
       u2.first_name as tech_first_name, u2.last_name as tech_last_name
       FROM lab_results lr
       JOIN lab_requests lreq ON lr.lab_request_id = lreq.id
       JOIN patients p ON lreq.patient_id = p.id
       JOIN users u1 ON lreq.doctor_id = u1.id
       JOIN users u2 ON lr.technician_id = u2.id
       WHERE lreq.id = ? AND lr.tenant_id = ?`,
      [labRequestId, tenantId]
    );

    if (!labData[0]) return null;

    return {
      lab_data: labData[0],
      test_values: JSON.parse(labData[0].test_values || '{}'),
      normal_ranges: JSON.parse(labData[0].normal_ranges || '{}'),
      abnormal_flags: JSON.parse(labData[0].abnormal_flags || '{}'),
      generated_at: new Date().toISOString()
    };
  }

  static formatForPDF(reportData, reportType) {
    const header = {
      clinic_name: 'Pediatric Clinic',
      generated_date: new Date().toLocaleDateString(),
      report_type: reportType.toUpperCase()
    };

    switch (reportType) {
      case 'patient_summary':
        return {
          header,
          patient_info: {
            name: `${reportData.patient.first_name} ${reportData.patient.last_name}`,
            dob: reportData.patient.date_of_birth,
            age: this.calculateAge(reportData.patient.date_of_birth),
            phone: reportData.patient.phone,
            email: reportData.patient.email
          },
          sections: {
            recent_visits: reportData.recent_visits,
            diagnoses: reportData.diagnoses,
            medications: reportData.current_medications,
            allergies: reportData.allergies
          }
        };
      case 'visit_summary':
        return {
          header,
          patient_info: {
            name: `${reportData.visit.first_name} ${reportData.visit.last_name}`,
            dob: reportData.visit.date_of_birth,
            visit_date: reportData.visit.visit_date
          },
          visit_details: {
            chief_complaint: reportData.visit.chief_complaint,
            diagnoses: reportData.diagnoses,
            treatments: reportData.treatments,
            vital_signs: reportData.vital_signs
          }
        };
      case 'lab_results':
        return {
          header,
          patient_info: {
            name: `${reportData.lab_data.first_name} ${reportData.lab_data.last_name}`,
            dob: reportData.lab_data.date_of_birth
          },
          lab_info: {
            test_name: reportData.lab_data.test_name,
            requested_date: reportData.lab_data.requested_at,
            completed_date: reportData.lab_data.completed_at,
            doctor: `${reportData.lab_data.doctor_first_name} ${reportData.lab_data.doctor_last_name}`,
            technician: `${reportData.lab_data.tech_first_name} ${reportData.lab_data.tech_last_name}`
          },
          results: {
            values: reportData.test_values,
            normal_ranges: reportData.normal_ranges,
            abnormal_flags: reportData.abnormal_flags
          }
        };
    }
  }

  static calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

module.exports = ReportExport;