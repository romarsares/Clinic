/**
 * User Model - Per Tenant User Management
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles user data operations within clinic tenants
 */

const bcrypt = require('bcryptjs');

class User {
    constructor(db) {
        this.db = db;
    }

    /**
     * Create new user
     */
    async create(userData) {
        const { email, password, full_name, clinic_id, roles = ['Staff'] } = userData;
        
        // Hash password
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const userQuery = `
            INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
        `;
        const [result] = await this.db.execute(userQuery, [clinic_id, email, password_hash, full_name]);
        const userId = result.insertId;

        // Assign roles
        await this.assignRoles(userId, roles);

        return this.getById(userId);
    }

    /**
     * Get user by ID with roles
     */
    async getById(id) {
        const query = `
            SELECT u.id, u.clinic_id, u.email, u.full_name, u.status, u.created_at, u.updated_at, u.last_login_at,
                   GROUP_CONCAT(r.name) as roles,
                   c.name as clinic_name
            FROM auth_users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN clinics c ON u.clinic_id = c.id
            WHERE u.id = ?
            GROUP BY u.id
        `;
        const [rows] = await this.db.execute(query, [id]);
        
        if (rows.length === 0) return null;
        
        const user = rows[0];
        user.roles = user.roles ? user.roles.split(',') : [];
        return user;
    }

    /**
     * Get user by email with password hash (for authentication)
     */
    async getByEmailWithPassword(email) {
        const query = `
            SELECT u.id, u.clinic_id, u.email, u.password_hash, u.full_name, u.status,
                   GROUP_CONCAT(r.name) as roles
            FROM auth_users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.email = ?
            GROUP BY u.id
        `;
        const [rows] = await this.db.execute(query, [email]);
        
        if (rows.length === 0) return null;
        
        const user = rows[0];
        user.roles = user.roles ? user.roles.split(',') : [];
        return user;
    }

    /**
     * List users by clinic
     */
    async listByClinic(clinicId, options = {}) {
        const { status = 'active', limit = 100, offset = 0 } = options;
        
        let whereClause = 'WHERE u.clinic_id = ?';
        let params = [clinicId];
        
        if (status !== 'all') {
            whereClause += ' AND u.status = ?';
            params.push(status);
        }

        const query = `
            SELECT u.id, u.clinic_id, u.email, u.full_name, u.status, u.created_at, u.updated_at, u.last_login_at,
                   GROUP_CONCAT(r.name) as roles
            FROM auth_users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            ${whereClause}
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        params.push(limit, offset);
        const [rows] = await this.db.execute(query, params);
        
        return rows.map(user => ({
            ...user,
            roles: user.roles ? user.roles.split(',') : []
        }));
    }

    /**
     * Update user information
     */
    async update(id, updateData) {
        const { full_name, email } = updateData;
        
        const query = `
            UPDATE auth_users 
            SET full_name = ?, email = ?, updated_at = NOW()
            WHERE id = ?
        `;
        await this.db.execute(query, [full_name, email, id]);
        
        return this.getById(id);
    }

    /**
     * Update user password
     */
    async updatePassword(id, newPassword) {
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(newPassword, saltRounds);
        
        const query = 'UPDATE auth_users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
        await this.db.execute(query, [password_hash, id]);
        
        return true;
    }

    /**
     * Update user status
     */
    async updateStatus(id, status) {
        const query = 'UPDATE auth_users SET status = ?, updated_at = NOW() WHERE id = ?';
        await this.db.execute(query, [status, id]);
        
        return true;
    }

    /**
     * Soft delete user
     */
    async softDelete(id) {
        const query = 'UPDATE auth_users SET status = "deleted", updated_at = NOW() WHERE id = ?';
        await this.db.execute(query, [id]);
        
        return true;
    }

    /**
     * Update user roles
     */
    async updateRoles(userId, roles) {
        // Start transaction
        const connection = await this.db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Remove existing roles
            await connection.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);
            
            // Add new roles
            await this.assignRoles(userId, roles, connection);
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Assign roles to user
     */
    async assignRoles(userId, roles, connection = null) {
        const db = connection || this.db;
        
        if (!roles || roles.length === 0) return;
        
        // Get role IDs
        const placeholders = roles.map(() => '?').join(',');
        const roleQuery = `SELECT id, name FROM roles WHERE name IN (${placeholders})`;
        const [roleRows] = await db.execute(roleQuery, roles);
        
        if (roleRows.length === 0) return;
        
        // Insert user roles
        const userRoleQuery = 'INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())';
        
        for (const role of roleRows) {
            await db.execute(userRoleQuery, [userId, role.id]);
        }
    }

    /**
     * Get user statistics for a clinic
     */
    async getClinicStats(clinicId) {
        const queries = {
            totalUsers: 'SELECT COUNT(*) as count FROM auth_users WHERE clinic_id = ?',
            activeUsers: 'SELECT COUNT(*) as count FROM auth_users WHERE clinic_id = ? AND status = "active"',
            inactiveUsers: 'SELECT COUNT(*) as count FROM auth_users WHERE clinic_id = ? AND status = "inactive"',
            usersByRole: `
                SELECT r.name as role, COUNT(ur.user_id) as count
                FROM roles r
                LEFT JOIN user_roles ur ON r.id = ur.role_id
                LEFT JOIN auth_users u ON ur.user_id = u.id AND u.clinic_id = ?
                GROUP BY r.id, r.name
                ORDER BY count DESC
            `
        };

        const stats = {};
        
        // Get basic counts
        for (const [key, query] of Object.entries(queries)) {
            if (key === 'usersByRole') continue;
            
            const [rows] = await this.db.execute(query, [clinicId]);
            stats[key] = rows[0].count;
        }
        
        // Get users by role
        const [roleRows] = await this.db.execute(queries.usersByRole, [clinicId]);
        stats.usersByRole = roleRows;

        return stats;
    }

    /**
     * Search users in clinic
     */
    async search(clinicId, searchTerm, options = {}) {
        const { limit = 20, offset = 0 } = options;
        
        const query = `
            SELECT u.id, u.clinic_id, u.email, u.full_name, u.status, u.created_at,
                   GROUP_CONCAT(r.name) as roles
            FROM auth_users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.clinic_id = ? 
            AND (u.full_name LIKE ? OR u.email LIKE ?)
            AND u.status != 'deleted'
            GROUP BY u.id
            ORDER BY u.full_name
            LIMIT ? OFFSET ?
        `;
        
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await this.db.execute(query, [clinicId, searchPattern, searchPattern, limit, offset]);
        
        return rows.map(user => ({
            ...user,
            roles: user.roles ? user.roles.split(',') : []
        }));
    }
}

module.exports = User;