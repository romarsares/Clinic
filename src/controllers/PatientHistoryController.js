const PatientHistory = require('../models/PatientHistory');
const SearchFilter = require('../models/SearchFilter');
const ReportExport = require('../models/ReportExport');
const ClinicalReports = require('../models/ClinicalReports');
const PediatricFeatures = require('../models/PediatricFeatures');
const VaccineRecord = require('../models/VaccineRecord');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class PatientHistoryController {
  // Get complete patient history
  static async getPatientHistory(req, res) {
    try {
      const history = await PatientHistory.getCompleteHistory(req.user.tenant_id, req.params.patientId);
      
      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'VIEW_PATIENT_HISTORY',
        resource_type: 'patient',
        resource_id: req.params.patientId,
        details: { sections: Object.keys(history) }
      });

      res.json(history);
    } catch (error) {
      console.error('Get patient history error:', error);
      res.status(500).json({ error: 'Failed to retrieve patient history' });
    }
  }

  // Search by diagnosis
  static async searchByDiagnosis(req, res) {
    try {
      const { diagnosis } = req.query;
      const filters = {
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        doctor_id: req.query.doctor_id
      };

      const results = await SearchFilter.searchByDiagnosis(req.user.tenant_id, diagnosis, filters);
      res.json(results);
    } catch (error) {
      console.error('Search by diagnosis error:', error);
      res.status(500).json({ error: 'Failed to search by diagnosis' });
    }
  }

  // Advanced search
  static async advancedSearch(req, res) {
    try {
      const criteria = {
        diagnosis: req.query.diagnosis,
        lab_test: req.query.lab_test,
        age_min: req.query.age_min ? parseInt(req.query.age_min) : null,
        age_max: req.query.age_max ? parseInt(req.query.age_max) : null
      };

      const results = await SearchFilter.advancedSearch(req.user.tenant_id, criteria);
      res.json(results);
    } catch (error) {
      console.error('Advanced search error:', error);
      res.status(500).json({ error: 'Failed to perform advanced search' });
    }
  }

  // Generate patient summary report
  static async generatePatientSummary(req, res) {
    try {
      const summary = await ReportExport.generatePatientSummary(req.user.tenant_id, req.params.patientId);
      if (!summary) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const formatted = ReportExport.formatForPDF(summary, 'patient_summary');
      res.json(formatted);
    } catch (error) {
      console.error('Generate patient summary error:', error);
      res.status(500).json({ error: 'Failed to generate patient summary' });
    }
  }

  // Generate referral report
  static async generateReferralReport(req, res) {
    try {
      const referral = await ReportExport.generateReferralReport(
        req.user.tenant_id, 
        req.params.patientId, 
        req.query.visit_id
      );
      
      if (!referral) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const formatted = ReportExport.formatForPDF(referral, 'referral');
      res.json(formatted);
    } catch (error) {
      console.error('Generate referral report error:', error);
      res.status(500).json({ error: 'Failed to generate referral report' });
    }
  }

  // Get clinical reports
  static async getClinicalReports(req, res) {
    try {
      const reportType = req.params.type;
      const dateFrom = req.query.date_from;
      const dateTo = req.query.date_to;

      let report;
      switch (reportType) {
        case 'common-diagnoses':
          report = await ClinicalReports.getCommonDiagnoses(req.user.tenant_id, dateFrom, dateTo);
          break;
        case 'disease-prevalence':
          report = await ClinicalReports.getDiseasePrevalence(req.user.tenant_id, req.query.category);
          break;
        case 'lab-volumes':
          report = await ClinicalReports.getLabTestVolumes(req.user.tenant_id, dateFrom, dateTo);
          break;
        case 'lab-revenue':
          report = await ClinicalReports.getLabRevenue(req.user.tenant_id, dateFrom, dateTo);
          break;
        case 'doctor-productivity':
          report = await ClinicalReports.getDoctorProductivity(req.user.tenant_id, dateFrom, dateTo);
          break;
        case 'clinic-overview':
          report = await ClinicalReports.getClinicOverview(req.user.tenant_id, dateFrom, dateTo);
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }

      res.json(report);
    } catch (error) {
      console.error('Get clinical reports error:', error);
      res.status(500).json({ error: 'Failed to generate clinical report' });
    }
  }

  // Get growth chart data
  static async getGrowthChart(req, res) {
    try {
      const growthData = await PediatricFeatures.getGrowthChartData(req.user.tenant_id, req.params.patientId);
      res.json(growthData);
    } catch (error) {
      console.error('Get growth chart error:', error);
      res.status(500).json({ error: 'Failed to retrieve growth chart data' });
    }
  }

  // Get developmental milestones
  static async getDevelopmentalMilestones(req, res) {
    try {
      const milestones = await PediatricFeatures.trackDevelopmentalMilestones(req.user.tenant_id, req.params.patientId);
      res.json(milestones);
    } catch (error) {
      console.error('Get developmental milestones error:', error);
      res.status(500).json({ error: 'Failed to retrieve developmental milestones' });
    }
  }

  // Get vaccine compliance
  static async getVaccineCompliance(req, res) {
    try {
      const compliance = await PediatricFeatures.getVaccineScheduleCompliance(req.user.tenant_id, req.params.patientId);
      res.json(compliance);
    } catch (error) {
      console.error('Get vaccine compliance error:', error);
      res.status(500).json({ error: 'Failed to retrieve vaccine compliance' });
    }
  }

  // Add vaccine record
  static async addVaccineRecord(req, res) {
    try {
      if (!['Doctor', 'Staff'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Only doctors and staff can add vaccine records' });
      }

      const schema = Joi.object({
        vaccine_name: Joi.string().required(),
        vaccine_type: Joi.string().required(),
        administered_date: Joi.date().required(),
        dose_number: Joi.number().optional(),
        batch_number: Joi.string().optional(),
        manufacturer: Joi.string().optional(),
        site_administered: Joi.string().optional(),
        notes: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const vaccine = await VaccineRecord.create(req.user.tenant_id, {
        ...value,
        patient_id: req.params.patientId,
        administered_by: req.user.id
      });

      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'ADD_VACCINE_RECORD',
        resource_type: 'patient',
        resource_id: req.params.patientId,
        details: { vaccine_name: value.vaccine_name, administered_date: value.administered_date }
      });

      res.status(201).json(vaccine);
    } catch (error) {
      console.error('Add vaccine record error:', error);
      res.status(500).json({ error: 'Failed to add vaccine record' });
    }
  }
}

module.exports = PatientHistoryController;