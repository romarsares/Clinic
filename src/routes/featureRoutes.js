const express = require('express');
const FeatureController = require('../controllers/FeatureController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Super User only routes for feature management
router.get('/clinics/:clinicId/features', 
  requireRole(['Super User', 'SuperAdmin']), 
  FeatureController.getClinicFeatures
);

router.post('/clinics/:clinicId/features/enable', 
  requireRole(['Super User', 'SuperAdmin']), 
  FeatureController.enableFeature
);

router.post('/clinics/:clinicId/features/disable', 
  requireRole(['Super User', 'SuperAdmin']), 
  FeatureController.disableFeature
);

router.put('/clinics/:clinicId/features', 
  requireRole(['Super User', 'SuperAdmin']), 
  FeatureController.bulkUpdateFeatures
);

// General routes for all users
router.get('/my-features', FeatureController.getMyFeatures);
router.get('/definitions', FeatureController.getFeatureDefinitions);

module.exports = router;