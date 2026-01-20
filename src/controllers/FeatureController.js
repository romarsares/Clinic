const db = require('../config/database');
const { getEnabledFeatures, checkFeatures } = require('../middleware/featureToggle');
const AuditService = require('../services/AuditService');
const Joi = require('joi');

class FeatureController {
  // Get all features for a clinic (Super User only)
  static async getClinicFeatures(req, res) {
    try {
      if (!req.user.roles.includes('Super User') && !req.user.roles.includes('SuperAdmin')) {
        return res.status(403).json({ error: 'Super User access required' });
      }

      const clinicId = req.params.clinicId;
      
      const [features] = await db.execute(
        `SELECT cf.feature_name, cf.is_enabled, cf.enabled_at, cf.disabled_at,
         fd.display_name, fd.description, fd.category, fd.is_core,
         u1.full_name as enabled_by_name, u2.full_name as disabled_by_name
         FROM feature_definitions fd
         LEFT JOIN clinic_features cf ON fd.feature_name = cf.feature_name AND cf.clinic_id = ?
         LEFT JOIN auth_users u1 ON cf.enabled_by = u1.id
         LEFT JOIN auth_users u2 ON cf.disabled_by = u2.id
         ORDER BY fd.category, fd.display_name`,
        [clinicId]
      );

      // Set default enabled status for features not in clinic_features table
      const result = features.map(f => ({
        ...f,
        is_enabled: f.is_enabled !== null ? f.is_enabled : true
      }));

      res.json({ features: result });
    } catch (error) {
      console.error('Get clinic features error:', error);
      res.status(500).json({ error: 'Failed to retrieve clinic features' });
    }
  }

  // Enable a feature for a clinic (Super User only)
  static async enableFeature(req, res) {
    try {
      if (!req.user.roles.includes('Super User') && !req.user.roles.includes('SuperAdmin')) {
        return res.status(403).json({ error: 'Super User access required' });
      }

      const schema = Joi.object({
        clinicId: Joi.number().required(),
        featureName: Joi.string().required()
      });

      const { error, value } = schema.validate({
        clinicId: req.params.clinicId,
        featureName: req.body.featureName
      });

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { clinicId, featureName } = value;

      // Check if feature definition exists
      const [featureDef] = await db.execute(
        'SELECT * FROM feature_definitions WHERE feature_name = ?',
        [featureName]
      );

      if (!featureDef.length) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      // Upsert clinic feature
      await db.execute(
        `INSERT INTO clinic_features (clinic_id, feature_name, is_enabled, enabled_by, enabled_at)
         VALUES (?, ?, TRUE, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         is_enabled = TRUE, enabled_by = ?, enabled_at = NOW(), disabled_by = NULL, disabled_at = NULL`,
        [clinicId, featureName, req.user.id, req.user.id]
      );

      await AuditService.log(clinicId, {
        user_id: req.user.id,
        action: 'ENABLE_FEATURE',
        resource_type: 'clinic_feature',
        resource_id: clinicId,
        details: { feature_name: featureName }
      });

      res.json({ 
        success: true, 
        message: `Feature '${featureName}' enabled for clinic ${clinicId}` 
      });
    } catch (error) {
      console.error('Enable feature error:', error);
      res.status(500).json({ error: 'Failed to enable feature' });
    }
  }

  // Disable a feature for a clinic (Super User only)
  static async disableFeature(req, res) {
    try {
      if (!req.user.roles.includes('Super User') && !req.user.roles.includes('SuperAdmin')) {
        return res.status(403).json({ error: 'Super User access required' });
      }

      const schema = Joi.object({
        clinicId: Joi.number().required(),
        featureName: Joi.string().required()
      });

      const { error, value } = schema.validate({
        clinicId: req.params.clinicId,
        featureName: req.body.featureName
      });

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { clinicId, featureName } = value;

      // Check if feature is core (cannot be disabled)
      const [featureDef] = await db.execute(
        'SELECT is_core FROM feature_definitions WHERE feature_name = ?',
        [featureName]
      );

      if (!featureDef.length) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      if (featureDef[0].is_core) {
        return res.status(400).json({ error: 'Core features cannot be disabled' });
      }

      // Upsert clinic feature as disabled
      await db.execute(
        `INSERT INTO clinic_features (clinic_id, feature_name, is_enabled, disabled_by, disabled_at)
         VALUES (?, ?, FALSE, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         is_enabled = FALSE, disabled_by = ?, disabled_at = NOW()`,
        [clinicId, featureName, req.user.id, req.user.id]
      );

      await AuditService.log(clinicId, {
        user_id: req.user.id,
        action: 'DISABLE_FEATURE',
        resource_type: 'clinic_feature',
        resource_id: clinicId,
        details: { feature_name: featureName }
      });

      res.json({ 
        success: true, 
        message: `Feature '${featureName}' disabled for clinic ${clinicId}` 
      });
    } catch (error) {
      console.error('Disable feature error:', error);
      res.status(500).json({ error: 'Failed to disable feature' });
    }
  }

  // Get current user's enabled features
  static async getMyFeatures(req, res) {
    try {
      if (!req.user.clinic_id) {
        return res.status(400).json({ error: 'Clinic context required' });
      }

      const features = await getEnabledFeatures(req.user.clinic_id);
      res.json({ features });
    } catch (error) {
      console.error('Get my features error:', error);
      res.status(500).json({ error: 'Failed to retrieve features' });
    }
  }

  // Get all available feature definitions
  static async getFeatureDefinitions(req, res) {
    try {
      const [features] = await db.execute(
        'SELECT * FROM feature_definitions ORDER BY category, display_name'
      );
      res.json({ features });
    } catch (error) {
      console.error('Get feature definitions error:', error);
      res.status(500).json({ error: 'Failed to retrieve feature definitions' });
    }
  }

  // Bulk update features for a clinic (Super User only)
  static async bulkUpdateFeatures(req, res) {
    try {
      if (!req.user.roles.includes('Super User') && !req.user.roles.includes('SuperAdmin')) {
        return res.status(403).json({ error: 'Super User access required' });
      }

      const schema = Joi.object({
        clinicId: Joi.number().required(),
        features: Joi.object().pattern(Joi.string(), Joi.boolean()).required()
      });

      const { error, value } = schema.validate({
        clinicId: req.params.clinicId,
        features: req.body.features
      });

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { clinicId, features } = value;
      const results = [];

      for (const [featureName, isEnabled] of Object.entries(features)) {
        try {
          if (isEnabled) {
            await db.execute(
              `INSERT INTO clinic_features (clinic_id, feature_name, is_enabled, enabled_by, enabled_at)
               VALUES (?, ?, TRUE, ?, NOW())
               ON DUPLICATE KEY UPDATE 
               is_enabled = TRUE, enabled_by = ?, enabled_at = NOW(), disabled_by = NULL, disabled_at = NULL`,
              [clinicId, featureName, req.user.id, req.user.id]
            );
          } else {
            await db.execute(
              `INSERT INTO clinic_features (clinic_id, feature_name, is_enabled, disabled_by, disabled_at)
               VALUES (?, ?, FALSE, ?, NOW())
               ON DUPLICATE KEY UPDATE 
               is_enabled = FALSE, disabled_by = ?, disabled_at = NOW()`,
              [clinicId, featureName, req.user.id, req.user.id]
            );
          }
          results.push({ feature: featureName, status: isEnabled ? 'enabled' : 'disabled' });
        } catch (err) {
          results.push({ feature: featureName, error: err.message });
        }
      }

      await AuditService.log(clinicId, {
        user_id: req.user.id,
        action: 'BULK_UPDATE_FEATURES',
        resource_type: 'clinic_feature',
        resource_id: clinicId,
        details: { features, results }
      });

      res.json({ success: true, results });
    } catch (error) {
      console.error('Bulk update features error:', error);
      res.status(500).json({ error: 'Failed to update features' });
    }
  }
}

module.exports = FeatureController;