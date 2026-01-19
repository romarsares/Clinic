/**
 * Clinic Model - Tenant Management
 * 
 * Author: Antigravity
 * Created: 2026-01-19
 * Purpose: Handles clinic profile and settings data access
 */

class Clinic {
    constructor(db) {
        this.db = db;
    }

    /**
     * Create new clinic
     */
    async create(clinicData) {
        const { name, address, contact_number, email, timezone = 'Asia/Manila' } = clinicData;
        const query = `
            INSERT INTO clinics (name, address, contact_number, email, timezone, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
        `;
        const [result] = await this.db.execute(query, [name, address, contact_number, email, timezone]);
        return this.getById(result.insertId);
    }

    /**
     * Get clinic by ID
     */
    async getById(id) {
        const query = 'SELECT * FROM clinics WHERE id = ?';
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    /**
     * Update clinic information
     */
    async update(id, updateData) {
        const { name, address, contact_number, email, timezone } = updateData;
        const query = `
            UPDATE clinics 
            SET name = ?, address = ?, contact_number = ?, email = ?, timezone = ?, updated_at = NOW()
            WHERE id = ?
        `;
        await this.db.execute(query, [name, address, contact_number, email, timezone, id]);
        return this.getById(id);
    }

    /**
     * Deactivate clinic (soft delete)
     */
    async deactivate(id) {
        const query = 'UPDATE clinics SET status = "inactive", updated_at = NOW() WHERE id = ?';
        await this.db.execute(query, [id]);
        return true;
    }

    /**
     * List all clinics (Admin only)
     */
    async list() {
        const query = 'SELECT * FROM clinics ORDER BY created_at DESC';
        const [rows] = await this.db.execute(query);
        return rows;
    }

    /**
     * Get clinic statistics
     */
    async getStats(clinicId) {
        const queries = {
            totalUsers: 'SELECT COUNT(*) as count FROM users WHERE clinic_id = ?',
            totalVisits: 'SELECT COUNT(*) as count FROM visits WHERE clinic_id = ?',
            activeUsers: 'SELECT COUNT(*) as count FROM users WHERE clinic_id = ? AND status = "active"',
            todayVisits: 'SELECT COUNT(*) as count FROM visits WHERE clinic_id = ? AND DATE(created_at) = CURDATE()'
        };

        const stats = {};
        for (const [key, query] of Object.entries(queries)) {
            const [rows] = await this.db.execute(query, [clinicId]);
            stats[key] = rows[0].count;
        }

        return stats;
    }

    /**
     * Get all settings for a clinic
     */
    async getSettings(clinicId) {
        const query = 'SELECT `key`, `value` FROM clinic_settings WHERE clinic_id = ?';
        const [rows] = await this.db.execute(query, [clinicId]);

        // Transform to object key-value pairs
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        return settings;
    }

    /**
     * Update or create a clinic setting
     */
    async updateSetting(clinicId, key, value) {
        const query = `
            INSERT INTO clinic_settings (clinic_id, \`key\`, \`value\`, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), updated_at = NOW()
        `;
        await this.db.execute(query, [clinicId, key, value]);
        return { key, value };
    }

    /**
     * Delete a clinic setting
     */
    async deleteSetting(clinicId, key) {
        const query = 'DELETE FROM clinic_settings WHERE clinic_id = ? AND `key` = ?';
        await this.db.execute(query, [clinicId, key]);
        return true;
    }
}

module.exports = Clinic;
