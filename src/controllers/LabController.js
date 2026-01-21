const LabRequest = require('../models/LabRequest');
const LabResult = require('../models/LabResult');
const Billing = require('../models/Billing');
const AuditService = require('../services/AuditService');
const { checkUserPermission } = require('../middleware/permissions');
const Joi = require('joi');

class LabController {
  // Create lab request (doctors only)
  // Required Permission: lab.request
  static async createLabRequest(req, res) {
    try {
      // Check permission
      const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'lab.request');
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required_permission: 'lab.request'
        });
      }

      const schema = Joi.object({
        patient_id: Joi.number().required(),
        visit_id: Joi.number().optional(),
        test_type: Joi.string().required(),
        test_name: Joi.string().required(),
        priority: Joi.string().valid('normal', 'urgent', 'stat').default('normal'),
        notes: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const labRequest = await LabRequest.create(req.user.tenant_id, {
        ...value,
        doctor_id: req.user.id
      });

      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'CREATE_LAB_REQUEST',
        resource_type: 'lab_request',
        resource_id: labRequest.id,
        details: { patient_id: value.patient_id, test_name: value.test_name }
      });

      res.status(201).json(labRequest);
    } catch (error) {
      console.error('Create lab request error:', error);
      res.status(500).json({ error: 'Failed to create lab request' });
    }
  }

  // Get lab requests
  // Required Permission: lab.view
  static async getLabRequests(req, res) {
    try {
      // Check permission
      const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'lab.view');
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required_permission: 'lab.view'
        });
      }
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.patient_id) filters.patient_id = req.query.patient_id;
      if (req.user.role === 'Doctor') filters.doctor_id = req.user.id;

      const labRequests = await LabRequest.findByTenant(req.user.tenant_id, filters);
      res.json(labRequests);
    } catch (error) {
      console.error('Get lab requests error:', error);
      res.status(500).json({ error: 'Failed to retrieve lab requests' });
    }
  }

  // Get lab request by ID
  // Required Permission: lab.view
  static async getLabRequestById(req, res) {
    try {
      // Check permission
      const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'lab.view');
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required_permission: 'lab.view'
        });
      }
      const labRequest = await LabRequest.findById(req.user.tenant_id, req.params.id);
      if (!labRequest) {
        return res.status(404).json({ error: 'Lab request not found' });
      }

      // Check permissions
      if (req.user.role === 'Doctor' && labRequest.doctor_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(labRequest);
    } catch (error) {
      console.error('Get lab request error:', error);
      res.status(500).json({ error: 'Failed to retrieve lab request' });
    }
  }

  // Update lab request status
  // Required Permission: lab.edit
  static async updateLabRequestStatus(req, res) {
    try {
      // Check permission
      const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'lab.edit');
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required_permission: 'lab.edit'
        });
      }
      const schema = Joi.object({
        status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').required(),
        notes: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const updated = await LabRequest.updateStatus(
        req.user.tenant_id, 
        req.params.id, 
        value.status, 
        value.notes
      );

      if (!updated) {
        return res.status(404).json({ error: 'Lab request not found' });
      }

      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'UPDATE_LAB_REQUEST_STATUS',
        resource_type: 'lab_request',
        resource_id: req.params.id,
        details: { status: value.status }
      });

      res.json({ message: 'Lab request status updated successfully' });
    } catch (error) {
      console.error('Update lab request status error:', error);
      res.status(500).json({ error: 'Failed to update lab request status' });
    }
  }

  // Create lab result (lab technicians only)
  // Required Permission: lab.results
  static async createLabResult(req, res) {
    try {
      // Check permission
      const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'lab.results');
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required_permission: 'lab.results'
        });
      }

      const schema = Joi.object({
        lab_request_id: Joi.number().required(),
        test_values: Joi.object().required(),
        normal_ranges: Joi.object().optional(),
        result_file: Joi.string().optional(),
        notes: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Use default normal ranges if not provided
      const normalRanges = value.normal_ranges || LabResult.getDefaultNormalRanges();
      
      // Check for abnormal values
      const abnormalFlags = await LabResult.checkAbnormalValues(value.test_values, normalRanges);

      const labResult = await LabResult.create(req.user.tenant_id, {
        ...value,
        technician_id: req.user.id,
        normal_ranges: normalRanges,
        abnormal_flags: abnormalFlags
      });

      // Auto-add lab charges to bill if visit exists
      try {
        const labRequest = await LabRequest.findById(req.user.tenant_id, value.lab_request_id);
        if (labRequest && labRequest.visit_id) {
          // Find existing bill for the visit
          const [existingBill] = await require('../config/database').execute(
            'SELECT id FROM patient_bills WHERE visit_id = ? AND clinic_id = ?',
            [labRequest.visit_id, req.user.tenant_id]
          );
          
          if (existingBill.length > 0) {
            await Billing.addLabCharges(existingBill[0].id, value.lab_request_id);
          }
        }
      } catch (billingError) {
        console.error('Error adding lab charges to bill:', billingError);
        // Don't fail result creation if billing fails
      }

      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'CREATE_LAB_RESULT',
        resource_type: 'lab_result',
        resource_id: labResult.id,
        details: { 
          lab_request_id: value.lab_request_id,
          has_abnormal_values: Object.keys(abnormalFlags).length > 0
        }
      });

      res.status(201).json(labResult);
    } catch (error) {
      console.error('Create lab result error:', error);
      res.status(500).json({ error: 'Failed to create lab result' });
    }
  }

  // Get lab result by lab request ID
  // Required Permission: lab.view
  static async getLabResult(req, res) {
    try {
      // Check permission
      const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'lab.view');
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required_permission: 'lab.view'
        });
      }
      const labResult = await LabResult.findByLabRequest(req.user.tenant_id, req.params.labRequestId);
      if (!labResult) {
        return res.status(404).json({ error: 'Lab result not found' });
      }

      res.json(labResult);
    } catch (error) {
      console.error('Get lab result error:', error);
      res.status(500).json({ error: 'Failed to retrieve lab result' });
    }
  }

  // Get patient lab history
  // Required Permission: lab.view
  static async getPatientLabHistory(req, res) {
    try {
      // Check permission
      const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'lab.view');
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required_permission: 'lab.view'
        });
      }
      const labHistory = await LabResult.findByPatient(req.user.tenant_id, req.params.patientId);
      
      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'VIEW_PATIENT_LAB_HISTORY',
        resource_type: 'patient',
        resource_id: req.params.patientId,
        details: { records_count: labHistory.length }
      });

      res.json(labHistory);
    } catch (error) {
      console.error('Get patient lab history error:', error);
      res.status(500).json({ error: 'Failed to retrieve patient lab history' });
    }
  }

  // Get lab templates
  static async getLabTemplates(req, res) {
    try {
      const templates = await LabRequest.getLabTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Get lab templates error:', error);
      res.status(500).json({ error: 'Failed to retrieve lab templates' });
    }
  }

  // Get lab dashboard statistics
  // Required Permission: lab.view
  static async getLabDashboard(req, res) {
    try {
      // Check permission
      const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'lab.view');
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required_permission: 'lab.view'
        });
      }
      const stats = await LabRequest.getDashboardStats(req.user.tenant_id);
      const criticalResults = await LabResult.getCriticalResults(req.user.tenant_id);

      res.json({
        statistics: stats,
        critical_results: criticalResults
      });
    } catch (error) {
      console.error('Get lab dashboard error:', error);
      res.status(500).json({ error: 'Failed to retrieve lab dashboard data' });
    }
  }
}

module.exports = LabController;