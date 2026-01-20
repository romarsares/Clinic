const Billing = require('../models/Billing');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class BillingController {
  // Generate bill for visit
  static async generateVisitBill(req, res) {
    try {
      if (!['Doctor', 'Staff', 'Owner'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { visitId, patientId } = req.params;
      const bill = await Billing.addVisitCharges(req.user.tenant_id, visitId, patientId);

      if (!bill) {
        return res.status(404).json({ error: 'Visit not found' });
      }

      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'GENERATE_VISIT_BILL',
        resource_type: 'bill',
        resource_id: bill.id,
        details: { visit_id: visitId, patient_id: patientId }
      });

      res.status(201).json(bill);
    } catch (error) {
      console.error('Generate visit bill error:', error);
      res.status(500).json({ error: 'Failed to generate visit bill' });
    }
  }

  // Add lab charges to bill
  static async addLabCharges(req, res) {
    try {
      if (!['Doctor', 'Staff', 'Owner'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { labRequestId } = req.params;
      const billId = await Billing.addLabCharges(req.user.tenant_id, labRequestId);

      if (!billId) {
        return res.status(404).json({ error: 'Lab request not found' });
      }

      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'ADD_LAB_CHARGES',
        resource_type: 'bill',
        resource_id: billId,
        details: { lab_request_id: labRequestId }
      });

      res.json({ message: 'Lab charges added successfully', bill_id: billId });
    } catch (error) {
      console.error('Add lab charges error:', error);
      res.status(500).json({ error: 'Failed to add lab charges' });
    }
  }

  // Get patient bills
  static async getPatientBills(req, res) {
    try {
      const bills = await Billing.getBillsByPatient(req.user.tenant_id, req.params.patientId);
      res.json(bills);
    } catch (error) {
      console.error('Get patient bills error:', error);
      res.status(500).json({ error: 'Failed to retrieve patient bills' });
    }
  }

  // Get bill details
  static async getBillDetails(req, res) {
    try {
      const bill = await Billing.getBillDetails(req.user.tenant_id, req.params.billId);
      
      if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      res.json(bill);
    } catch (error) {
      console.error('Get bill details error:', error);
      res.status(500).json({ error: 'Failed to retrieve bill details' });
    }
  }

  // Add manual service charge
  static async addServiceCharge(req, res) {
    try {
      if (!['Doctor', 'Staff', 'Owner'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const schema = Joi.object({
        service_type: Joi.string().required(),
        service_name: Joi.string().required(),
        quantity: Joi.number().min(1).default(1),
        unit_price: Joi.number().min(0).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const charge = await Billing.addServiceCharge(req.user.tenant_id, req.params.billId, value);

      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'ADD_SERVICE_CHARGE',
        resource_type: 'bill',
        resource_id: req.params.billId,
        details: { service_name: value.service_name, amount: value.unit_price * value.quantity }
      });

      res.status(201).json(charge);
    } catch (error) {
      console.error('Add service charge error:', error);
      res.status(500).json({ error: 'Failed to add service charge' });
    }
  }

  // Get revenue by service type
  static async getRevenueByService(req, res) {
    try {
      if (!['Owner', 'Doctor'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const dateFrom = req.query.date_from;
      const dateTo = req.query.date_to;

      const revenue = await Billing.getRevenueByService(req.user.tenant_id, dateFrom, dateTo);
      res.json(revenue);
    } catch (error) {
      console.error('Get revenue by service error:', error);
      res.status(500).json({ error: 'Failed to retrieve revenue data' });
    }
  }

  // Update bill status
  static async updateBillStatus(req, res) {
    try {
      if (!['Staff', 'Owner'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Only staff and owners can update bill status' });
      }

      const schema = Joi.object({
        status: Joi.string().valid('pending', 'paid', 'cancelled').required(),
        payment_method: Joi.string().optional(),
        notes: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const db = require('../middleware/tenant').TenantDB.getConnection(req.user.tenant_id);
      const [result] = await db.execute(
        'UPDATE bills SET status = ?, payment_method = ?, notes = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ?',
        [value.status, value.payment_method, value.notes, req.params.billId, req.user.tenant_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      await AuditService.log(req.user.tenant_id, {
        user_id: req.user.id,
        action: 'UPDATE_BILL_STATUS',
        resource_type: 'bill',
        resource_id: req.params.billId,
        details: { status: value.status, payment_method: value.payment_method }
      });

      res.json({ message: 'Bill status updated successfully' });
    } catch (error) {
      console.error('Update bill status error:', error);
      res.status(500).json({ error: 'Failed to update bill status' });
    }
  }

  // Get billing dashboard
  static async getBillingDashboard(req, res) {
    try {
      if (!['Owner', 'Staff'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const db = require('../middleware/tenant').TenantDB.getConnection(req.user.tenant_id);
      
      // Get today's revenue
      const [todayRevenue] = await db.execute(
        `SELECT SUM(total_amount) as revenue, COUNT(*) as bills
         FROM bills 
         WHERE tenant_id = ? AND DATE(created_at) = CURDATE() AND status = 'paid'`,
        [req.user.tenant_id]
      );

      // Get pending bills
      const [pendingBills] = await db.execute(
        `SELECT COUNT(*) as count, SUM(total_amount) as amount
         FROM bills 
         WHERE tenant_id = ? AND status = 'pending'`,
        [req.user.tenant_id]
      );

      // Get revenue by service
      const revenueByService = await Billing.getRevenueByService(req.user.tenant_id);

      res.json({
        today_revenue: todayRevenue[0].revenue || 0,
        today_bills: todayRevenue[0].bills || 0,
        pending_bills: pendingBills[0].count || 0,
        pending_amount: pendingBills[0].amount || 0,
        revenue_by_service: revenueByService
      });
    } catch (error) {
      console.error('Get billing dashboard error:', error);
      res.status(500).json({ error: 'Failed to retrieve billing dashboard' });
    }
  }
}

module.exports = BillingController;