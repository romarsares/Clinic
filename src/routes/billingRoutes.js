/**
 * Billing Routes - Phase 5 Implementation
 * API endpoints for billing operations
 */

const express = require('express');
const BillingController = require('../controllers/BillingController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/v1/billing/bills
 * @desc    Create bill for visit
 * @access  Staff, Doctor
 */
router.post('/bills', 
  requireRole(['Staff', 'Doctor']), 
  BillingController.createBillForVisit
);

/**
 * @route   POST /api/v1/billing/bills/:billId/lab-charges
 * @desc    Add lab charges to bill
 * @access  Staff, Doctor
 */
router.post('/bills/:billId/lab-charges', 
  requireRole(['Staff', 'Doctor']), 
  BillingController.addLabCharges
);

/**
 * @route   GET /api/v1/billing/bills/:billId
 * @desc    Get bill details
 * @access  Staff, Doctor, Owner
 */
router.get('/bills/:billId', 
  requireRole(['Staff', 'Doctor', 'Owner']), 
  BillingController.getBillDetails
);

/**
 * @route   PUT /api/v1/billing/bills/:billId/status
 * @desc    Update bill status
 * @access  Staff, Owner
 */
router.put('/bills/:billId/status', 
  requireRole(['Staff', 'Owner']), 
  BillingController.updateBillStatus
);

/**
 * @route   GET /api/v1/billing/pending
 * @desc    Get pending bills
 * @access  Staff, Owner
 */
router.get('/pending', 
  requireRole(['Staff', 'Owner']), 
  BillingController.getPendingBills
);

/**
 * @route   GET /api/v1/billing/revenue
 * @desc    Get revenue by service type
 * @access  Owner
 */
router.get('/revenue', 
  requireRole(['Owner']), 
  BillingController.getRevenueByService
);

module.exports = router;