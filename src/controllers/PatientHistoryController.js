const PatientHistory = require('../models/PatientHistory');
const VaccineRecord = require('../models/VaccineRecord');
const SearchFilter = require('../models/SearchFilter');
const ReportExport = require('../models/ReportExport');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class PatientHistoryController {
  // Get complete patient history
  static async getPatientHistory(req, res) {
    try {
      const filters = {
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to,
        diagnosisType: req.query.diagnosis_type,
        abnormalOnly: req.query.abnormal_only === 'true',
        testCategory: req.query.test_category
      };
      
      const history = await PatientHistory.getCompleteHistory(req.user.clinic_id, req.params.patientId, filters);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'patient_history', req.params.patientId, {
        sections: Object.keys(history),
        filters: filters
      });

      res.json(history);
    } catch (error) {
      console.error('Get patient history error:', error);
      res.status(500).json({ error: 'Failed to retrieve patient history' });
    }
  }

  // Get chronological timeline
  static async getTimeline(req, res) {
    try {
      const filters = {
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to
      };
      
      const timeline = await PatientHistory.getChronologicalTimeline(req.user.clinic_id, req.params.patientId, filters);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'patient_timeline', req.params.patientId, { filters });
      
      res.json(timeline);
    } catch (error) {
      console.error('Get timeline error:', error);
      res.status(500).json({ error: 'Failed to retrieve timeline' });
    }
  }

  // Get diagnosis history
  static async getDiagnosisHistory(req, res) {
    try {
      const filters = {
        diagnosisType: req.query.diagnosis_type
      };
      
      const diagnoses = await PatientHistory.getDiagnosisHistory(req.user.clinic_id, req.params.patientId, filters);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'diagnosis_history', req.params.patientId, { filters });
      
      res.json(diagnoses);
    } catch (error) {
      console.error('Get diagnosis history error:', error);
      res.status(500).json({ error: 'Failed to retrieve diagnosis history' });
    }
  }

  // Get treatment history
  static async getTreatmentHistory(req, res) {
    try {
      const treatments = await PatientHistory.getTreatmentHistory(req.user.clinic_id, req.params.patientId);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'treatment_history', req.params.patientId);
      
      res.json(treatments);
    } catch (error) {
      console.error('Get treatment history error:', error);
      res.status(500).json({ error: 'Failed to retrieve treatment history' });
    }
  }

  // Get lab results history
  static async getLabHistory(req, res) {
    try {
      const filters = {
        abnormalOnly: req.query.abnormal_only === 'true',
        testCategory: req.query.test_category
      };
      
      const labResults = await PatientHistory.getLabResultsHistory(req.user.clinic_id, req.params.patientId, filters);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'lab_history', req.params.patientId, { filters });
      
      res.json(labResults);
    } catch (error) {
      console.error('Get lab history error:', error);
      res.status(500).json({ error: 'Failed to retrieve lab history' });
    }
  }

  // Get medication history
  static async getMedicationHistory(req, res) {
    try {
      const medications = await PatientHistory.getMedicationHistory(req.user.clinic_id, req.params.patientId);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'medication_history', req.params.patientId);
      
      res.json(medications);
    } catch (error) {
      console.error('Get medication history error:', error);
      res.status(500).json({ error: 'Failed to retrieve medication history' });
    }
  }

  // Get growth chart data
  static async getGrowthChart(req, res) {
    try {
      const growthData = await PatientHistory.getGrowthChartData(req.user.clinic_id, req.params.patientId);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'growth_chart', req.params.patientId);
      
      res.json(growthData);
    } catch (error) {
      console.error('Get growth chart error:', error);
      res.status(500).json({ error: 'Failed to retrieve growth chart data' });
    }
  }

  // Search by diagnosis
  static async searchByDiagnosis(req, res) {
    try {
      const { diagnosis } = req.query;
      const filters = {
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to,
        doctorId: req.query.doctor_id
      };

      const results = await PatientHistory.searchByDiagnosis(req.user.clinic_id, diagnosis, filters);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'search', 'diagnosis', null, { 
        query: diagnosis, 
        filters,
        results_count: results.length 
      });
      
      res.json(results);
    } catch (error) {
      console.error('Search by diagnosis error:', error);
      res.status(500).json({ error: 'Failed to search by diagnosis' });
    }
  }

  // Filter by date range
  static async filterByDateRange(req, res) {
    try {
      const { date_from, date_to } = req.query;
      
      if (!date_from || !date_to) {
        return res.status(400).json({ error: 'Both date_from and date_to are required' });
      }
      
      const results = await PatientHistory.filterByDateRange(req.user.clinic_id, req.params.patientId, date_from, date_to);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'filter', 'patient_history', req.params.patientId, {
        date_from,
        date_to
      });
      
      res.json(results);
    } catch (error) {
      console.error('Filter by date range error:', error);
      res.status(500).json({ error: 'Failed to filter by date range' });
    }
  }

  // Generate patient summary report
  static async generatePatientSummary(req, res) {
    try {
      const history = await PatientHistory.getCompleteHistory(req.user.clinic_id, req.params.patientId);
      
      if (!history.patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Format summary for export
      const summary = {
        patient_info: history.patient,
        visit_summary: {
          total_visits: history.patient.total_visits,
          first_visit: history.patient.first_visit_date,
          last_visit: history.patient.last_visit_date
        },
        diagnoses_summary: history.diagnoses.grouped.map(d => ({
          diagnosis: d.diagnosis_name,
          code: d.diagnosis_code,
          first_diagnosed: d.first_diagnosed,
          last_diagnosed: d.last_diagnosed,
          occurrence_count: d.occurrences.length
        })),
        current_medications: history.medications.current,
        recent_lab_results: history.lab_results.results.slice(0, 10),
        growth_data: history.growth_data.trends
      };

      await AuditService.logAction(req.user.clinic_id, req.user.id, 'export', 'patient_summary', req.params.patientId);
      
      res.json(summary);
    } catch (error) {
      console.error('Generate patient summary error:', error);
      res.status(500).json({ error: 'Failed to generate patient summary' });
    }
  }

  // Generate referral report
  static async generateReferralReport(req, res) {
    try {
      const visitId = req.query.visit_id;
      
      if (!visitId) {
        return res.status(400).json({ error: 'visit_id is required' });
      }

      const history = await PatientHistory.getCompleteHistory(req.user.clinic_id, req.params.patientId);
      
      if (!history.patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Find specific visit
      const visit = history.timeline.find(v => v.id == visitId);
      if (!visit) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      const referral = {
        patient_info: history.patient,
        visit_info: visit,
        relevant_diagnoses: history.diagnoses.diagnoses.filter(d => d.visit_id == visitId),
        current_medications: history.medications.current,
        recent_lab_results: history.lab_results.results.slice(0, 5),
        generated_date: new Date().toISOString()
      };

      await AuditService.logAction(req.user.clinic_id, req.user.id, 'export', 'referral_report', req.params.patientId, { visit_id: visitId });
      
      res.json(referral);
    } catch (error) {
      console.error('Generate referral report error:', error);
      res.status(500).json({ error: 'Failed to generate referral report' });
    }
  }

  // Get vaccine records
  static async getVaccineRecords(req, res) {
    try {
      const vaccines = await VaccineRecord.getByPatient(req.user.clinic_id, req.params.patientId);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'vaccine_records', req.params.patientId);
      
      res.json(vaccines);
    } catch (error) {
      console.error('Get vaccine records error:', error);
      res.status(500).json({ error: 'Failed to retrieve vaccine records' });
    }
  }

  // Get vaccine compliance
  static async getVaccineCompliance(req, res) {
    try {
      const compliance = await VaccineRecord.getScheduleCompliance(req.user.clinic_id, req.params.patientId);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'view', 'vaccine_compliance', req.params.patientId);
      
      res.json(compliance);
    } catch (error) {
      console.error('Get vaccine compliance error:', error);
      res.status(500).json({ error: 'Failed to retrieve vaccine compliance' });
    }
  }

  // Add vaccine record
  static async addVaccineRecord(req, res) {
    try {
      const schema = Joi.object({
        vaccine_name: Joi.string().required(),
        vaccine_type: Joi.string().optional(),
        administered_date: Joi.date().required(),
        dose_number: Joi.number().integer().min(1).optional(),
        batch_number: Joi.string().optional(),
        manufacturer: Joi.string().optional(),
        site_administered: Joi.string().optional(),
        notes: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const vaccine = await VaccineRecord.create(req.user.clinic_id, {
        ...value,
        patient_id: req.params.patientId,
        administered_by: req.user.id
      });

      await AuditService.logAction(req.user.clinic_id, req.user.id, 'create', 'vaccine_record', vaccine.id, {
        patient_id: req.params.patientId,
        vaccine_name: value.vaccine_name,
        administered_date: value.administered_date
      });

      res.status(201).json(vaccine);
    } catch (error) {
      console.error('Add vaccine record error:', error);
      res.status(500).json({ error: 'Failed to add vaccine record' });
    }
  }

  // Advanced search
  static async advancedSearch(req, res) {
    try {
      const criteria = {
        diagnosis: req.query.diagnosis,
        lab_test: req.query.lab_test,
        age_min: req.query.age_min ? parseInt(req.query.age_min) : null,
        age_max: req.query.age_max ? parseInt(req.query.age_max) : null,
        gender: req.query.gender,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        doctor_id: req.query.doctor_id
      };

      const results = await SearchFilter.advancedSearch(req.user.clinic_id, criteria);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'search', 'advanced_search', null, {
        criteria,
        results_count: results.length
      });
      
      res.json(results);
    } catch (error) {
      console.error('Advanced search error:', error);
      res.status(500).json({ error: 'Failed to perform advanced search' });
    }
  }

  // Filter by lab results
  static async filterByLabResults(req, res) {
    try {
      const filters = {
        test_name: req.query.test_name,
        test_category: req.query.test_category,
        abnormal_only: req.query.abnormal_only === 'true',
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };

      const results = await SearchFilter.filterByLabResults(req.user.clinic_id, filters);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'filter', 'lab_results', null, {
        filters,
        results_count: results.length
      });
      
      res.json(results);
    } catch (error) {
      console.error('Filter by lab results error:', error);
      res.status(500).json({ error: 'Failed to filter lab results' });
    }
  }

  // Search with demographics
  static async searchWithDemographics(req, res) {
    try {
      const criteria = {
        name: req.query.name,
        patient_code: req.query.patient_code,
        gender: req.query.gender,
        age_min: req.query.age_min ? parseInt(req.query.age_min) : null,
        age_max: req.query.age_max ? parseInt(req.query.age_max) : null,
        contact_number: req.query.contact_number,
        email: req.query.email
      };

      const results = await SearchFilter.searchWithDemographics(req.user.clinic_id, criteria);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'search', 'demographics', null, {
        criteria,
        results_count: results.length
      });
      
      res.json(results);
    } catch (error) {
      console.error('Search with demographics error:', error);
      res.status(500).json({ error: 'Failed to search with demographics' });
    }
  }

  // Generate visit summary report
  static async generateVisitSummary(req, res) {
    try {
      const visitId = req.params.visitId;
      
      const report = await ReportExport.generateVisitSummary(req.user.clinic_id, visitId);
      
      if (!report) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      const formatted = ReportExport.formatForPDF(report, 'visit_summary');
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'export', 'visit_summary', visitId);
      
      res.json(formatted);
    } catch (error) {
      console.error('Generate visit summary error:', error);
      res.status(500).json({ error: 'Failed to generate visit summary' });
    }
  }

  // Generate lab results report
  static async generateLabResultsReport(req, res) {
    try {
      const filters = {
        test_category: req.query.test_category,
        abnormal_only: req.query.abnormal_only === 'true',
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };
      
      const report = await ReportExport.generateLabResultsReport(req.user.clinic_id, req.params.patientId, filters);
      
      if (!report) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const formatted = ReportExport.formatForPDF(report, 'lab_results');
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'export', 'lab_results_report', req.params.patientId, { filters });
      
      res.json(formatted);
    } catch (error) {
      console.error('Generate lab results report error:', error);
      res.status(500).json({ error: 'Failed to generate lab results report' });
    }
  }

  // Generate medication list
  static async generateMedicationList(req, res) {
    try {
      const report = await ReportExport.generateMedicationList(req.user.clinic_id, req.params.patientId);
      
      if (!report) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const formatted = ReportExport.formatForPDF(report, 'medication_list');
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'export', 'medication_list', req.params.patientId);
      
      res.json(formatted);
    } catch (error) {
      console.error('Generate medication list error:', error);
      res.status(500).json({ error: 'Failed to generate medication list' });
    }
  }

  // Batch report generation
  static async generateBatchReports(req, res) {
    try {
      const schema = Joi.object({
        reports: Joi.array().items(
          Joi.object({
            id: Joi.string().required(),
            type: Joi.string().valid('patient_summary', 'lab_results', 'medication_list').required(),
            patient_id: Joi.number().required(),
            filters: Joi.object().optional()
          })
        ).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const results = await ReportExport.generateBatchReports(req.user.clinic_id, value.reports);
      
      await AuditService.logAction(req.user.clinic_id, req.user.id, 'export', 'batch_reports', null, {
        report_count: value.reports.length,
        report_types: [...new Set(value.reports.map(r => r.type))]
      });
      
      res.json(results);
    } catch (error) {
      console.error('Generate batch reports error:', error);
      res.status(500).json({ error: 'Failed to generate batch reports' });
    }
  }
}

module.exports = PatientHistoryController;