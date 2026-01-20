const Billing = require('../models/Billing');
const AuditService = require('../services/AuditService');

class BillingIntegration {
  // Auto-generate bill when visit is closed
  static async onVisitClosed(tenantId, visitId, patientId, userId) {
    try {
      const bill = await Billing.addVisitCharges(tenantId, visitId, patientId);
      
      if (bill) {
        await AuditService.log(tenantId, {
          user_id: userId,
          action: 'AUTO_GENERATE_VISIT_BILL',
          resource_type: 'bill',
          resource_id: bill.id,
          details: { visit_id: visitId, auto_generated: true }
        });
      }
      
      return bill;
    } catch (error) {
      console.error('Auto-generate visit bill error:', error);
      return null;
    }
  }

  // Auto-add lab charges when lab result is completed
  static async onLabResultCompleted(tenantId, labRequestId, userId) {
    try {
      const billId = await Billing.addLabCharges(tenantId, labRequestId);
      
      if (billId) {
        await AuditService.log(tenantId, {
          user_id: userId,
          action: 'AUTO_ADD_LAB_CHARGES',
          resource_type: 'bill',
          resource_id: billId,
          details: { lab_request_id: labRequestId, auto_generated: true }
        });
      }
      
      return billId;
    } catch (error) {
      console.error('Auto-add lab charges error:', error);
      return null;
    }
  }

  // Middleware to integrate with visit closure
  static visitBillingMiddleware() {
    return async (req, res, next) => {
      // Store original response.json
      const originalJson = res.json;
      
      res.json = function(data) {
        // Check if this is a successful visit closure
        if (req.method === 'PUT' && req.path.includes('/close') && res.statusCode === 200) {
          // Auto-generate bill in background
          const visitId = req.params.id;
          const patientId = req.body.patient_id || data.patient_id;
          
          if (visitId && patientId) {
            BillingIntegration.onVisitClosed(req.user.tenant_id, visitId, patientId, req.user.id)
              .catch(error => console.error('Background billing error:', error));
          }
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    };
  }

  // Middleware to integrate with lab result completion
  static labBillingMiddleware() {
    return async (req, res, next) => {
      // Store original response.json
      const originalJson = res.json;
      
      res.json = function(data) {
        // Check if this is a successful lab result creation
        if (req.method === 'POST' && req.path.includes('/results') && res.statusCode === 201) {
          // Auto-add lab charges in background
          const labRequestId = req.body.lab_request_id || data.lab_request_id;
          
          if (labRequestId) {
            BillingIntegration.onLabResultCompleted(req.user.tenant_id, labRequestId, req.user.id)
              .catch(error => console.error('Background lab billing error:', error));
          }
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    };
  }
}

module.exports = BillingIntegration;