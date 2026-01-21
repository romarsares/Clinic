const db = require('../config/database');
const PatientHistory = require('./PatientHistory');

class ReportExport {
  // Generate comprehensive patient summary for export
  static async generatePatientSummary(clinicId, patientId) {
    const history = await PatientHistory.getCompleteHistory(clinicId, patientId);
    
    if (!history.patient) {
      return null;
    }

    return {
      report_type: 'patient_summary',
      generated_date: new Date().toISOString(),
      clinic_id: clinicId,
      patient_info: {
        id: history.patient.id,
        patient_code: history.patient.patient_code,
        full_name: history.patient.full_name,
        birth_date: history.patient.birth_date,
        gender: history.patient.gender,
        contact_number: history.patient.contact_number,
        email: history.patient.email,
        age_years: Math.floor((new Date() - new Date(history.patient.birth_date)) / (365.25 * 24 * 60 * 60 * 1000))
      },
      visit_summary: {
        total_visits: history.patient.total_visits || 0,
        first_visit_date: history.patient.first_visit_date,
        last_visit_date: history.patient.last_visit_date,
        recent_visits: history.timeline.slice(0, 10)
      },
      diagnoses_summary: {
        total_unique_diagnoses: history.diagnoses.grouped.length,
        primary_diagnoses: history.diagnoses.diagnoses.filter(d => d.diagnosis_type === 'primary'),
        chronic_conditions: history.diagnoses.grouped.filter(d => d.occurrences.length > 2),
        recent_diagnoses: history.diagnoses.diagnoses.slice(0, 10)
      },
      medications: {
        current_medications: history.medications.current,
        medication_history: history.medications.past,
        total_medications: history.medications.all.length
      },
      lab_results: {
        total_lab_requests: history.lab_results.results.length,
        recent_results: history.lab_results.results.slice(0, 15),
        abnormal_results: history.lab_results.results.filter(r => r.is_abnormal),
        trending_parameters: history.lab_results.trending.slice(0, 10)
      },
      growth_data: history.growth_data,
      allergies: [], // Will be populated if allergies table exists
      emergency_contacts: [] // Will be populated if emergency contacts exist
    };
  }

  // Generate referral report for specific visit
  static async generateReferralReport(clinicId, patientId, visitId) {
    const history = await PatientHistory.getCompleteHistory(clinicId, patientId);
    
    if (!history.patient) {
      return null;
    }

    // Find specific visit
    const visit = history.timeline.find(v => v.id == visitId);
    if (!visit) {
      return null;
    }

    // Get visit-specific details
    const [visitDetails] = await db.execute(`
      SELECT v.*, u.full_name as doctor_name, u.email as doctor_email
      FROM visits v
      LEFT JOIN auth_users u ON v.doctor_id = u.id
      WHERE v.id = ? AND v.clinic_id = ?
    `, [visitId, clinicId]);

    const [visitDiagnoses] = await db.execute(`
      SELECT vd.*, u.full_name as diagnosed_by_name
      FROM visit_diagnoses vd
      LEFT JOIN auth_users u ON vd.diagnosed_by = u.id
      WHERE vd.visit_id = ? AND vd.clinic_id = ?
    `, [visitId, clinicId]);

    const [visitNotes] = await db.execute(`
      SELECT * FROM visit_notes
      WHERE visit_id = ? AND clinic_id = ?
      ORDER BY note_type
    `, [visitId, clinicId]);

    const [visitVitals] = await db.execute(`
      SELECT vs.*, u.full_name as recorded_by_name
      FROM visit_vital_signs vs
      LEFT JOIN auth_users u ON vs.recorded_by = u.id
      WHERE vs.visit_id = ? AND vs.clinic_id = ?
    `, [visitId, clinicId]);

    return {
      report_type: 'referral_report',
      generated_date: new Date().toISOString(),
      clinic_id: clinicId,
      patient_info: history.patient,
      referring_doctor: {
        name: visitDetails[0]?.doctor_name,
        email: visitDetails[0]?.doctor_email
      },
      visit_details: {
        visit_date: visitDetails[0]?.visit_date,
        status: visitDetails[0]?.status,
        diagnoses: visitDiagnoses,
        notes: visitNotes,
        vital_signs: visitVitals[0] || null
      },
      medical_history: {
        recent_diagnoses: history.diagnoses.diagnoses.slice(0, 10),
        current_medications: history.medications.current,
        allergies: [], // Will be populated if allergies exist
        recent_lab_results: history.lab_results.results.slice(0, 5)
      },
      recommendations: {
        follow_up_required: true,
        specialist_referral: null,
        additional_tests: []
      }
    };
  }

  // Generate visit summary report
  static async generateVisitSummary(clinicId, visitId) {
    const [visit] = await db.execute(`
      SELECT v.*, p.patient_code, p.full_name as patient_name, p.birth_date,
             u.full_name as doctor_name
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      LEFT JOIN auth_users u ON v.doctor_id = u.id
      WHERE v.id = ? AND v.clinic_id = ?
    `, [visitId, clinicId]);

    if (!visit[0]) {
      return null;
    }

    const [diagnoses] = await db.execute(`
      SELECT vd.*, u.full_name as diagnosed_by_name
      FROM visit_diagnoses vd
      LEFT JOIN auth_users u ON vd.diagnosed_by = u.id
      WHERE vd.visit_id = ?
    `, [visitId]);

    const [notes] = await db.execute(`
      SELECT * FROM visit_notes WHERE visit_id = ? ORDER BY note_type
    `, [visitId]);

    const [vitals] = await db.execute(`
      SELECT vs.*, u.full_name as recorded_by_name
      FROM visit_vital_signs vs
      LEFT JOIN auth_users u ON vs.recorded_by = u.id
      WHERE vs.visit_id = ?
    `, [visitId]);

    const [labRequests] = await db.execute(`
      SELECT lr.*, lt.test_name
      FROM lab_requests lr
      LEFT JOIN lab_request_items lri ON lr.id = lri.lab_request_id
      LEFT JOIN lab_tests lt ON lri.lab_test_id = lt.id
      WHERE lr.visit_id = ?
    `, [visitId]);

    return {
      report_type: 'visit_summary',
      generated_date: new Date().toISOString(),
      visit_info: visit[0],
      diagnoses,
      notes,
      vital_signs: vitals[0] || null,
      lab_requests: labRequests,
      billing_info: null // Will be populated if billing exists
    };
  }

  // Format data for PDF generation
  static formatForPDF(reportData, reportType) {
    const baseFormat = {
      title: this.getReportTitle(reportType),
      generated_date: new Date().toLocaleDateString(),
      generated_time: new Date().toLocaleTimeString(),
      clinic_info: {
        name: 'CuraOne Clinic', // This should come from clinic settings
        address: 'Clinic Address',
        contact: 'Contact Information'
      },
      ...reportData
    };

    switch (reportType) {
      case 'patient_summary':
        return {
          ...baseFormat,
          sections: [
            'patient_info',
            'visit_summary', 
            'diagnoses_summary',
            'current_medications',
            'recent_lab_results',
            'growth_data'
          ]
        };
      
      case 'referral':
        return {
          ...baseFormat,
          sections: [
            'patient_info',
            'referring_doctor',
            'visit_details',
            'medical_history',
            'recommendations'
          ]
        };
      
      case 'visit_summary':
        return {
          ...baseFormat,
          sections: [
            'visit_info',
            'diagnoses',
            'vital_signs',
            'notes',
            'lab_requests'
          ]
        };
      
      default:
        return baseFormat;
    }
  }

  // Get report title based on type
  static getReportTitle(reportType) {
    const titles = {
      'patient_summary': 'Patient Medical Summary',
      'referral': 'Medical Referral Report',
      'visit_summary': 'Visit Summary Report',
      'lab_results': 'Laboratory Results Report',
      'medication_list': 'Current Medications List',
      'growth_chart': 'Pediatric Growth Chart',
      'vaccine_record': 'Vaccination Record'
    };
    
    return titles[reportType] || 'Medical Report';
  }

  // Generate lab results report with charts
  static async generateLabResultsReport(clinicId, patientId, filters = {}) {
    const labHistory = await PatientHistory.getLabResultsHistory(clinicId, patientId, filters);
    const patient = await db.execute(`
      SELECT * FROM patients WHERE id = ? AND clinic_id = ?
    `, [patientId, clinicId]);

    return {
      report_type: 'lab_results',
      generated_date: new Date().toISOString(),
      patient_info: patient[0][0],
      lab_results: labHistory.results,
      trending_data: labHistory.trending,
      summary: {
        total_tests: labHistory.results.length,
        abnormal_results: labHistory.results.filter(r => r.is_abnormal).length,
        test_categories: [...new Set(labHistory.results.map(r => r.category))],
        date_range: {
          from: Math.min(...labHistory.results.map(r => new Date(r.result_date))),
          to: Math.max(...labHistory.results.map(r => new Date(r.result_date)))
        }
      }
    };
  }

  // Generate prescription/medication list
  static async generateMedicationList(clinicId, patientId) {
    const medications = await PatientHistory.getMedicationHistory(clinicId, patientId);
    const patient = await db.execute(`
      SELECT * FROM patients WHERE id = ? AND clinic_id = ?
    `, [patientId, clinicId]);

    return {
      report_type: 'medication_list',
      generated_date: new Date().toISOString(),
      patient_info: patient[0][0],
      current_medications: medications.current,
      medication_history: medications.past,
      summary: {
        total_current: medications.current.length,
        total_historical: medications.past.length,
        active_prescriptions: medications.current.filter(m => m.status === 'active').length
      }
    };
  }

  // Batch report generation
  static async generateBatchReports(clinicId, reportRequests) {
    const results = [];
    
    for (const request of reportRequests) {
      try {
        let report;
        
        switch (request.type) {
          case 'patient_summary':
            report = await this.generatePatientSummary(clinicId, request.patient_id);
            break;
          case 'lab_results':
            report = await this.generateLabResultsReport(clinicId, request.patient_id, request.filters);
            break;
          case 'medication_list':
            report = await this.generateMedicationList(clinicId, request.patient_id);
            break;
          default:
            throw new Error(`Unknown report type: ${request.type}`);
        }
        
        results.push({
          request_id: request.id,
          status: 'success',
          report: report
        });
      } catch (error) {
        results.push({
          request_id: request.id,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return results;
  }
}

module.exports = ReportExport;