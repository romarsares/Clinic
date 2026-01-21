const express = require('express');
const router = express.Router();
const appointmentTypesController = require('../controllers/appointmentTypesController');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// All routes require authentication
router.use(authenticateToken);

// GET /api/appointment-types - Get all appointment types
router.get('/', appointmentTypesController.getAppointmentTypes);

// POST /api/appointment-types - Create new appointment type (Owner/Admin only)
router.post('/', 
    requirePermission('admin.users.manage'), 
    appointmentTypesController.createAppointmentType
);

// PUT /api/appointment-types/:id - Update appointment type (Owner/Admin only)
router.put('/:id', 
    requirePermission('admin.users.manage'), 
    appointmentTypesController.updateAppointmentType
);

// DELETE /api/appointment-types/:id - Delete appointment type (Owner/Admin only)
router.delete('/:id', 
    requirePermission('admin.users.manage'), 
    appointmentTypesController.deleteAppointmentType
);

module.exports = router;