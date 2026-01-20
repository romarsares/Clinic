const db = require('../config/database');

/**
 * Feature Toggle Middleware
 * Checks if a specific feature is enabled for the user's clinic
 */
const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // Super User bypasses all feature checks
      if (req.user && (req.user.roles.includes('Super User') || req.user.roles.includes('SuperAdmin'))) {
        return next();
      }

      // Check if user has clinic context
      if (!req.user || !req.user.clinic_id) {
        return res.status(403).json({
          success: false,
          message: 'Clinic context required'
        });
      }

      // Check if feature is enabled for this clinic
      const [features] = await db.execute(
        'SELECT is_enabled FROM clinic_features WHERE clinic_id = ? AND feature_name = ?',
        [req.user.clinic_id, featureName]
      );

      // If no record exists, feature is disabled by default
      if (!features.length || !features[0].is_enabled) {
        return res.status(403).json({
          success: false,
          message: `Feature '${featureName}' is not available for your clinic`,
          feature: featureName,
          clinic_id: req.user.clinic_id
        });
      }

      next();
    } catch (error) {
      console.error('Feature check error:', error);
      res.status(500).json({
        success: false,
        message: 'Feature availability check failed'
      });
    }
  };
};

/**
 * Get enabled features for a clinic
 */
const getEnabledFeatures = async (clinicId) => {
  try {
    const [features] = await db.execute(
      `SELECT cf.feature_name, cf.is_enabled, fd.display_name, fd.description, fd.category
       FROM clinic_features cf
       JOIN feature_definitions fd ON cf.feature_name = fd.feature_name
       WHERE cf.clinic_id = ? AND cf.is_enabled = TRUE
       ORDER BY fd.category, fd.display_name`,
      [clinicId]
    );
    return features;
  } catch (error) {
    console.error('Get enabled features error:', error);
    return [];
  }
};

/**
 * Check if multiple features are enabled
 */
const checkFeatures = async (clinicId, featureNames) => {
  try {
    const placeholders = featureNames.map(() => '?').join(',');
    const [features] = await db.execute(
      `SELECT feature_name, is_enabled 
       FROM clinic_features 
       WHERE clinic_id = ? AND feature_name IN (${placeholders})`,
      [clinicId, ...featureNames]
    );

    const featureMap = {};
    features.forEach(f => {
      featureMap[f.feature_name] = f.is_enabled;
    });

    // Features not in database are disabled by default
    featureNames.forEach(name => {
      if (!(name in featureMap)) {
        featureMap[name] = false;
      }
    });

    return featureMap;
  } catch (error) {
    console.error('Check features error:', error);
    return {};
  }
};

/**
 * Middleware to add enabled features to request context
 */
const addFeatureContext = async (req, res, next) => {
  try {
    if (req.user && req.user.clinic_id) {
      // Super User gets all features
      if (req.user.roles.includes('Super User') || req.user.roles.includes('SuperAdmin')) {
        req.enabledFeatures = {
          appointments: true,
          laboratory: true,
          billing: true,
          parent_portal: true,
          sms_notifications: true,
          pediatric_features: true,
          advanced_analytics: true,
          clinical_templates: true,
          vaccine_management: true,
          growth_tracking: true
        };
      } else {
        const allFeatures = [
          'appointments', 'laboratory', 'billing', 'parent_portal', 
          'sms_notifications', 'pediatric_features', 'advanced_analytics',
          'clinical_templates', 'vaccine_management', 'growth_tracking'
        ];
        req.enabledFeatures = await checkFeatures(req.user.clinic_id, allFeatures);
      }
    }
    next();
  } catch (error) {
    console.error('Add feature context error:', error);
    next(); // Continue without feature context
  }
};

module.exports = {
  requireFeature,
  getEnabledFeatures,
  checkFeatures,
  addFeatureContext
};