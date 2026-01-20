const db = require('../config/database');

class UserController {
    static async getUsers(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const clinicId = req.user?.clinic_id || 1;
            
            console.log('User query params:', { clinicId, limit, clinicIdType: typeof clinicId, limitType: typeof limit });
            
            const query = `
                SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
                       r.name as role_name
                FROM auth_users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.clinic_id = ?
                ORDER BY u.created_at DESC
                LIMIT ?
            `;
            
            const [users] = await db.execute(query, [clinicId, limit]);
            
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
}

module.exports = UserController;