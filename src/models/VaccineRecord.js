const db = require('../config/database');

class VaccineRecord {
  // Create vaccine record
  static async create(clinicId, vaccineData) {
    const {
      patient_id,
      vaccine_name,
      vaccine_type,
      administered_date,
      dose_number,
      batch_number,
      manufacturer,
      site_administered,
      administered_by,
      notes
    } = vaccineData;

    const [result] = await db.execute(`
      INSERT INTO patient_vaccines (
        clinic_id, patient_id, vaccine_name, vaccine_type, administered_date,
        dose_number, batch_number, manufacturer, site_administered, 
        administered_by, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      clinicId, patient_id, vaccine_name, vaccine_type, administered_date,
      dose_number, batch_number, manufacturer, site_administered,
      administered_by, notes
    ]);

    return this.getById(clinicId, result.insertId);
  }

  // Get vaccine by ID
  static async getById(clinicId, vaccineId) {
    const [vaccines] = await db.execute(`
      SELECT pv.*, u.full_name as administered_by_name, p.full_name as patient_name
      FROM patient_vaccines pv
      LEFT JOIN auth_users u ON pv.administered_by = u.id
      LEFT JOIN patients p ON pv.patient_id = p.id
      WHERE pv.id = ? AND pv.clinic_id = ?
    `, [vaccineId, clinicId]);

    return vaccines[0] || null;
  }

  // Get all vaccines for a patient
  static async getByPatient(clinicId, patientId) {
    const [vaccines] = await db.execute(`
      SELECT pv.*, u.full_name as administered_by_name
      FROM patient_vaccines pv
      LEFT JOIN auth_users u ON pv.administered_by = u.id
      WHERE pv.patient_id = ? AND pv.clinic_id = ?
      ORDER BY pv.administered_date DESC
    `, [patientId, clinicId]);

    return vaccines;
  }

  // Get vaccine schedule compliance for a patient
  static async getScheduleCompliance(clinicId, patientId) {
    // Get patient birth date
    const [patient] = await db.execute(`
      SELECT birth_date, gender FROM patients WHERE id = ? AND clinic_id = ?
    `, [patientId, clinicId]);

    if (!patient[0]) {
      throw new Error('Patient not found');
    }

    const birthDate = new Date(patient[0].birth_date);
    const currentDate = new Date();
    const ageMonths = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24 * 30.44));

    // Get administered vaccines
    const vaccines = await this.getByPatient(clinicId, patientId);

    // Standard vaccine schedule (simplified)
    const schedule = this.getStandardSchedule();
    
    // Check compliance
    const compliance = schedule.map(scheduleItem => {
      const administered = vaccines.find(v => 
        v.vaccine_name === scheduleItem.vaccine_name && 
        v.dose_number === scheduleItem.dose_number
      );

      const isDue = ageMonths >= scheduleItem.age_months;
      const isOverdue = ageMonths > (scheduleItem.age_months + 2); // 2 months grace period

      return {
        ...scheduleItem,
        administered: !!administered,
        administered_date: administered?.administered_date || null,
        is_due: isDue,
        is_overdue: isOverdue && !administered,
        status: administered ? 'completed' : (isOverdue ? 'overdue' : (isDue ? 'due' : 'upcoming'))
      };
    });

    return {
      patient_age_months: ageMonths,
      compliance_rate: (compliance.filter(c => c.administered).length / compliance.filter(c => c.is_due).length) * 100,
      schedule: compliance
    };
  }

  // Get standard vaccine schedule
  static getStandardSchedule() {
    return [
      // Birth vaccines
      { vaccine_name: 'BCG', dose_number: 1, age_months: 0, description: 'Tuberculosis protection' },
      { vaccine_name: 'Hepatitis B', dose_number: 1, age_months: 0, description: 'Hepatitis B protection' },
      
      // 6 weeks
      { vaccine_name: 'DPT', dose_number: 1, age_months: 1.5, description: 'Diphtheria, Pertussis, Tetanus' },
      { vaccine_name: 'OPV', dose_number: 1, age_months: 1.5, description: 'Oral Polio Vaccine' },
      { vaccine_name: 'Hepatitis B', dose_number: 2, age_months: 1.5, description: 'Hepatitis B protection' },
      { vaccine_name: 'Hib', dose_number: 1, age_months: 1.5, description: 'Haemophilus influenzae type b' },
      { vaccine_name: 'PCV', dose_number: 1, age_months: 1.5, description: 'Pneumococcal Conjugate Vaccine' },
      
      // 10 weeks
      { vaccine_name: 'DPT', dose_number: 2, age_months: 2.5, description: 'Diphtheria, Pertussis, Tetanus' },
      { vaccine_name: 'OPV', dose_number: 2, age_months: 2.5, description: 'Oral Polio Vaccine' },
      { vaccine_name: 'Hib', dose_number: 2, age_months: 2.5, description: 'Haemophilus influenzae type b' },
      { vaccine_name: 'PCV', dose_number: 2, age_months: 2.5, description: 'Pneumococcal Conjugate Vaccine' },
      
      // 14 weeks
      { vaccine_name: 'DPT', dose_number: 3, age_months: 3.5, description: 'Diphtheria, Pertussis, Tetanus' },
      { vaccine_name: 'OPV', dose_number: 3, age_months: 3.5, description: 'Oral Polio Vaccine' },
      { vaccine_name: 'Hepatitis B', dose_number: 3, age_months: 3.5, description: 'Hepatitis B protection' },
      { vaccine_name: 'Hib', dose_number: 3, age_months: 3.5, description: 'Haemophilus influenzae type b' },
      { vaccine_name: 'PCV', dose_number: 3, age_months: 3.5, description: 'Pneumococcal Conjugate Vaccine' },
      
      // 9 months
      { vaccine_name: 'Measles', dose_number: 1, age_months: 9, description: 'Measles protection' },
      
      // 12 months
      { vaccine_name: 'MMR', dose_number: 1, age_months: 12, description: 'Measles, Mumps, Rubella' },
      { vaccine_name: 'PCV', dose_number: 4, age_months: 12, description: 'Pneumococcal Conjugate Vaccine booster' },
      
      // 15-18 months
      { vaccine_name: 'DPT', dose_number: 4, age_months: 18, description: 'DPT booster' },
      { vaccine_name: 'OPV', dose_number: 4, age_months: 18, description: 'OPV booster' },
      { vaccine_name: 'Hib', dose_number: 4, age_months: 18, description: 'Hib booster' },
      
      // School age (5-6 years = 60-72 months)
      { vaccine_name: 'DPT', dose_number: 5, age_months: 60, description: 'School entry booster' },
      { vaccine_name: 'OPV', dose_number: 5, age_months: 60, description: 'School entry booster' },
      { vaccine_name: 'MMR', dose_number: 2, age_months: 60, description: 'MMR booster' }
    ];
  }

  // Update vaccine record
  static async update(clinicId, vaccineId, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(vaccineId, clinicId);

    await db.execute(`
      UPDATE patient_vaccines 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = ? AND clinic_id = ?
    `, values);

    return this.getById(clinicId, vaccineId);
  }

  // Delete vaccine record
  static async delete(clinicId, vaccineId) {
    const [result] = await db.execute(`
      DELETE FROM patient_vaccines WHERE id = ? AND clinic_id = ?
    `, [vaccineId, clinicId]);

    return result.affectedRows > 0;
  }

  // Get vaccine statistics for clinic
  static async getClinicStats(clinicId, dateFrom, dateTo) {
    let query = `
      SELECT 
        vaccine_name,
        COUNT(*) as total_administered,
        COUNT(DISTINCT patient_id) as unique_patients
      FROM patient_vaccines 
      WHERE clinic_id = ?
    `;
    
    const params = [clinicId];
    
    if (dateFrom) {
      query += ' AND administered_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND administered_date <= ?';
      params.push(dateTo);
    }
    
    query += ' GROUP BY vaccine_name ORDER BY total_administered DESC';
    
    const [stats] = await db.execute(query, params);
    return stats;
  }
}

module.exports = VaccineRecord;