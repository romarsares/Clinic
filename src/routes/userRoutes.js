/**
 * User Management Routes - Per Tenant User Operations
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles user management within clinic tenants
 */

const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

const router = express.Router();
const userController = new UserController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/v1/users
 * @desc    List users in clinic (Owner, Admin only)
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.get('/',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('user', 'list'),
    (req, res) => userController.listUsers(req, res)
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user in clinic
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.post('/',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('user', 'create'),
    (req, res) => userController.createUser(req, res)
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user details
 * @access  Private (Owner, Admin, SuperAdmin, or own profile)
 */
router.get('/:id',
    auditLog('user', 'view'),
    (req, res) => userController.getUserDetails(req, res)
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user information
 * @access  Private (Owner, Admin, SuperAdmin, or own profile)
 */
router.put('/:id',
    auditLog('user', 'update'),
    (req, res) => userController.updateUser(req, res)
);

/**
 * @route   PUT /api/v1/users/:id/roles
 * @desc    Update user roles
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.put('/:id/roles',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('user_roles', 'update'),
    (req, res) => userController.updateUserRoles(req, res)
);

/**
 * @route   PUT /api/v1/users/:id/status
 * @desc    Activate/Deactivate user
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.put('/:id/status',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('user', 'status_change'),
    (req, res) => userController.updateUserStatus(req, res)
);

/**
 * @route   PUT /api/v1/users/:id/password
 * @desc    Change user password
 * @access  Private (Owner, Admin, SuperAdmin, or own profile)
 */
router.put('/:id/password',
    auditLog('user', 'password_change'),
    (req, res) => userController.changePassword(req, res)
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Owner, SuperAdmin)
 */
router.delete('/:id',
    requireRole(['Owner', 'SuperAdmin']),
    auditLog('user', 'delete'),
    (req, res) => userController.deleteUser(req, res)
);

module.exports = router;