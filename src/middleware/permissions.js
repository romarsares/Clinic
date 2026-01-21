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
        // Super User has all permissions
        const [user] = await db.execute(
            'SELECT roles FROM auth_users WHERE id = ? AND clinic_id = ?',
            [userId, clinicId]
        );
        
        if (user.length && JSON.parse(user[0].roles || '[]').includes('Super User')) {
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
        // Super User has all permissions
        const [user] = await db.execute(
            'SELECT roles FROM auth_users WHERE id = ? AND clinic_id = ?',
            [userId, clinicId]
        );
        
        if (user.length && JSON.parse(user[0].roles || '[]').includes('Super User')) {
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