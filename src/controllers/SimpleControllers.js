const db = require('../config/database');

class SimpleControllers {
    static async getUsers(req, res) {
        try {
            const clinicId = 1; // Fixed clinic ID
            
            const [users] = await db.execute(`
                SELECT u.id, u.email, u.first_name, u.last_name, u.full_name, u.created_at,
                       r.name as role_name, u.status
                FROM auth_users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.clinic_id = ?
                ORDER BY u.created_at DESC
            `, [clinicId]);
            
            // Transform to match dashboard expectations
            const transformedUsers = users.slice(0, 5).map(user => ({
                ...user,
                roles: user.role_name ? [user.role_name] : []
            }));
            
            res.json({ data: transformedUsers });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    static async getAuditLogs(req, res) {
        try {
            const clinicId = 1; // Fixed clinic ID
            
            const [logs] = await db.execute(`
                SELECT al.id, al.action, al.table_name, al.record_id, 
                       al.created_at, u.email as user_email, u.full_name as user_name,
                       al.entity
                FROM audit_logs al
                LEFT JOIN auth_users u ON al.user_id = u.id
                WHERE al.clinic_id = ?
                ORDER BY al.created_at DESC
            `, [clinicId]);
            
            // Limit in JavaScript and wrap in data object
            const limitedLogs = logs.slice(0, 10);
            res.json({ data: limitedLogs });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({ error: 'Failed to fetch audit logs' });
        }
    }
}

module.exports = SimpleControllers;