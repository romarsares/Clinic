/**
 * Permission Validation Middleware
 * Provides granular permission checking for all endpoints
 */

const db = require('../config/database');

/**
 * Check if user has specific permission
 */
async function checkUserPermission(userId, clinicId, permissionKey) {
    try {
        // Check if user has Super User role via user_roles table
        const [userRoles] = await db.execute(`
            SELECT r.name 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
        `, [userId]);
        
        const roles = userRoles.map(row => row.name);
        
        // Super User has all permissions
        if (roles.includes('Super User') || roles.includes('SuperAdmin')) {
            return true;
        }

        // Check specific permission
        const [permission] = await db.execute(
            'SELECT 1 FROM user_permissions WHERE user_id = ? AND clinic_id = ? AND permission_key = ?',
            [userId, clinicId, permissionKey]
        );

        return permission.length > 0;
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
}

/**
 * Middleware factory for permission validation
 */
function requirePermission(permissionKey) {
    return async (req, res, next) => {
        try {
            const { id: userId, clinic_id: clinicId } = req.user;
            
            const hasPermission = await checkUserPermission(userId, clinicId, permissionKey);
            
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required_permission: permissionKey
                });
            }
            
            next();
        } catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({ error: 'Permission validation failed' });
        }
    };
}

/**
 * Get user's permissions for frontend
 */
async function getUserPermissions(userId, clinicId) {
    try {
        // Check if user has Super User role
        const [userRoles] = await db.execute(`
            SELECT r.name 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
        `, [userId]);
        
        const roles = userRoles.map(row => row.name);
        
        // Super User has all permissions
        if (roles.includes('Super User') || roles.includes('SuperAdmin')) {
            return [
                'patient.add', 'patient.edit', 'patient.view', 'patient.delete',
                'appointment.create', 'appointment.edit', 'appointment.view', 'appointment.cancel',
                'billing.create', 'billing.edit', 'billing.view', 'billing.payment',
                'clinical.visit.create', 'clinical.visit.edit', 'clinical.visit.view', 'clinical.lab.order',
                'lab.request.create', 'lab.result.enter', 'lab.result.view', 'lab.dashboard',
                'reports.clinical', 'reports.financial', 'reports.patient', 'reports.export',
                'admin.users', 'admin.permissions', 'admin.settings', 'admin.audit'
            ];
        }

        // Get user's specific permissions
        const [permissions] = await db.execute(
            'SELECT permission_key FROM user_permissions WHERE user_id = ? AND clinic_id = ?',
            [userId, clinicId]
        );

        return permissions.map(p => p.permission_key);
    } catch (error) {
        console.error('Get user permissions error:', error);
        return [];
    }
}

module.exports = {
    checkUserPermission,
    requirePermission,
    getUserPermissions
};