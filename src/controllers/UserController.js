const db = require('../config/database');
const bcrypt = require('bcryptjs');
const AuditService = require('../services/AuditService');
const { body, validationResult } = require('express-validator');
const { checkUserPermission } = require('../middleware/permissions');
const fs = require('fs');
const path = require('path');

class UserController {
    /**
     * List users in clinic
     * Required Permission: admin.users
     */
    async listUsers(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'admin.users');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'admin.users'
                });
            }

            const limit = parseInt(req.query.limit) || 50;
            const clinicId = req.user.clinic_id;
            
            // Simple query without LIMIT to avoid parameter binding issues
            const query = `
                SELECT u.id, u.email, u.first_name, u.last_name, u.full_name, u.status, u.created_at,
                       GROUP_CONCAT(r.name) as roles
                FROM auth_users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.clinic_id = ? AND u.deleted_at IS NULL
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `;
            
            const [users] = await db.execute(query, [clinicId]);
            
            // Apply limit in JavaScript to avoid SQL parameter issues
            const limitedUsers = users.slice(0, limit);
            
            res.json({
                success: true,
                data: limitedUsers.map(user => ({
                    ...user,
                    roles: user.roles ? user.roles.split(',') : []
                }))
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to fetch users',
                error: error.message 
            });
        }
    }

    /**
     * Create new user
     * Required Permission: admin.users
     */
    async createUser(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'admin.users');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'admin.users'
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false,
                    errors: errors.array() 
                });
            }

            const { email, password, first_name, last_name, role_ids } = req.body;
            const clinicId = req.user.clinic_id;
            const full_name = `${first_name} ${last_name}`;

            // Check if user exists
            const [existingUsers] = await db.execute(
                'SELECT id FROM auth_users WHERE email = ? AND clinic_id = ?',
                [email, clinicId]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'User already exists in this clinic'
                });
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, 12);

            // Create user
            const [result] = await db.execute(`
                INSERT INTO auth_users (clinic_id, email, password_hash, first_name, last_name, full_name, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
            `, [clinicId, email, password_hash, first_name, last_name, full_name]);

            const userId = result.insertId;

            // Assign roles if provided
            if (role_ids && role_ids.length > 0) {
                await this.assignRolesToUser(userId, role_ids, clinicId);
            }

            // Log user creation
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'user_create',
                entity: 'user',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: { email, full_name, role_ids }
            });

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    id: userId,
                    email,
                    full_name,
                    roles: role_ids || []
                }
            });

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create user',
                error: error.message
            });
        }
    }

    /**
     * Get user details
     */
    async getUserDetails(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const clinicId = req.user.clinic_id;

            // Check if user can access this user's details
            // Super User, Owner, Admin can access any user
            // Regular users can only access their own details
            const canAccessAnyUser = req.user.roles.includes('Super User') || 
                                   req.user.roles.includes('Owner') || 
                                   req.user.roles.includes('Admin') ||
                                   req.user.roles.includes('SuperAdmin');
            
            if (userId !== req.user.id && !canAccessAnyUser) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied - can only view own profile'
                });
            }

            const query = `
                SELECT u.id, u.email, u.first_name, u.last_name, u.full_name, u.status, u.created_at,
                       GROUP_CONCAT(r.name) as roles,
                       GROUP_CONCAT(r.id) as role_ids
                FROM auth_users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.id = ? AND u.clinic_id = ? AND u.deleted_at IS NULL
                GROUP BY u.id
            `;

            const [users] = await db.execute(query, [userId, clinicId]);

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = users[0];
            res.json({
                success: true,
                data: {
                    ...user,
                    roles: user.roles ? user.roles.split(',') : [],
                    role_ids: user.role_ids ? user.role_ids.split(',').map(id => parseInt(id)) : []
                }
            });

        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user details',
                error: error.message
            });
        }
    }

    /**
     * Update user information
     */
    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const clinicId = req.user.clinic_id;
            const { first_name, last_name, email } = req.body;

            // Check permissions
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Verify user exists and belongs to clinic
            const [existingUsers] = await db.execute(
                'SELECT id FROM auth_users WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL',
                [userId, clinicId]
            );

            if (existingUsers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const full_name = `${first_name} ${last_name}`;

            await db.execute(`
                UPDATE auth_users 
                SET first_name = ?, last_name = ?, full_name = ?, email = ?, updated_at = NOW()
                WHERE id = ? AND clinic_id = ?
            `, [first_name, last_name, full_name, email, userId, clinicId]);

            // Log user update
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'user_update',
                entity: 'user',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: { first_name, last_name, email }
            });

            res.json({
                success: true,
                message: 'User updated successfully'
            });

        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: error.message
            });
        }
    }

    /**
     * Update user roles - CRITICAL FUNCTIONALITY
     * Required Permission: admin.permissions
     */
    async updateUserRoles(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'admin.permissions');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'admin.permissions'
                });
            }

            const userId = parseInt(req.params.id);
            const clinicId = req.user.clinic_id;
            const { role_ids } = req.body;

            // Verify user exists and belongs to clinic
            const [existingUsers] = await db.execute(
                'SELECT id, email FROM auth_users WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL',
                [userId, clinicId]
            );

            if (existingUsers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Validate role IDs belong to the same clinic
            if (role_ids && role_ids.length > 0) {
                const [validRoles] = await db.execute(
                    `SELECT id FROM roles WHERE id IN (${role_ids.map(() => '?').join(',')}) AND clinic_id = ?`,
                    [...role_ids, clinicId]
                );

                if (validRoles.length !== role_ids.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid role IDs or roles from different clinic'
                    });
                }
            }

            // Get current roles for audit log
            const [currentRoles] = await db.execute(
                'SELECT role_id FROM user_roles WHERE user_id = ?',
                [userId]
            );
            const oldRoleIds = currentRoles.map(r => r.role_id);

            // Remove all existing roles
            await db.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);

            // Assign new roles
            if (role_ids && role_ids.length > 0) {
                await this.assignRolesToUser(userId, role_ids, clinicId);
            }

            // Log role change
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'user_roles_update',
                entity: 'user_roles',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                old_value: { role_ids: oldRoleIds },
                new_value: { role_ids: role_ids || [] }
            });

            res.json({
                success: true,
                message: 'User roles updated successfully',
                data: {
                    user_id: userId,
                    role_ids: role_ids || []
                }
            });

        } catch (error) {
            console.error('Error updating user roles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user roles',
                error: error.message
            });
        }
    }

    /**
     * Update user status (active/suspended)
     * Required Permission: admin.users
     */
    async updateUserStatus(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'admin.users');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'admin.users'
                });
            }

            const userId = parseInt(req.params.id);
            const clinicId = req.user.clinic_id;
            const { status } = req.body;

            if (!['active', 'suspended'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be active or suspended'
                });
            }

            // Verify user exists
            const [existingUsers] = await db.execute(
                'SELECT id FROM auth_users WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL',
                [userId, clinicId]
            );

            if (existingUsers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await db.execute(
                'UPDATE auth_users SET status = ?, updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [status, userId, clinicId]
            );

            // Log status change
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'user_status_change',
                entity: 'user',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: { status }
            });

            res.json({
                success: true,
                message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`
            });

        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status',
                error: error.message
            });
        }
    }

    /**
     * Change user password
     */
    async changePassword(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const clinicId = req.user.clinic_id;
            const { current_password, new_password } = req.body;

            // Check permissions (user can change own password, or admin can change any)
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Get user
            const [users] = await db.execute(
                'SELECT password_hash FROM auth_users WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL',
                [userId, clinicId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password if user is changing own password
            if (userId === req.user.id) {
                const isValidPassword = await bcrypt.compare(current_password, users[0].password_hash);
                if (!isValidPassword) {
                    return res.status(400).json({
                        success: false,
                        message: 'Current password is incorrect'
                    });
                }
            }

            // Hash new password
            const new_password_hash = await bcrypt.hash(new_password, 12);

            // Update password
            await db.execute(
                'UPDATE auth_users SET password_hash = ?, updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [new_password_hash, userId, clinicId]
            );

            // Log password change
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'password_change',
                entity: 'user',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl
            });

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password',
                error: error.message
            });
        }
    }

    /**
     * Upload user avatar
     */
    async uploadAvatar(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const clinicId = req.user.clinic_id;

            // Check permissions
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            // Verify user exists
            const [users] = await db.execute(
                'SELECT avatar_url FROM auth_users WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL',
                [userId, clinicId]
            );

            if (users.length === 0) {
                // Clean up uploaded file if user not found
                fs.unlinkSync(req.file.path);
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Delete old avatar if exists
            const oldAvatarUrl = users[0].avatar_url;
            if (oldAvatarUrl) {
                const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(oldAvatarUrl));
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }

            // Generate avatar URL
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;

            // Update user avatar in database
            await db.execute(
                'UPDATE auth_users SET avatar_url = ?, updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [avatarUrl, userId, clinicId]
            );

            // Log avatar upload
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'avatar_upload',
                entity: 'user',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: { avatar_url: avatarUrl }
            });

            res.json({
                success: true,
                message: 'Avatar uploaded successfully',
                data: {
                    avatar_url: avatarUrl
                }
            });

        } catch (error) {
            // Clean up uploaded file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            console.error('Error uploading avatar:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload avatar',
                error: error.message
            });
        }
    }

    /**
     * Delete user avatar
     */
    async deleteAvatar(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const clinicId = req.user.clinic_id;

            // Check permissions
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Get current avatar
            const [users] = await db.execute(
                'SELECT avatar_url FROM auth_users WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL',
                [userId, clinicId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const avatarUrl = users[0].avatar_url;
            if (!avatarUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'No avatar to delete'
                });
            }

            // Delete avatar file
            const avatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(avatarUrl));
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }

            // Remove avatar URL from database
            await db.execute(
                'UPDATE auth_users SET avatar_url = NULL, updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [userId, clinicId]
            );

            // Log avatar deletion
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'avatar_delete',
                entity: 'user',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                old_value: { avatar_url: avatarUrl }
            });

            res.json({
                success: true,
                message: 'Avatar deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting avatar:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete avatar',
                error: error.message
            });
        }
    }

    /**
     * Delete user (soft delete)
     * Required Permission: admin.users
     */
    async deleteUser(req, res) {
        try {
            // Check permission
            const hasPermission = await checkUserPermission(req.user.id, req.user.clinic_id, 'admin.users');
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: 'admin.users'
                });
            }

            const userId = parseInt(req.params.id);
            const clinicId = req.user.clinic_id;

            // Verify user exists
            const [existingUsers] = await db.execute(
                'SELECT id FROM auth_users WHERE id = ? AND clinic_id = ? AND deleted_at IS NULL',
                [userId, clinicId]
            );

            if (existingUsers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Soft delete user
            await db.execute(
                'UPDATE auth_users SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND clinic_id = ?',
                [userId, clinicId]
            );

            // Remove all roles
            await db.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);

            // Log user deletion
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'user_delete',
                entity: 'user',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl
            });

            res.json({
                success: true,
                message: 'User deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: error.message
            });
        }
    }

    /**
     * Helper method to assign roles to user
     */
    async assignRolesToUser(userId, roleIds, clinicId) {
        for (const roleId of roleIds) {
            await db.execute(
                'INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())',
                [userId, roleId]
            );
        }
    }

    /**
     * Static method for backward compatibility
     */
    static async getUsers(req, res) {
        const controller = new UserController();
        return controller.listUsers(req, res);
    }
}

module.exports = UserController;