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
            clinic_id, first_name, last_name, date_of_birth, gender, patient_type = 'adult',
            contact_number, email, address, emergency_contact_name, emergency_contact_number
        } = patientData;

        const query = `
            INSERT INTO patients (
                clinic_id, first_name, last_name, date_of_birth, gender, patient_type,
                contact_number, email, address, emergency_contact_name, emergency_contact_number,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
        `;

        const [result] = await this.db.execute(query, [
            clinic_id, first_name, last_name, date_of_birth, gender, patient_type,
            contact_number, email, address, emergency_contact_name, emergency_contact_number
        ]);

        return this.getById(result.insertId);
    }

    /**
     * Create child patient with parent relationship
     */
    async createChild(parentId, childData) {
        const connection = await this.db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Create child patient
            const child = await this.create(childData);
            
            // Create parent-child relationship
            const relationshipQuery = `
                INSERT INTO patient_relationships (parent_id, child_id, relationship_type, created_at)
                VALUES (?, ?, 'parent_child', NOW())
            `;
            await connection.execute(relationshipQuery, [parentId, child.id]);
            
            await connection.commit();
            return child;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Get patient by ID
     */
    async getById(id) {
        const query = `
            SELECT p.*, c.name as clinic_name,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age
            FROM patients p
            LEFT JOIN clinics c ON p.clinic_id = c.id
            WHERE p.id = ? AND p.status != 'deleted'
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

        let whereClause = 'WHERE p.clinic_id = ? AND p.status != "deleted"';
        let params = [clinicId];

        if (type !== 'all') {
            whereClause += ' AND p.patient_type = ?';
            params.push(type);
        }

        const query = `
            SELECT p.id, p.first_name, p.last_name, p.date_of_birth, p.gender, p.patient_type,
                   p.contact_number, p.email, p.status, p.created_at,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
                   COUNT(pr.child_id) as children_count
            FROM patients p
            LEFT JOIN patient_relationships pr ON p.id = pr.parent_id
            ${whereClause}
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
        const [rows] = await this.db.execute(query, params);
        return rows;
    }

    /**
     * Update patient information
     */
    async update(id, updateData) {
        const {
            first_name, last_name, contact_number, email, address,
            emergency_contact_name, emergency_contact_number
        } = updateData;

        const query = `
            UPDATE patients 
            SET first_name = ?, last_name = ?, contact_number = ?, email = ?, address = ?,
                emergency_contact_name = ?, emergency_contact_number = ?, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.execute(query, [
            first_name, last_name, contact_number, email, address,
            emergency_contact_name, emergency_contact_number, id
        ]);

        return this.getById(id);
    }

    /**
     * Search patients
     */
    async search(clinicId, searchTerm, options = {}) {
        const { limit = 10 } = options;
        
        const query = `
            SELECT p.id, p.first_name, p.last_name, p.date_of_birth, p.gender, p.patient_type,
                   p.contact_number, p.email,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age
            FROM patients p
            WHERE p.clinic_id = ? 
            AND p.status != 'deleted'
            AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.contact_number LIKE ? OR p.email LIKE ?)
            ORDER BY p.first_name, p.last_name
            LIMIT ?
        `;

        const searchPattern = `%${searchTerm}%`;
        const [rows] = await this.db.execute(query, [
            clinicId, searchPattern, searchPattern, searchPattern, searchPattern, limit
        ]);

        return rows;
    }

    /**
     * Get patient's children
     */
    async getChildren(parentId) {
        const query = `
            SELECT p.id, p.first_name, p.last_name, p.date_of_birth, p.gender,
                   p.contact_number, p.email, p.status,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age
            FROM patients p
            INNER JOIN patient_relationships pr ON p.id = pr.child_id
            WHERE pr.parent_id = ? AND p.status != 'deleted'
            ORDER BY p.date_of_birth DESC
        `;

        const [rows] = await this.db.execute(query, [parentId]);
        return rows;
    }

    /**
     * Get patient's parent
     */
    async getParent(childId) {
        const query = `
            SELECT p.id, p.first_name, p.last_name, p.date_of_birth, p.gender,
                   p.contact_number, p.email, p.status,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age
            FROM patients p
            INNER JOIN patient_relationships pr ON p.id = pr.parent_id
            WHERE pr.child_id = ? AND p.status != 'deleted'
        `;

        const [rows] = await this.db.execute(query, [childId]);
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
            totalPatients: 'SELECT COUNT(*) as count FROM patients WHERE clinic_id = ? AND status != "deleted"',
            adultPatients: 'SELECT COUNT(*) as count FROM patients WHERE clinic_id = ? AND patient_type = "adult" AND status != "deleted"',
            childPatients: 'SELECT COUNT(*) as count FROM patients WHERE clinic_id = ? AND patient_type = "child" AND status != "deleted"',
            newPatientsThisMonth: `
                SELECT COUNT(*) as count FROM patients 
                WHERE clinic_id = ? AND status != "deleted"
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
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 1 THEN 'Infant (0-1)'
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 5 THEN 'Toddler (1-4)'
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 13 THEN 'Child (5-12)'
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN 'Teen (13-17)'
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 65 THEN 'Adult (18-64)'
                    ELSE 'Senior (65+)'
                END as age_group,
                COUNT(*) as count
            FROM patients 
            WHERE clinic_id = ? AND status != 'deleted'
            GROUP BY age_group
            ORDER BY count DESC
        `;

        const [rows] = await this.db.execute(query, [clinicId]);
        return rows;
    }

    /**
     * Soft delete patient
     */
    async softDelete(id) {
        const query = 'UPDATE patients SET status = "deleted", updated_at = NOW() WHERE id = ?';
        await this.db.execute(query, [id]);
        return true;
    }
}

module.exports = Patient;