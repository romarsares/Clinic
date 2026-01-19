const TenantDB = require('../middleware/tenant');

class VaccineRecord {
  static async create(tenantId, vaccineData) {
    const db = TenantDB.getConnection(tenantId);
    const [result] = await db.execute(
      `INSERT INTO patient_vaccines (patient_id, vaccine_name, vaccine_type, 
       administered_date, administered_by, dose_number, batch_number, 
       manufacturer, site_administered, notes, tenant_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vaccineData.patient_id, vaccineData.vaccine_name, vaccineData.vaccine_type,
       vaccineData.administered_date, vaccineData.administered_by, vaccineData.dose_number,
       vaccineData.batch_number, vaccineData.manufacturer, vaccineData.site_administered,
       vaccineData.notes, tenantId]
    );
    return { id: result.insertId, ...vaccineData };
  }

  static async findByPatient(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [rows] = await db.execute(
      `SELECT pv.*, u.first_name as administered_by_first_name, u.last_name as administered_by_last_name
       FROM patient_vaccines pv
       LEFT JOIN users u ON pv.administered_by = u.id
       WHERE pv.patient_id = ? AND pv.tenant_id = ?
       ORDER BY pv.administered_date DESC`,
      [patientId, tenantId]
    );
    return rows;
  }

  static getVaccineSchedule() {
    return {
      'Birth': ['Hepatitis B'],
      '2 months': ['DTaP', 'IPV', 'Hib', 'PCV13', 'Rotavirus'],
      '4 months': ['DTaP', 'IPV', 'Hib', 'PCV13', 'Rotavirus'],
      '6 months': ['DTaP', 'Hib', 'PCV13', 'Rotavirus', 'Hepatitis B'],
      '12-15 months': ['MMR', 'PCV13', 'Hib', 'Varicella'],
      '15-18 months': ['DTaP'],
      '4-6 years': ['DTaP', 'IPV', 'MMR', 'Varicella'],
      '11-12 years': ['Tdap', 'HPV', 'Meningococcal']
    };
  }

  static async checkScheduleCompliance(tenantId, patientId, dateOfBirth) {
    const vaccines = await this.findByPatient(tenantId, patientId);
    const schedule = this.getVaccineSchedule();
    const compliance = {};

    const ageInMonths = Math.floor((new Date() - new Date(dateOfBirth)) / (1000 * 60 * 60 * 24 * 30.44));

    for (const [ageGroup, requiredVaccines] of Object.entries(schedule)) {
      compliance[ageGroup] = {
        required: requiredVaccines,
        administered: [],
        missing: [],
        age_appropriate: this.isAgeAppropriate(ageGroup, ageInMonths)
      };

      for (const vaccine of requiredVaccines) {
        const administered = vaccines.find(v => v.vaccine_name === vaccine);
        if (administered) {
          compliance[ageGroup].administered.push(vaccine);
        } else if (compliance[ageGroup].age_appropriate) {
          compliance[ageGroup].missing.push(vaccine);
        }
      }
    }

    return compliance;
  }

  static isAgeAppropriate(ageGroup, ageInMonths) {
    const ageMap = {
      'Birth': 0,
      '2 months': 2,
      '4 months': 4,
      '6 months': 6,
      '12-15 months': 12,
      '15-18 months': 15,
      '4-6 years': 48,
      '11-12 years': 132
    };

    return ageInMonths >= ageMap[ageGroup];
  }
}

module.exports = VaccineRecord;