/**
 * User Preferences Routes
 * 
 * Author: AI Assistant
 * Created: 2025-01-20
 * Purpose: Routes for user preference management
 */

const express = require('express');
const UserPreferencesController = require('../controllers/UserPreferencesController');
const { authenticateToken } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/v1/users/:userId/preferences
 * @desc    Get all user preferences
 * @access  Private (Own preferences or Admin/Owner)
 */
router.get('/:userId/preferences',
    auditLog('user_preferences', 'view'),
    (req, res) => UserPreferencesController.getUserPreferences(req, res)
);

/**
 * @route   PUT /api/v1/users/:userId/preferences
 * @desc    Update multiple user preferences
 * @access  Private (Own preferences or Admin/Owner)
 */
router.put('/:userId/preferences',
    auditLog('user_preferences', 'update'),
    (req, res) => UserPreferencesController.updateUserPreferences(req, res)
);

/**
 * @route   GET /api/v1/users/:userId/preferences/:key
 * @desc    Get specific user preference
 * @access  Private (Own preferences or Admin/Owner)
 */
router.get('/:userId/preferences/:key',
    auditLog('user_preferences', 'view'),
    (req, res) => UserPreferencesController.getPreference(req, res)
);

/**
 * @route   PUT /api/v1/users/:userId/preferences/:key
 * @desc    Set specific user preference
 * @access  Private (Own preferences or Admin/Owner)
 */
router.put('/:userId/preferences/:key',
    auditLog('user_preferences', 'update'),
    (req, res) => UserPreferencesController.setPreference(req, res)
);

/**
 * @route   DELETE /api/v1/users/:userId/preferences/:key
 * @desc    Delete specific user preference
 * @access  Private (Own preferences or Admin/Owner)
 */
router.delete('/:userId/preferences/:key',
    auditLog('user_preferences', 'delete'),
    (req, res) => UserPreferencesController.deletePreference(req, res)
);

module.exports = router;