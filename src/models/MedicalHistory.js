/**
 * Medical History Model - Patient Medical Records Tracking
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles patient medical history, allergies, medications, and family history
 */

const { TenantDB, TenantValidator } = require('../middleware/tenant');

class MedicalHistory {
    constructor(db) {
        this.db = db;
        this.tenantDB = new TenantDB(db);
    }

    /**
     * Add allergy record
     */
    async addAllergy(patientId, clinicId, allergyData, recordedBy) {
        const { allergen, reaction, severity = 'mild', notes = null } = allergyData;

        const insertData = {
            patient_id: patientId,
            allergen,
            reaction,
            severity,
            notes,
            recorded_by: recordedBy,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        };

        const [result] = await this.tenantDB.insertWithTenant('patient_allergies', insertData, clinicId);
        return { id: result.insertId, ...insertData };
    }

    /**
     * Get patient allergies
     */
    async getAllergies(patientId, clinicId) {
        const query = `
            SELECT pa.*, u.full_name as recorded_by_name
            FROM patient_allergies pa
            LEFT JOIN auth_users u ON pa.recorded_by = u.id
            WHERE pa.patient_id = ? AND pa.clinic_id = ? AND pa.status = 'active'
            ORDER BY pa.severity DESC, pa.created_at DESC
        `;
        const [rows] = await this.db.execute(query, [patientId, clinicId]);
        return rows;
    }

    /**
     * Add current medication
     */
    async addCurrentMedication(patientId, clinicId, medicationData, recordedBy) {
        const { 
            medication_name, 
            dosage, 
            frequency, 
            route = 'oral',
            start_date,
            end_date = null,
            prescribing_doctor = null,
            notes = null 
        } = medicationData;

        const insertData = {
            patient_id: patientId,
            medication_name,
            dosage,
            frequency,
            route,
            start_date,
            end_date,
            prescribing_doctor,
            notes,
            recorded_by: recordedBy,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        };

        const [result] = await this.tenantDB.insertWithTenant('patient_medications', insertData, clinicId);
        return { id: result.insertId, ...insertData };
    }

    /**
     * Get current medications
     */
    async getCurrentMedications(patientId, clinicId) {
        const query = `
            SELECT pm.*, 
                   u1.full_name as recorded_by_name,
                   u2.full_name as prescribing_doctor_name
            FROM patient_medications pm
            LEFT JOIN auth_users u1 ON pm.recorded_by = u1.id
            LEFT JOIN auth_users u2 ON pm.prescribing_doctor = u2.id
            WHERE pm.patient_id = ? AND pm.clinic_id = ? 
            AND pm.status = 'active'
            AND (pm.end_date IS NULL OR pm.end_date >= CURDATE())
            ORDER BY pm.start_date DESC
        `;
        const [rows] = await this.db.execute(query, [patientId, clinicId]);
        return rows;
    }

    /**
     * Add past medical history
     */
    async addPastMedicalHistory(patientId, clinicId, historyData, recordedBy) {
        const { 
            condition, 
            diagnosis_date, 
            treatment, 
            outcome = null,
            notes = null 
        } = historyData;

        const insertData = {
            patient_id: patientId,
            condition,
            diagnosis_date,
            treatment,
            outcome,
            notes,
            recorded_by: recordedBy,
            created_at: new Date(),
            updated_at: new Date()
        };

        const [result] = await this.tenantDB.insertWithTenant('patient_medical_history', insertData, clinicId);
        return { id: result.insertId, ...insertData };
    }

    /**
     * Get past medical history
     */
    async getPastMedicalHistory(patientId, clinicId) {
        const query = `
            SELECT pmh.*, u.full_name as recorded_by_name
            FROM patient_medical_history pmh
            LEFT JOIN auth_users u ON pmh.recorded_by = u.id
            WHERE pmh.patient_id = ? AND pmh.clinic_id = ?
            ORDER BY pmh.diagnosis_date DESC
        `;
        const [rows] = await this.db.execute(query, [patientId, clinicId]);
        return rows;
    }

    /**
     * Add family medical history
     */
    async addFamilyHistory(patientId, clinicId, familyData, recordedBy) {
        const { 
            relationship, 
            condition, 
            age_at_diagnosis = null,
            notes = null 
        } = familyData;

        const insertData = {
            patient_id: patientId,
            relationship,
            condition,
            age_at_diagnosis,
            notes,
            recorded_by: recordedBy,
            created_at: new Date(),
            updated_at: new Date()
        };

        const [result] = await this.tenantDB.insertWithTenant('patient_family_history', insertData, clinicId);
        return { id: result.insertId, ...insertData };
    }

    /**
     * Get family medical history
     */
    async getFamilyHistory(patientId, clinicId) {
        const query = `
            SELECT pfh.*, u.full_name as recorded_by_name
            FROM patient_family_history pfh
            LEFT JOIN auth_users u ON pfh.recorded_by = u.id
            WHERE pfh.patient_id = ? AND pfh.clinic_id = ?
            ORDER BY pfh.relationship, pfh.created_at DESC
        `;
        const [rows] = await this.db.execute(query, [patientId, clinicId]);
        return rows;
    }

    /**
     * Get complete medical history summary
     */
    async getCompleteMedicalHistory(patientId, clinicId) {
        const [allergies, medications, pastHistory, familyHistory] = await Promise.all([
            this.getAllergies(patientId, clinicId),
            this.getCurrentMedications(patientId, clinicId),
            this.getPastMedicalHistory(patientId, clinicId),
            this.getFamilyHistory(patientId, clinicId)
        ]);

        return {
            allergies,
            current_medications: medications,
            past_medical_history: pastHistory,
            family_history: familyHistory
        };
    }

    /**
     * Update allergy status
     */
    async updateAllergyStatus(allergyId, clinicId, status) {
        await this.tenantDB.updateWithTenant('patient_allergies', 
            { status, updated_at: new Date() }, 
            { id: allergyId }, 
            clinicId
        );
        return true;
    }

    /**
     * Stop medication
     */
    async stopMedication(medicationId, clinicId, endDate = new Date()) {
        await this.tenantDB.updateWithTenant('patient_medications', 
            { status: 'discontinued', end_date: endDate, updated_at: new Date() }, 
            { id: medicationId }, 
            clinicId
        );
        return true;
    }
}

module.exports = MedicalHistory;