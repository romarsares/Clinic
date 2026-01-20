const db = require('../config/database');

class AuditController {
    static async getLogs(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const clinicId = req.user?.clinic_id || 1;
            
            console.log('Audit query params:', { clinicId, limit, types: typeof clinicId, typeof limit });
            
            const query = `
                SELECT al.id, al.action, al.table_name, al.record_id, 
                       al.created_at, u.email as user_email
                FROM audit_logs al
                LEFT JOIN auth_users u ON al.user_id = u.id
                WHERE al.clinic_id = ?
                ORDER BY al.created_at DESC
                LIMIT ?
            `;
            
            const [logs] = await db.execute(query, [clinicId, limit]);
            
            res.json(logs);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({ error: 'Failed to fetch audit logs' });
        }
    }
}

module.exports = AuditController;