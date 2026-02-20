/**
 * Patient Model - Demographics and Parent-Child Relationships
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles patient demographics and parent-child relationship data operations
 */

const { TenantDB, TenantValidator } = require('../middleware/tenant');

class Patient {
    constructor(db) {
        this.db = db;
        this.tenantDB = new TenantDB(db);
    }

    /**
     * Create new patient
     */
    async create(patientData) {
        const {
            clinic_id, first_name, last_name, birth_date, gender,
            contact_number = null, email = null, notes = null, parent_patient_id = null
        } = patientData;

        const full_name = `${first_name} ${last_name}`;
        const patient_code = `P${Date.now()}`;

        const query = `
            INSERT INTO patients (
                clinic_id, patient_code, full_name, first_name, last_name, birth_date, gender,
                contact_number, email, notes, parent_patient_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const [result] = await this.db.execute(query, [
            clinic_id, patient_code, full_name, first_name, last_name, birth_date, gender,
            contact_number, email, notes, parent_patient_id
        ]);

        return this.getById(result.insertId);
    }

    /**
     * Create child patient with parent relationship
     */
    async createChild(parentId, childData) {
        childData.parent_patient_id = parentId;
        return this.create(childData);
    }

    /**
     * Get patient by ID
     */
    async getById(id) {
        const query = `
            SELECT p.*, c.name as clinic_name,
                   TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as age
            FROM patients p
            LEFT JOIN clinics c ON p.clinic_id = c.id
            WHERE p.id = ?
        `;
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    /**
     * List patients by clinic
     */
    async listByClinic(clinicId, options = {}) {
        const { page = 1, limit = 20, type = 'all' } = options;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE p.clinic_id = ?';
        const queryParams = [clinicId];

        if (type === 'parent') {
            whereClause += ' AND p.parent_patient_id IS NULL';
        } else if (type === 'child') {
            whereClause += ' AND p.parent_patient_id IS NOT NULL';
        }

        const query = `
            SELECT p.id, p.patient_code, p.full_name, p.first_name, p.last_name, p.birth_date, 
                   p.gender, p.contact_number, p.email, p.created_at, p.is_active,
                   TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as age
            FROM patients p
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [patients] = await this.db.query(query, [clinicId, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await this.db.query(
            `SELECT COUNT(*) as total FROM patients p ${whereClause}`,
            queryParams
        );
        
        return { patients, total: countResult[0].total };
    }

    /**
     * Update patient information
     */
    async update(id, updateData, clinicId) {
        const {
            first_name, last_name, birth_date, gender, contact_number, email, notes, is_active
        } = updateData;

        const full_name = first_name && last_name ? `${first_name} ${last_name}` : undefined;
        const fields = [];
        const values = [];

        if (first_name) { fields.push('first_name = ?'); values.push(first_name); }
        if (last_name) { fields.push('last_name = ?'); values.push(last_name); }
        if (full_name) { fields.push('full_name = ?'); values.push(full_name); }
        if (birth_date) { fields.push('birth_date = ?'); values.push(birth_date); }
        if (gender) { fields.push('gender = ?'); values.push(gender); }
        if (contact_number !== undefined) { fields.push('contact_number = ?'); values.push(contact_number); }
        if (email !== undefined) { fields.push('email = ?'); values.push(email); }
        if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
        if (is_active !== undefined) { 
            fields.push('is_active = ?'); 
            values.push(is_active ? 1 : 0);
        }
        
        fields.push('updated_at = NOW()');
        values.push(id, clinicId);

        const query = `UPDATE patients SET ${fields.join(', ')} WHERE id = ? AND clinic_id = ?`;
        await this.db.execute(query, values);

        return this.getById(id);
    }

    /**
     * Search patients
     */
    async search(clinicId, searchTerm, options = {}) {
        const { limit = 10 } = options;
        
        const query = `
            SELECT p.id, p.patient_code, p.full_name, p.first_name, p.last_name, p.birth_date, 
                   p.gender, p.contact_number, p.email,
                   TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as age
            FROM patients p
            WHERE p.clinic_id = ? 
            AND p.is_active = 1
            AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.full_name LIKE ? OR p.contact_number LIKE ? OR p.email LIKE ? OR p.patient_code LIKE ?)
            ORDER BY p.first_name, p.last_name
            LIMIT ?
        `;

        const searchPattern = `%${searchTerm}%`;
        const [rows] = await this.db.query(query, [
            clinicId, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, limit
        ]);

        return rows;
    }

    /**
     * Get patient's children
     */
    async getChildren(parentId, clinicId) {
        const query = `
            SELECT p.id, p.patient_code, p.full_name, p.first_name, p.last_name, p.birth_date, 
                   p.gender, p.contact_number, p.email,
                   TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as age
            FROM patients p
            WHERE p.parent_patient_id = ? AND p.clinic_id = ? AND p.is_active = 1
            ORDER BY p.birth_date DESC
        `;

        const [rows] = await this.db.execute(query, [parentId, clinicId]);
        return rows;
    }

    /**
     * Get patient's parent
     */
    async getParent(childId, clinicId) {
        const query = `
            SELECT parent.id, parent.patient_code, parent.full_name, parent.first_name, parent.last_name, 
                   parent.birth_date, parent.gender, parent.contact_number, parent.email,
                   TIMESTAMPDIFF(YEAR, parent.birth_date, CURDATE()) as age
            FROM patients child
            INNER JOIN patients parent ON child.parent_patient_id = parent.id
            WHERE child.id = ? AND child.clinic_id = ? AND parent.is_active = 1
        `;

        const [rows] = await this.db.execute(query, [childId, clinicId]);
        return rows[0] || null;
    }

    /**
     * Check if user is parent of patient
     */
    async isParentOf(userId, patientId) {
        // This would need to be implemented based on how parent users are linked to patient records
        // For now, return false as this requires additional user-patient relationship table
        return false;
    }

    /**
     * Get patient statistics for clinic
     */
    async getClinicStats(clinicId) {
        const queries = {
            totalPatients: 'SELECT COUNT(*) as count FROM patients WHERE clinic_id = ? AND is_active = 1',
            parentPatients: 'SELECT COUNT(*) as count FROM patients WHERE clinic_id = ? AND parent_patient_id IS NULL AND is_active = 1',
            childPatients: 'SELECT COUNT(*) as count FROM patients WHERE clinic_id = ? AND parent_patient_id IS NOT NULL AND is_active = 1',
            newPatientsThisMonth: `
                SELECT COUNT(*) as count FROM patients 
                WHERE clinic_id = ? AND is_active = 1
                AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
            `
        };

        const stats = {};
        
        for (const [key, query] of Object.entries(queries)) {
            const [rows] = await this.db.execute(query, [clinicId]);
            stats[key] = rows[0].count;
        }

        return stats;
    }

    /**
     * Get patients by age group
     */
    async getPatientsByAgeGroup(clinicId) {
        const query = `
            SELECT 
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 1 THEN 'Infant (0-1)'
                    WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 5 THEN 'Toddler (1-4)'
                    WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 13 THEN 'Child (5-12)'
                    WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 18 THEN 'Teen (13-17)'
                    WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 65 THEN 'Adult (18-64)'
                    ELSE 'Senior (65+)'
                END as age_group,
                COUNT(*) as count
            FROM patients 
            WHERE clinic_id = ? AND is_active = 1
            GROUP BY age_group
            ORDER BY count DESC
        `;

        const [rows] = await this.db.execute(query, [clinicId]);
        return rows;
    }

    /**
     * Soft delete patient
     */
    async softDelete(id, clinicId) {
        const query = 'UPDATE patients SET is_active = 0, updated_at = NOW() WHERE id = ? AND clinic_id = ?';
        await this.db.execute(query, [id, clinicId]);
        return true;
    }
}

module.exports = Patient;