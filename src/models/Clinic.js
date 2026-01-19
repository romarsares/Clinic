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
     * List all clinics (Admin only)
     */
    async list() {
        const query = 'SELECT * FROM clinics ORDER BY created_at DESC';
        const [rows] = await this.db.execute(query);
        return rows;
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
