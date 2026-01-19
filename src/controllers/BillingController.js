/**
 * Billing Controller - Phase 5 Implementation
 * Handles billing operations and revenue tracking
 */

const Billing = require('../models/Billing');
const { logAuditEvent } = require('../services/AuditService');

class BillingController {
  // Create bill for visit
  static async createBillForVisit(req, res) {
    try {
      const { visitId, patientId, serviceTypeId } = req.body;
      const clinicId = req.user.clinic_id;

      const billId = await Billing.createBillForVisit(visitId, clinicId, patientId);
      
      // Add consultation charge
      if (serviceTypeId) {
        await Billing.addConsultationCharge(billId, serviceTypeId);
      }

      await logAuditEvent(req.user.id, 'CREATE', 'BILL', billId, { visitId, patientId });

      res.status(201).json({
        success: true,
        message: 'Bill created successfully',
        data: { billId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create bill',
        error: error.message
      });
    }
  }

  // Add lab charges to existing bill
  static async addLabCharges(req, res) {
    try {
      const { billId } = req.params;
      const { labRequestId } = req.body;

      await Billing.addLabCharges(billId, labRequestId);

      await logAuditEvent(req.user.id, 'UPDATE', 'BILL', billId, { labRequestId });

      res.json({
        success: true,
        message: 'Lab charges added to bill'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add lab charges',
        error: error.message
      });
    }
  }

  // Get bill details
  static async getBillDetails(req, res) {
    try {
      const { billId } = req.params;
      const bill = await Billing.getBillDetails(billId);

      if (!bill) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      res.json({
        success: true,
        data: bill
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get bill details',
        error: error.message
      });
    }
  }

  // Get revenue by service type
  static async getRevenueByService(req, res) {
    try {
      const clinicId = req.user.clinic_id;
      const { startDate, endDate } = req.query;
      
      const revenue = await Billing.getRevenueByService(
        clinicId, 
        startDate || '2024-01-01', 
        endDate || new Date().toISOString().split('T')[0]
      );

      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get revenue data',
        error: error.message
      });
    }
  }

  // Get pending bills
  static async getPendingBills(req, res) {
    try {
      const clinicId = req.user.clinic_id;
      const bills = await Billing.getPendingBills(clinicId);

      res.json({
        success: true,
        data: bills
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get pending bills',
        error: error.message
      });
    }
  }

  // Update bill status
  static async updateBillStatus(req, res) {
    try {
      const { billId } = req.params;
      const { status } = req.body;

      await db.execute(
        'UPDATE patient_bills SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, billId]
      );

      await logAuditEvent(req.user.id, 'UPDATE', 'BILL_STATUS', billId, { status });

      res.json({
        success: true,
        message: 'Bill status updated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update bill status',
        error: error.message
      });
    }
  }
}

module.exports = BillingController;