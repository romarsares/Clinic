const express = require('express');
const router = express.Router();
const appointmentTypesController = require('../controllers/appointmentTypesController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /api/appointment-types - Get all appointment types
router.get('/', appointmentTypesController.getAppointmentTypes);

// POST /api/appointment-types - Create new appointment type (Owner/Admin only)
router.post('/', 
    requireRole(['Owner', 'Admin', 'Super User']), 
    appointmentTypesController.createAppointmentType
);

// PUT /api/appointment-types/:id - Update appointment type (Owner/Admin only)
router.put('/:id', 
    requireRole(['Owner', 'Admin', 'Super User']), 
    appointmentTypesController.updateAppointmentType
);

// DELETE /api/appointment-types/:id - Delete appointment type (Owner/Admin only)
router.delete('/:id', 
    requireRole(['Owner', 'Admin', 'Super User']), 
    appointmentTypesController.deleteAppointmentType
);

module.exports = router;