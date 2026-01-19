/**
 * User Management Controller - Per Tenant User Operations
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles user management within clinic tenants
 */

const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const db = require('../config/database');

class UserController {
    constructor() {
        this.userModel = new User(db);
    }

    /**
     * List users in clinic
     * GET /api/v1/users
     */
    async listUsers(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            
            // SuperAdmin can specify clinic_id in query
            const targetClinicId = req.user.roles.includes('SuperAdmin') && req.query.clinic_id 
                ? req.query.clinic_id 
                : clinicId;

            const users = await this.userModel.listByClinic(targetClinicId);
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error listing users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list users',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Create new user
     * POST /api/v1/users
     */
    async createUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const clinicId = req.user.clinic_id;
            const userData = { ...req.body, clinic_id: clinicId };

            // SuperAdmin can specify different clinic_id
            if (req.user.roles.includes('SuperAdmin') && req.body.clinic_id) {
                userData.clinic_id = req.body.clinic_id;
            }

            const user = await this.userModel.create(userData);
            
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to create user',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get user details
     * GET /api/v1/users/:id
     */
    async getUserDetails(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userModel.getById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Multi-tenant check: Users can only access users from their clinic
            if (!req.user.roles.includes('SuperAdmin') && user.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Users can view their own profile, or admins can view any user in their clinic
            const canView = req.user.id === parseInt(id) || 
                           ['Owner', 'Admin', 'SuperAdmin'].some(role => req.user.roles.includes(role));

            if (!canView) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user details',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update user information
     * PUT /api/v1/users/:id
     */
    async updateUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const user = await this.userModel.getById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Multi-tenant check
            if (!req.user.roles.includes('SuperAdmin') && user.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Permission check: Users can update their own profile, or admins can update any user
            const canUpdate = req.user.id === parseInt(id) || 
                             ['Owner', 'Admin', 'SuperAdmin'].some(role => req.user.roles.includes(role));

            if (!canUpdate) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const updatedUser = await this.userModel.update(id, req.body);
            
            res.json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update user roles
     * PUT /api/v1/users/:id/roles
     */
    async updateUserRoles(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const { roles } = req.body;

            const user = await this.userModel.getById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Multi-tenant check
            if (!req.user.roles.includes('SuperAdmin') && user.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await this.userModel.updateRoles(id, roles);
            
            res.json({
                success: true,
                message: 'User roles updated successfully'
            });
        } catch (error) {
            console.error('Error updating user roles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user roles',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Update user status
     * PUT /api/v1/users/:id/status
     */
    async updateUserStatus(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const { status } = req.body;

            const user = await this.userModel.getById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Multi-tenant check
            if (!req.user.roles.includes('SuperAdmin') && user.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await this.userModel.updateStatus(id, status);
            
            res.json({
                success: true,
                message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`
            });
        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Change user password
     * PUT /api/v1/users/:id/password
     */
    async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const { current_password, new_password } = req.body;

            const user = await this.userModel.getById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Multi-tenant check
            if (!req.user.roles.includes('SuperAdmin') && user.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Permission check: Users can change their own password, or admins can change any user's password
            const canChange = req.user.id === parseInt(id) || 
                             ['Owner', 'Admin', 'SuperAdmin'].some(role => req.user.roles.includes(role));

            if (!canChange) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // If user is changing their own password, verify current password
            if (req.user.id === parseInt(id) && current_password) {
                const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
                if (!isValidPassword) {
                    return res.status(400).json({
                        success: false,
                        message: 'Current password is incorrect'
                    });
                }
            }

            await this.userModel.updatePassword(id, new_password);
            
            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Delete user (soft delete)
     * DELETE /api/v1/users/:id
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            const user = await this.userModel.getById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Multi-tenant check
            if (!req.user.roles.includes('SuperAdmin') && user.clinic_id !== req.user.clinic_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Prevent self-deletion
            if (req.user.id === parseInt(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account'
                });
            }

            await this.userModel.softDelete(id);
            
            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Validation rules for user creation
     */
    static getCreateValidation() {
        return [
            body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
            body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
            body('full_name').trim().isLength({ min: 2 }).withMessage('Full name is required'),
            body('roles').isArray().withMessage('Roles must be an array'),
            body('clinic_id').optional().isInt().withMessage('Valid clinic ID is required')
        ];
    }

    /**
     * Validation rules for user update
     */
    static getUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid user ID is required'),
            body('full_name').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
            body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required')
        ];
    }

    /**
     * Validation rules for role update
     */
    static getRoleUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid user ID is required'),
            body('roles').isArray().withMessage('Roles must be an array')
        ];
    }

    /**
     * Validation rules for status update
     */
    static getStatusUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid user ID is required'),
            body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
        ];
    }

    /**
     * Validation rules for password update
     */
    static getPasswordUpdateValidation() {
        return [
            param('id').isInt().withMessage('Valid user ID is required'),
            body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
            body('current_password').optional().isLength({ min: 1 }).withMessage('Current password is required when changing own password')
        ];
    }
}

module.exports = UserController;