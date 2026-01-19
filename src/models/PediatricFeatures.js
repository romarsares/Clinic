const TenantDB = require('../middleware/tenant');

class PediatricFeatures {
  static async getGrowthChartData(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [growthData] = await db.execute(
      `SELECT vs.weight, vs.height, v.visit_date,
       TIMESTAMPDIFF(MONTH, p.date_of_birth, v.visit_date) as age_months,
       TIMESTAMPDIFF(YEAR, p.date_of_birth, v.visit_date) as age_years
       FROM visit_vital_signs vs
       JOIN visits v ON vs.visit_id = v.id
       JOIN patients p ON v.patient_id = p.id
       WHERE v.patient_id = ? AND v.tenant_id = ?
       AND vs.weight IS NOT NULL AND vs.height IS NOT NULL
       ORDER BY v.visit_date ASC`,
      [patientId, tenantId]
    );

    return growthData.map(record => ({
      ...record,
      weight_percentile: this.calculateWeightPercentile(record.age_months, record.weight),
      height_percentile: this.calculateHeightPercentile(record.age_months, record.height),
      bmi: this.calculateBMI(record.weight, record.height),
      who_standards: this.getWHOStandards(record.age_months)
    }));
  }

  static calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }

  static calculateWeightPercentile(ageMonths, weight) {
    // Simplified percentile calculation - in production would use WHO growth charts
    const standards = this.getWHOStandards(ageMonths);
    if (!standards.weight) return null;

    if (weight < standards.weight.p3) return 3;
    if (weight < standards.weight.p10) return 10;
    if (weight < standards.weight.p25) return 25;
    if (weight < standards.weight.p50) return 50;
    if (weight < standards.weight.p75) return 75;
    if (weight < standards.weight.p90) return 90;
    if (weight < standards.weight.p97) return 97;
    return 97;
  }

  static calculateHeightPercentile(ageMonths, height) {
    // Simplified percentile calculation - in production would use WHO growth charts
    const standards = this.getWHOStandards(ageMonths);
    if (!standards.height) return null;

    if (height < standards.height.p3) return 3;
    if (height < standards.height.p10) return 10;
    if (height < standards.height.p25) return 25;
    if (height < standards.height.p50) return 50;
    if (height < standards.height.p75) return 75;
    if (height < standards.height.p90) return 90;
    if (height < standards.height.p97) return 97;
    return 97;
  }

  static getWHOStandards(ageMonths) {
    // Simplified WHO standards - in production would use complete WHO tables
    const standards = {
      6: { weight: { p3: 6.0, p10: 6.5, p25: 7.1, p50: 7.9, p75: 8.8, p90: 9.8, p97: 10.9 }, 
           height: { p3: 63.3, p10: 64.4, p25: 65.7, p50: 67.6, p75: 69.8, p90: 72.2, p97: 74.5 } },
      12: { weight: { p3: 7.7, p10: 8.4, p25: 9.2, p50: 10.2, p75: 11.3, p90: 12.8, p97: 14.5 }, 
            height: { p3: 71.0, p10: 72.2, p25: 73.7, p50: 75.7, p75: 78.0, p90: 80.5, p97: 83.2 } },
      24: { weight: { p3: 9.7, p10: 10.5, p25: 11.5, p50: 12.9, p75: 14.8, p90: 17.0, p97: 19.6 }, 
            height: { p3: 82.3, p10: 83.5, p25: 85.1, p50: 87.1, p75: 89.2, p90: 91.9, p97: 95.0 } }
    };

    // Find closest age match
    const ages = Object.keys(standards).map(Number).sort((a, b) => a - b);
    const closestAge = ages.reduce((prev, curr) => 
      Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
    );

    return standards[closestAge] || standards[24];
  }

  static async trackDevelopmentalMilestones(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    
    // Get patient age
    const [patient] = await db.execute(
      'SELECT date_of_birth FROM patients WHERE id = ? AND tenant_id = ?',
      [patientId, tenantId]
    );

    if (!patient[0]) return null;

    const ageMonths = Math.floor((new Date() - new Date(patient[0].date_of_birth)) / (1000 * 60 * 60 * 24 * 30.44));
    
    // Get recorded milestones
    const [milestones] = await db.execute(
      `SELECT * FROM patient_milestones 
       WHERE patient_id = ? AND tenant_id = ?
       ORDER BY recorded_date DESC`,
      [patientId, tenantId]
    );

    const expectedMilestones = this.getExpectedMilestones(ageMonths);
    
    return {
      patient_age_months: ageMonths,
      recorded_milestones: milestones,
      expected_milestones: expectedMilestones,
      milestone_compliance: this.assessMilestoneCompliance(milestones, expectedMilestones)
    };
  }

  static getExpectedMilestones(ageMonths) {
    const milestones = {
      2: ['Smiles socially', 'Follows objects with eyes', 'Holds head up briefly'],
      4: ['Laughs', 'Holds head steady', 'Brings hands to mouth'],
      6: ['Sits with support', 'Rolls over', 'Babbles'],
      9: ['Sits without support', 'Crawls', 'Says mama/dada'],
      12: ['Walks with assistance', 'Says first words', 'Waves bye-bye'],
      18: ['Walks independently', 'Says 10+ words', 'Follows simple commands'],
      24: ['Runs', 'Says 2-word phrases', 'Plays alongside other children'],
      36: ['Pedals tricycle', 'Speaks in sentences', 'Toilet training begins']
    };

    const applicableMilestones = [];
    for (const [age, items] of Object.entries(milestones)) {
      if (ageMonths >= parseInt(age)) {
        applicableMilestones.push({ age_months: parseInt(age), milestones: items });
      }
    }

    return applicableMilestones;
  }

  static assessMilestoneCompliance(recordedMilestones, expectedMilestones) {
    const compliance = {};
    
    for (const expected of expectedMilestones) {
      const ageGroup = expected.age_months;
      compliance[ageGroup] = {
        expected: expected.milestones,
        achieved: [],
        missing: [],
        compliance_percentage: 0
      };

      for (const milestone of expected.milestones) {
        const achieved = recordedMilestones.find(rm => 
          rm.milestone_description.toLowerCase().includes(milestone.toLowerCase())
        );
        
        if (achieved) {
          compliance[ageGroup].achieved.push(milestone);
        } else {
          compliance[ageGroup].missing.push(milestone);
        }
      }

      compliance[ageGroup].compliance_percentage = Math.round(
        (compliance[ageGroup].achieved.length / expected.milestones.length) * 100
      );
    }

    return compliance;
  }

  static async getVaccineScheduleCompliance(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    
    // Get patient info
    const [patient] = await db.execute(
      'SELECT date_of_birth FROM patients WHERE id = ? AND tenant_id = ?',
      [patientId, tenantId]
    );

    if (!patient[0]) return null;

    // Get administered vaccines
    const [vaccines] = await db.execute(
      `SELECT * FROM patient_vaccines 
       WHERE patient_id = ? AND tenant_id = ?
       ORDER BY administered_date DESC`,
      [patientId, tenantId]
    );

    const ageMonths = Math.floor((new Date() - new Date(patient[0].date_of_birth)) / (1000 * 60 * 60 * 24 * 30.44));
    const schedule = this.getVaccineSchedule();
    const compliance = {};

    for (const [ageGroup, requiredVaccines] of Object.entries(schedule)) {
      const ageInMonths = this.parseAgeGroup(ageGroup);
      compliance[ageGroup] = {
        age_months: ageInMonths,
        required: requiredVaccines,
        administered: [],
        missing: [],
        overdue: ageMonths > ageInMonths + 2, // 2 month grace period
        age_appropriate: ageMonths >= ageInMonths
      };

      for (const vaccine of requiredVaccines) {
        const administered = vaccines.find(v => v.vaccine_name === vaccine);
        if (administered) {
          compliance[ageGroup].administered.push({
            vaccine: vaccine,
            date: administered.administered_date,
            on_time: new Date(administered.administered_date) <= new Date(patient[0].date_of_birth).setMonth(new Date(patient[0].date_of_birth).getMonth() + ageInMonths + 2)
          });
        } else if (compliance[ageGroup].age_appropriate) {
          compliance[ageGroup].missing.push(vaccine);
        }
      }
    }

    return {
      patient_age_months: ageMonths,
      compliance_summary: compliance,
      overall_compliance: this.calculateOverallVaccineCompliance(compliance)
    };
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

  static parseAgeGroup(ageGroup) {
    if (ageGroup === 'Birth') return 0;
    if (ageGroup.includes('months')) return parseInt(ageGroup);
    if (ageGroup.includes('years')) return parseInt(ageGroup) * 12;
    if (ageGroup.includes('-')) {
      const range = ageGroup.split('-');
      if (range[1].includes('months')) return parseInt(range[0]);
      if (range[1].includes('years')) return parseInt(range[0]) * 12;
    }
    return 0;
  }

  static calculateOverallVaccineCompliance(compliance) {
    let totalRequired = 0;
    let totalAdministered = 0;
    let totalOverdue = 0;

    for (const [ageGroup, data] of Object.entries(compliance)) {
      if (data.age_appropriate) {
        totalRequired += data.required.length;
        totalAdministered += data.administered.length;
        if (data.overdue && data.missing.length > 0) {
          totalOverdue += data.missing.length;
        }
      }
    }

    return {
      compliance_percentage: totalRequired > 0 ? Math.round((totalAdministered / totalRequired) * 100) : 100,
      total_required: totalRequired,
      total_administered: totalAdministered,
      total_overdue: totalOverdue,
      status: totalOverdue > 0 ? 'OVERDUE' : totalAdministered === totalRequired ? 'COMPLIANT' : 'PARTIAL'
    };
  }
}

module.exports = PediatricFeatures;