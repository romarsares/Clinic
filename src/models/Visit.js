/**
 * Visit Model - Clinical Documentation
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles visit records, clinical documentation, and medical data management
 * 
 * This model manages the core clinical workflow including:
 * - Visit creation and management
 * - Chief complaint documentation
 * - Diagnosis entry and tracking
 * - Treatment plan documentation
 * - Vital signs recording
 * - Clinical assessments
 */

const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

class Visit {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new visit record
   */
  async create(visitData) {
    const {
      clinic_id,
      appointment_id,
      patient_id,
      doctor_id,
      visit_date = new Date(),
      status = 'open'
    } = visitData;

    const query = `
      INSERT INTO visits (clinic_id, appointment_id, patient_id, doctor_id, visit_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await this.db.execute(query, [
      clinic_id, appointment_id, patient_id, doctor_id, visit_date, status
    ]);

    return { id: result.insertId, ...visitData };
  }

  /**
   * Get visit by ID with clinical data
   */
  async getById(visitId, clinicId) {
    const query = `
      SELECT v.*, 
             p.full_name as patient_name,
             p.birth_date as patient_birth_date,
             u.full_name as doctor_name
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      JOIN auth_users u ON v.doctor_id = u.id
      WHERE v.id = ? AND v.clinic_id = ?
    `;

    const [rows] = await this.db.execute(query, [visitId, clinicId]);
    return rows[0] || null;
  }

  /**
   * Add chief complaint to visit
   */
  async addChiefComplaint(visitId, clinicId, complaint, recordedBy) {
    const query = `
      INSERT INTO visit_notes (visit_id, clinic_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, 'chief_complaint', ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW()
    `;

    await this.db.execute(query, [visitId, clinicId, complaint]);
    
    // Log the action
    await this.logAudit(clinicId, recordedBy, 'create', 'chief_complaint', visitId, null, complaint);
    
    return { success: true };
  }

  /**
   * Add diagnosis to visit (Doctor only)
   */
  async addDiagnosis(visitId, clinicId, diagnosisData, doctorId) {
    const {
      diagnosis_type = 'primary',
      diagnosis_code = null,
      diagnosis_name,
      clinical_notes = null
    } = diagnosisData;

    const query = `
      INSERT INTO visit_diagnoses (visit_id, clinic_id, diagnosis_type, diagnosis_code, 
                                   diagnosis_name, clinical_notes, diagnosed_by, diagnosed_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
    `;

    const [result] = await this.db.execute(query, [
      visitId, clinicId, diagnosis_type, diagnosis_code, diagnosis_name, clinical_notes, doctorId
    ]);

    // Log the action
    await this.logAudit(clinicId, doctorId, 'create', 'diagnosis', result.insertId, null, diagnosisData);

    return { id: result.insertId, ...diagnosisData };
  }

  /**
   * Record vital signs
   */
  async recordVitalSigns(visitId, clinicId, vitalsData, recordedBy) {
    const {
      temperature = null,
      blood_pressure_systolic = null,
      blood_pressure_diastolic = null,
      heart_rate = null,
      respiratory_rate = null,
      weight = null,
      height = null,
      oxygen_saturation = null
    } = vitalsData;

    // Calculate BMI if weight and height are provided
    let bmi = null;
    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    const query = `
      INSERT INTO visit_vital_signs (visit_id, clinic_id, temperature, blood_pressure_systolic, 
                                     blood_pressure_diastolic, heart_rate, respiratory_rate, weight, 
                                     height, bmi, oxygen_saturation, recorded_by, recorded_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        temperature = VALUES(temperature),
        blood_pressure_systolic = VALUES(blood_pressure_systolic),
        blood_pressure_diastolic = VALUES(blood_pressure_diastolic),
        heart_rate = VALUES(heart_rate),
        respiratory_rate = VALUES(respiratory_rate),
        weight = VALUES(weight),
        height = VALUES(height),
        bmi = VALUES(bmi),
        oxygen_saturation = VALUES(oxygen_saturation),
        recorded_by = VALUES(recorded_by),
        recorded_at = NOW()
    `;

    await this.db.execute(query, [
      visitId, clinicId, temperature, blood_pressure_systolic, blood_pressure_diastolic,
      heart_rate, respiratory_rate, weight, height, bmi, oxygen_saturation, recordedBy
    ]);

    // Log the action
    await this.logAudit(clinicId, recordedBy, 'create', 'vital_signs', visitId, null, { ...vitalsData, bmi });

    return { success: true, bmi };
  }

  /**
   * Add clinical assessment
   */
  async addClinicalAssessment(visitId, clinicId, assessment, doctorId) {
    const query = `
      INSERT INTO visit_notes (visit_id, clinic_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, 'clinical_assessment', ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW()
    `;

    await this.db.execute(query, [visitId, clinicId, assessment]);
    
    // Log the action
    await this.logAudit(clinicId, doctorId, 'create', 'clinical_assessment', visitId, null, assessment);
    
    return { success: true };
  }

  /**
   * Add treatment plan (Doctor only)
   */
  async addTreatmentPlan(visitId, clinicId, treatmentPlan, doctorId) {
    const query = `
      INSERT INTO visit_notes (visit_id, clinic_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, 'treatment_plan', ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW()
    `;

    await this.db.execute(query, [visitId, clinicId, treatmentPlan]);
    
    // Log the action
    await this.logAudit(clinicId, doctorId, 'create', 'treatment_plan', visitId, null, treatmentPlan);
    
    return { success: true };
  }

  /**
   * Add follow-up instructions
   */
  async addFollowUpInstructions(visitId, clinicId, instructions, doctorId) {
    const query = `
      INSERT INTO visit_notes (visit_id, clinic_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, 'follow_up_instructions', ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = NOW()
    `;

    await this.db.execute(query, [visitId, clinicId, instructions]);
    
    // Log the action
    await this.logAudit(clinicId, doctorId, 'create', 'follow_up_instructions', visitId, null, instructions);
    
    return { success: true };
  }

  /**
   * Get complete clinical summary for a visit
   */
  async getClinicalSummary(visitId, clinicId) {
    // Get visit details
    const visit = await this.getById(visitId, clinicId);
    if (!visit) return null;

    // Get all notes
    const notesQuery = `
      SELECT note_type, content, created_at, updated_at
      FROM visit_notes
      WHERE visit_id = ? AND clinic_id = ?
      ORDER BY created_at ASC
    `;
    const [notes] = await this.db.execute(notesQuery, [visitId, clinicId]);

    // Get diagnoses
    const diagnosesQuery = `
      SELECT vd.*, u.full_name as diagnosed_by_name
      FROM visit_diagnoses vd
      JOIN auth_users u ON vd.diagnosed_by = u.id
      WHERE vd.visit_id = ? AND vd.clinic_id = ?
      ORDER BY vd.diagnosis_type, vd.created_at
    `;
    const [diagnoses] = await this.db.execute(diagnosesQuery, [visitId, clinicId]);

    // Get vital signs
    const vitalsQuery = `
      SELECT vs.*, u.full_name as recorded_by_name
      FROM visit_vital_signs vs
      JOIN auth_users u ON vs.recorded_by = u.id
      WHERE vs.visit_id = ? AND vs.clinic_id = ?
      ORDER BY vs.recorded_at DESC
      LIMIT 1
    `;
    const [vitals] = await this.db.execute(vitalsQuery, [visitId, clinicId]);

    return {
      visit,
      notes: this.organizeNotes(notes),
      diagnoses,
      vital_signs: vitals[0] || null
    };
  }

  /**
   * Close visit (mark as complete)
   */
  async closeVisit(visitId, clinicId, doctorId) {
    const query = `
      UPDATE visits 
      SET status = 'closed', updated_at = NOW()
      WHERE id = ? AND clinic_id = ?
    `;

    await this.db.execute(query, [visitId, clinicId]);
    
    // Log the action
    await this.logAudit(clinicId, doctorId, 'update', 'visit', visitId, 'open', 'closed');
    
    return { success: true };
  }

  /**
   * Organize notes by type for easier access
   */
  organizeNotes(notes) {
    const organized = {};
    notes.forEach(note => {
      organized[note.note_type] = {
        content: note.content,
        created_at: note.created_at,
        updated_at: note.updated_at
      };
    });
    return organized;
  }

  /**
   * Log audit trail for clinical actions
   */
  async logAudit(clinicId, userId, action, entity, entityId, oldValue, newValue) {
    const query = `
      INSERT INTO audit_logs (clinic_id, user_id, action, entity, entity_id, old_value, new_value, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, '127.0.0.1', NOW())
    `;

    await this.db.execute(query, [
      clinicId, userId, action, entity, entityId,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null
    ]);
  }
}

module.exports = Visit;