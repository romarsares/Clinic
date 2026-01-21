/**
 * User Permissions Controller - Granular Access Control
 * Manages checkbox-based permissions for each module/service
 */

const db = require('../config/database');

class UserPermissionsController {
    /**
     * Get all available permissions grouped by module
     */
    static async getPermissionDefinitions(req, res) {
        try {
            const permissions = {
                patient: [
                    { key: 'patient.add', label: 'Add Patient', description: 'Create new patient records' },
                    { key: 'patient.edit', label: 'Edit Patient', description: 'Modify patient information' },
                    { key: 'patient.view', label: 'View Patient', description: 'Access patient records' },
                    { key: 'patient.delete', label: 'Delete Patient', description: 'Remove patient records' }
                ],
                appointment: [
                    { key: 'appointment.create', label: 'Create Appointment', description: 'Schedule new appointments' },
                    { key: 'appointment.edit', label: 'Edit Appointment', description: 'Modify appointments' },
                    { key: 'appointment.view', label: 'View Appointment', description: 'Access appointment details' },
                    { key: 'appointment.cancel', label: 'Cancel Appointment', description: 'Cancel appointments' }
                ],
                billing: [
                    { key: 'billing.create', label: 'Create Invoice', description: 'Generate bills and invoices' },
                    { key: 'billing.edit', label: 'Edit Invoice', description: 'Modify billing information' },
                    { key: 'billing.view', label: 'View Invoice', description: 'Access billing records' },
                    { key: 'billing.payment', label: 'Process Payment', description: 'Handle payment processing' }
                ],
                clinical: [
                    { key: 'clinical.visit.create', label: 'Create Visit', description: 'Document patient visits' },
                    { key: 'clinical.visit.edit', label: 'Edit Visit', description: 'Modify visit records' },
                    { key: 'clinical.visit.view', label: 'View Visit', description: 'Access visit history' },
                    { key: 'clinical.lab.order', label: 'Order Lab Tests', description: 'Request laboratory tests' }
                ],
                lab: [
                    { key: 'lab.request.create', label: 'Create Lab Request', description: 'Order lab tests' },
                    { key: 'lab.result.enter', label: 'Enter Lab Results', description: 'Input test results' },
                    { key: 'lab.result.view', label: 'View Lab Results', description: 'Access lab reports' },
                    { key: 'lab.dashboard', label: 'Lab Dashboard', description: 'Access lab analytics' }
                ],
                reports: [
                    { key: 'reports.clinical', label: 'Clinical Reports', description: 'Generate clinical reports' },
                    { key: 'reports.financial', label: 'Financial Reports', description: 'Access financial analytics' },
                    { key: 'reports.patient', label: 'Patient Reports', description: 'Generate patient summaries' },
                    { key: 'reports.export', label: 'Export Reports', description: 'Export data and reports' }
                ],
                admin: [
                    { key: 'admin.users', label: 'User Management', description: 'Manage clinic users' },
                    { key: 'admin.permissions', label: 'User Group Access Settings', description: 'Manage user permissions' },
                    { key: 'admin.settings', label: 'Clinic Settings', description: 'Configure clinic settings' },
                    { key: 'admin.audit', label: 'Audit Logs', description: 'View system audit logs' }
                ]
            };

            res.json({
                success: true,
                data: permissions
            });
        } catch (error) {
            console.error('Error getting permission definitions:', error);
            res.status(500).json({ error: 'Failed to get permission definitions' });
        }
    }

    /**
     * Get user's current permissions
     */
    static async getUserPermissions(req, res) {
        try {
            const { userId } = req.params;
            const { clinic_id } = req.user;

            const [permissions] = await db.execute(`
                SELECT permission_key, granted_by, granted_at
                FROM user_permissions 
                WHERE user_id = ? AND clinic_id = ?
            `, [userId, clinic_id]);

            res.json({
                success: true,
                data: permissions.map(p => p.permission_key)
            });
        } catch (error) {
            console.error('Error getting user permissions:', error);
            res.status(500).json({ error: 'Failed to get user permissions' });
        }
    }

    /**
     * Update user permissions (checkbox-based)
     */
    static async updateUserPermissions(req, res) {
        try {
            const { userId } = req.params;
            const { permissions } = req.body; // Array of permission keys
            const { clinic_id, id: grantedBy } = req.user;

            // Check if current user has permission to manage permissions
            const [hasPermission] = await db.execute(`
                SELECT 1 FROM user_permissions 
                WHERE user_id = ? AND clinic_id = ? AND permission_key = 'admin.permissions'
                UNION
                SELECT 1 FROM auth_users 
                WHERE id = ? AND clinic_id = ? AND JSON_CONTAINS(roles, '"Owner"')
                UNION
                SELECT 1 FROM auth_users 
                WHERE id = ? AND clinic_id = ? AND JSON_CONTAINS(roles, '"Super User"')
            `, [grantedBy, clinic_id, grantedBy, clinic_id, grantedBy, clinic_id]);

            if (!hasPermission.length) {
                return res.status(403).json({ error: 'Insufficient permissions to manage user access' });
            }

            // Remove all existing permissions for this user
            await db.execute(`
                DELETE FROM user_permissions 
                WHERE user_id = ? AND clinic_id = ?
            `, [userId, clinic_id]);

            // Add new permissions
            if (permissions && permissions.length > 0) {
                const values = permissions.map(permission => [userId, clinic_id, permission, grantedBy]);
                const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
                
                await db.execute(`
                    INSERT INTO user_permissions (user_id, clinic_id, permission_key, granted_by)
                    VALUES ${placeholders}
                `, values.flat());
            }

            res.json({
                success: true,
                message: 'User permissions updated successfully'
            });
        } catch (error) {
            console.error('Error updating user permissions:', error);
            res.status(500).json({ error: 'Failed to update user permissions' });
        }
    }

    /**
     * Check if user has specific permission
     */
    static async checkPermission(req, res) {
        try {
            const { permission } = req.params;
            const { id: userId, clinic_id, roles } = req.user;

            // Super User has all permissions
            if (roles.includes('Super User')) {
                return res.json({ success: true, hasPermission: true });
            }

            // Check if user has specific permission
            const [result] = await db.execute(`
                SELECT 1 FROM user_permissions 
                WHERE user_id = ? AND clinic_id = ? AND permission_key = ?
            `, [userId, clinic_id, permission]);

            res.json({
                success: true,
                hasPermission: result.length > 0
            });
        } catch (error) {
            console.error('Error checking permission:', error);
            res.status(500).json({ error: 'Failed to check permission' });
        }
    }

    /**
     * Get all users with their permissions for management interface
     */
    static async getUsersWithPermissions(req, res) {
        try {
            const { clinic_id } = req.user;

            const [users] = await db.execute(`
                SELECT 
                    u.id,
                    u.full_name,
                    u.email,
                    u.roles,
                    u.status,
                    GROUP_CONCAT(up.permission_key) as permissions
                FROM auth_users u
                LEFT JOIN user_permissions up ON u.id = up.user_id AND up.clinic_id = u.clinic_id
                WHERE u.clinic_id = ?
                GROUP BY u.id
                ORDER BY u.full_name
            `, [clinic_id]);

            const usersWithPermissions = users.map(user => ({
                ...user,
                roles: JSON.parse(user.roles || '[]'),
                permissions: user.permissions ? user.permissions.split(',') : []
            }));

            res.json({
                success: true,
                data: usersWithPermissions
            });
        } catch (error) {
            console.error('Error getting users with permissions:', error);
            res.status(500).json({ error: 'Failed to get users with permissions' });
        }
    }
}

module.exports = UserPermissionsController;