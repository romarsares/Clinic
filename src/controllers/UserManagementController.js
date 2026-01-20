const bcrypt = require('bcryptjs');
const db = require('../config/database');

class UserManagementController {
    static async getUsers(req, res) {
        try {
            const clinicId = req.user?.clinic_id || 1;
            
            const [users] = await db.execute(`
                SELECT u.id, u.email, u.first_name, u.last_name, u.full_name, u.created_at,
                       r.name as role_name, u.status
                FROM auth_users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.clinic_id = ?
                ORDER BY u.created_at DESC
            `, [clinicId]);
            
            res.json({ data: users });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    static async createUser(req, res) {
        try {
            const { full_name, email, password, role, status = 'active' } = req.body;
            const clinicId = req.user?.clinic_id || 1;

            // Check if user exists
            const [existing] = await db.execute(
                'SELECT id FROM auth_users WHERE email = ? AND clinic_id = ?',
                [email, clinicId]
            );

            if (existing.length > 0) {
                return res.status(409).json({ error: 'User already exists' });
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, 10);
            
            // Split full name
            const nameParts = full_name.split(' ');
            const first_name = nameParts[0];
            const last_name = nameParts.slice(1).join(' ') || '';

            // Create user
            const [result] = await db.execute(`
                INSERT INTO auth_users (clinic_id, email, password_hash, first_name, last_name, full_name, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [clinicId, email, password_hash, first_name, last_name, full_name, status]);

            // Assign role if provided
            if (role) {
                const [roleResult] = await db.execute(
                    'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                    [role, clinicId]
                );

                if (roleResult.length > 0) {
                    await db.execute(
                        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
                        [result.insertId, roleResult[0].id]
                    );
                }
            }

            res.status(201).json({ 
                success: true, 
                message: 'User created successfully',
                data: { id: result.insertId, email, full_name }
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }

    static async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const { full_name, email, role, status } = req.body;
            const clinicId = req.user?.clinic_id || 1;

            // Split full name
            const nameParts = full_name.split(' ');
            const first_name = nameParts[0];
            const last_name = nameParts.slice(1).join(' ') || '';

            // Update user
            await db.execute(`
                UPDATE auth_users 
                SET first_name = ?, last_name = ?, full_name = ?, email = ?, status = ?
                WHERE id = ? AND clinic_id = ?
            `, [first_name, last_name, full_name, email, status, userId, clinicId]);

            // Update role if provided
            if (role) {
                // Remove existing roles
                await db.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);
                
                // Add new role
                const [roleResult] = await db.execute(
                    'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                    [role, clinicId]
                );

                if (roleResult.length > 0) {
                    await db.execute(
                        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
                        [userId, roleResult[0].id]
                    );
                }
            }

            res.json({ success: true, message: 'User updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }

    static async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const clinicId = req.user?.clinic_id || 1;

            // Remove user roles first
            await db.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);
            
            // Delete user
            await db.execute(
                'DELETE FROM auth_users WHERE id = ? AND clinic_id = ?',
                [userId, clinicId]
            );

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
}

module.exports = UserManagementController;