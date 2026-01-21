/**
 * User Permissions Routes - Granular Access Control
 */

const express = require('express');
const UserPermissionsController = require('../controllers/UserPermissionsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/permissions/definitions
 * @desc    Get all available permission definitions
 * @access  Private
 */
router.get('/definitions', authenticateToken, UserPermissionsController.getPermissionDefinitions);

/**
 * @route   GET /api/v1/permissions/users/:userId
 * @desc    Get user's current permissions
 * @access  Private
 */
router.get('/users/:userId', authenticateToken, UserPermissionsController.getUserPermissions);

/**
 * @route   PUT /api/v1/permissions/users/:userId
 * @desc    Update user permissions (checkbox-based)
 * @access  Private (requires admin.permissions)
 */
router.put('/users/:userId', authenticateToken, UserPermissionsController.updateUserPermissions);

/**
 * @route   GET /api/v1/permissions/check/:permission
 * @desc    Check if current user has specific permission
 * @access  Private
 */
router.get('/check/:permission', authenticateToken, UserPermissionsController.checkPermission);

/**
 * @route   GET /api/v1/permissions/users
 * @desc    Get all users with their permissions for management
 * @access  Private (requires admin.permissions)
 */
router.get('/users', authenticateToken, UserPermissionsController.getUsersWithPermissions);

module.exports = router;