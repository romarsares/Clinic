const express = require('express');
const BillingController = require('../controllers/BillingController');
const { authenticateToken } = require('../middleware/auth');
const { validateTenant } = require('../middleware/tenant');
const { requireFeature } = require('../middleware/featureToggle');

const router = express.Router();

// Apply authentication, tenant validation, and feature check
router.use(authenticateToken);
router.use(validateTenant);
router.use(requireFeature('billing'));

// Bill generation routes
router.post('/visits/:visitId/patients/:patientId/bill', BillingController.generateVisitBill);
router.post('/lab-requests/:labRequestId/charges', BillingController.addLabCharges);

// Bill management routes
router.get('/patients/:patientId/bills', BillingController.getPatientBills);
router.get('/bills/:billId', BillingController.getBillDetails);
router.post('/bills/:billId/charges', BillingController.addServiceCharge);
router.put('/bills/:billId/status', BillingController.updateBillStatus);

// Revenue and reporting routes
router.get('/revenue/by-service', BillingController.getRevenueByService);
router.get('/dashboard', BillingController.getBillingDashboard);

module.exports = router;