const db = require('../config/database');

class PediatricFeatures {
  // WHO Growth Standards - percentile calculations
  static getWHOPercentiles() {
    // Simplified WHO percentiles for demonstration
    return {
      weight: {
        male: {
          0: { p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
          6: { p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.9, p97: 9.8 },
          12: { p3: 8.4, p15: 9.4, p50: 10.5, p85: 11.8, p97: 13.0 },
          24: { p3: 10.5, p15: 11.8, p50: 13.2, p85: 14.8, p97: 16.5 }
        },
        female: {
          0: { p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
          6: { p3: 5.9, p15: 6.5, p50: 7.3, p85: 8.2, p97: 9.0 },
          12: { p3: 7.8, p15: 8.7, p50: 9.8, p85: 11.0, p97: 12.1 },
          24: { p3: 9.9, p15: 11.0, p50: 12.4, p85: 13.9, p97: 15.4 }
        }
      },
      height: {
        male: {
          0: { p3: 46.1, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.7 },
          6: { p3: 63.3, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.9 },
          12: { p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.5 },
          24: { p3: 78.0, p15: 81.0, p50: 84.1, p85: 87.1, p97: 90.2 }
        },
        female: {
          0: { p3: 45.4, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.9 },
          6: { p3: 61.8, p15: 64.0, p50: 66.2, p85: 68.3, p97: 70.5 },
          12: { p3: 69.2, p15: 71.7, p50: 74.0, p85: 76.4, p97: 78.7 },
          24: { p3: 76.0, p15: 79.3, p50: 82.5, p85: 85.7, p97: 88.9 }
        }
      }
    };
  }

  // Calculate percentile for a given measurement
  static calculatePercentile(value, ageMonths, gender, measurementType) {
    const standards = this.getWHOPercentiles();
    const ageKey = Math.floor(ageMonths / 6) * 6; // Round to nearest 6 months
    
    if (!standards[measurementType] || !standards[measurementType][gender] || !standards[measurementType][gender][ageKey]) {
      return null;
    }
    
    const percentiles = standards[measurementType][gender][ageKey];
    
    if (value <= percentiles.p3) return 3;
    if (value <= percentiles.p15) return 15;
    if (value <= percentiles.p50) return 50;
    if (value <= percentiles.p85) return 85;
    if (value <= percentiles.p97) return 97;
    return 97;
  }

  // Get growth chart data with percentiles
  static async getGrowthChartData(clinicId, patientId) {
    const [patient] = await db.execute(`
      SELECT birth_date, gender FROM patients WHERE id = ? AND clinic_id = ?
    `, [patientId, clinicId]);

    if (!patient[0]) {
      throw new Error('Patient not found');
    }

    const [growthData] = await db.execute(`
      SELECT vs.weight, vs.height, vs.bmi, v.visit_date,
             TIMESTAMPDIFF(MONTH, p.birth_date, v.visit_date) as age_months
      FROM visit_vital_signs vs
      JOIN visits v ON vs.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.patient_id = ? AND v.clinic_id = ?
      AND (vs.weight IS NOT NULL OR vs.height IS NOT NULL)
      ORDER BY v.visit_date ASC
    `, [patientId, clinicId]);

    const processedData = growthData.map(point => {
      const weightPercentile = point.weight ? 
        this.calculatePercentile(point.weight, point.age_months, patient[0].gender, 'weight') : null;
      const heightPercentile = point.height ? 
        this.calculatePercentile(point.height, point.age_months, patient[0].gender, 'height') : null;

      return {
        ...point,
        weight_percentile: weightPercentile,
        height_percentile: heightPercentile,
        growth_concerns: this.identifyGrowthConcerns(weightPercentile, heightPercentile)
      };
    });

    return {
      patient_info: patient[0],
      growth_data: processedData,
      growth_velocity: this.calculateGrowthVelocity(processedData)
    };
  }

  // Identify growth concerns
  static identifyGrowthConcerns(weightPercentile, heightPercentile) {
    const concerns = [];
    
    if (weightPercentile && weightPercentile < 3) {
      concerns.push('Underweight - below 3rd percentile');
    }
    if (weightPercentile && weightPercentile > 97) {
      concerns.push('Overweight - above 97th percentile');
    }
    if (heightPercentile && heightPercentile < 3) {
      concerns.push('Short stature - below 3rd percentile');
    }
    if (weightPercentile && heightPercentile && Math.abs(weightPercentile - heightPercentile) > 50) {
      concerns.push('Weight-height disproportion');
    }
    
    return concerns;
  }

  // Calculate growth velocity
  static calculateGrowthVelocity(growthData) {
    if (growthData.length < 2) return null;

    const velocities = [];
    for (let i = 1; i < growthData.length; i++) {
      const current = growthData[i];
      const previous = growthData[i - 1];
      
      const monthsDiff = current.age_months - previous.age_months;
      if (monthsDiff > 0) {
        const weightVelocity = current.weight && previous.weight ? 
          (current.weight - previous.weight) / monthsDiff * 12 : null; // kg/year
        const heightVelocity = current.height && previous.height ? 
          (current.height - previous.height) / monthsDiff * 12 : null; // cm/year

        velocities.push({
          period: `${previous.age_months}-${current.age_months} months`,
          weight_velocity: weightVelocity,
          height_velocity: heightVelocity,
          months_duration: monthsDiff
        });
      }
    }

    return velocities;
  }

  // Developmental milestones database
  static getDevelopmentalMilestones() {
    return [
      // 0-6 months
      { age_months: 2, category: 'motor', milestone: 'Lifts head when on tummy', type: 'gross_motor' },
      { age_months: 4, category: 'motor', milestone: 'Holds head steady', type: 'gross_motor' },
      { age_months: 6, category: 'motor', milestone: 'Sits without support', type: 'gross_motor' },
      { age_months: 3, category: 'social', milestone: 'Smiles at people', type: 'social_emotional' },
      { age_months: 6, category: 'language', milestone: 'Babbles', type: 'language' },
      
      // 6-12 months
      { age_months: 8, category: 'motor', milestone: 'Crawls', type: 'gross_motor' },
      { age_months: 9, category: 'motor', milestone: 'Pulls to stand', type: 'gross_motor' },
      { age_months: 12, category: 'motor', milestone: 'Walks alone', type: 'gross_motor' },
      { age_months: 9, category: 'motor', milestone: 'Pincer grasp', type: 'fine_motor' },
      { age_months: 12, category: 'language', milestone: 'Says first words', type: 'language' },
      
      // 12-24 months
      { age_months: 15, category: 'motor', milestone: 'Walks well', type: 'gross_motor' },
      { age_months: 18, category: 'motor', milestone: 'Runs', type: 'gross_motor' },
      { age_months: 24, category: 'motor', milestone: 'Jumps with both feet', type: 'gross_motor' },
      { age_months: 18, category: 'language', milestone: 'Says 10-20 words', type: 'language' },
      { age_months: 24, category: 'language', milestone: 'Two-word phrases', type: 'language' },
      
      // 24-36 months
      { age_months: 30, category: 'motor', milestone: 'Pedals tricycle', type: 'gross_motor' },
      { age_months: 36, category: 'motor', milestone: 'Balances on one foot', type: 'gross_motor' },
      { age_months: 36, category: 'language', milestone: 'Speaks in sentences', type: 'language' },
      { age_months: 36, category: 'social', milestone: 'Plays with other children', type: 'social_emotional' }
    ];
  }

  // Track developmental milestones for a patient
  static async trackDevelopmentalMilestones(clinicId, patientId) {
    const [patient] = await db.execute(`
      SELECT birth_date, gender FROM patients WHERE id = ? AND clinic_id = ?
    `, [patientId, clinicId]);

    if (!patient[0]) {
      throw new Error('Patient not found');
    }

    const currentAgeMonths = Math.floor((new Date() - new Date(patient[0].birth_date)) / (1000 * 60 * 60 * 24 * 30.44));
    const milestones = this.getDevelopmentalMilestones();

    // Get recorded milestone achievements
    const [achievements] = await db.execute(`
      SELECT * FROM patient_milestones WHERE patient_id = ? AND clinic_id = ?
    `, [patientId, clinicId]);

    const achievementMap = {};
    achievements.forEach(a => {
      achievementMap[a.milestone_description] = a;
    });

    const milestoneStatus = milestones.map(milestone => {
      const isExpected = currentAgeMonths >= milestone.age_months;
      const achievement = achievementMap[milestone.milestone];
      
      return {
        ...milestone,
        is_expected: isExpected,
        is_achieved: !!achievement,
        achieved_date: achievement?.achieved_date || null,
        is_delayed: isExpected && !achievement && currentAgeMonths > (milestone.age_months + 3),
        status: achievement ? 'achieved' : (isExpected ? (currentAgeMonths > milestone.age_months + 3 ? 'delayed' : 'due') : 'upcoming')
      };
    });

    return {
      patient_age_months: currentAgeMonths,
      milestones: milestoneStatus,
      summary: {
        total_expected: milestoneStatus.filter(m => m.is_expected).length,
        total_achieved: milestoneStatus.filter(m => m.is_achieved).length,
        total_delayed: milestoneStatus.filter(m => m.is_delayed).length
      }
    };
  }

  // Get vaccine schedule compliance (enhanced from existing VaccineRecord)
  static async getVaccineScheduleCompliance(clinicId, patientId) {
    const [patient] = await db.execute(`
      SELECT birth_date, gender FROM patients WHERE id = ? AND clinic_id = ?
    `, [patientId, clinicId]);

    if (!patient[0]) {
      throw new Error('Patient not found');
    }

    const currentAgeMonths = Math.floor((new Date() - new Date(patient[0].birth_date)) / (1000 * 60 * 60 * 24 * 30.44));

    // Get administered vaccines
    const [vaccines] = await db.execute(`
      SELECT * FROM patient_vaccines 
      WHERE patient_id = ? AND clinic_id = ?
      ORDER BY administered_date
    `, [patientId, clinicId]);

    // Standard schedule (simplified)
    const schedule = [
      { vaccine_name: 'BCG', dose_number: 1, age_months: 0, description: 'Birth' },
      { vaccine_name: 'Hepatitis B', dose_number: 1, age_months: 0, description: 'Birth' },
      { vaccine_name: 'DPT', dose_number: 1, age_months: 2, description: '6 weeks' },
      { vaccine_name: 'OPV', dose_number: 1, age_months: 2, description: '6 weeks' },
      { vaccine_name: 'DPT', dose_number: 2, age_months: 4, description: '10 weeks' },
      { vaccine_name: 'OPV', dose_number: 2, age_months: 4, description: '10 weeks' },
      { vaccine_name: 'DPT', dose_number: 3, age_months: 6, description: '14 weeks' },
      { vaccine_name: 'OPV', dose_number: 3, age_months: 6, description: '14 weeks' },
      { vaccine_name: 'Measles', dose_number: 1, age_months: 9, description: '9 months' },
      { vaccine_name: 'MMR', dose_number: 1, age_months: 12, description: '12 months' }
    ];

    const compliance = schedule.map(scheduleItem => {
      const administered = vaccines.find(v => 
        v.vaccine_name === scheduleItem.vaccine_name && 
        (v.dose_number === scheduleItem.dose_number || !v.dose_number)
      );

      const isDue = currentAgeMonths >= scheduleItem.age_months;
      const isOverdue = currentAgeMonths > (scheduleItem.age_months + 2);

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
      patient_age_months: currentAgeMonths,
      compliance_rate: (compliance.filter(c => c.administered).length / compliance.filter(c => c.is_due).length) * 100 || 0,
      schedule: compliance,
      overdue_vaccines: compliance.filter(c => c.is_overdue)
    };
  }

  // Pediatric analytics dashboard
  static async getPediatricAnalytics(clinicId, dateFrom, dateTo) {
    let dateFilter = '';
    const params = [clinicId];
    
    if (dateFrom || dateTo) {
      if (dateFrom) {
        dateFilter += ' AND v.visit_date >= ?';
        params.push(dateFrom);
      }
      if (dateTo) {
        dateFilter += ' AND v.visit_date <= ?';
        params.push(dateTo);
      }
    }

    // Get pediatric patient statistics
    const [pediatricStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT p.id) as total_pediatric_patients,
        COUNT(DISTINCT CASE WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) < 2 THEN p.id END) as infants,
        COUNT(DISTINCT CASE WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) BETWEEN 2 AND 5 THEN p.id END) as toddlers,
        COUNT(DISTINCT CASE WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) BETWEEN 6 AND 12 THEN p.id END) as school_age,
        COUNT(DISTINCT CASE WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) BETWEEN 13 AND 17 THEN p.id END) as adolescents
      FROM patients p
      LEFT JOIN visits v ON p.id = v.patient_id ${dateFilter}
      WHERE p.clinic_id = ? AND TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) < 18
    `, params);

    // Get common pediatric diagnoses
    const [pediatricDiagnoses] = await db.execute(`
      SELECT 
        vd.diagnosis_name,
        COUNT(*) as frequency,
        COUNT(DISTINCT p.id) as unique_patients
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.clinic_id = ? AND TIMESTAMPDIFF(YEAR, p.birth_date, v.visit_date) < 18 ${dateFilter}
      GROUP BY vd.diagnosis_name
      ORDER BY frequency DESC
      LIMIT 10
    `, params);

    return {
      patient_demographics: pediatricStats[0],
      common_diagnoses: pediatricDiagnoses,
      date_range: { from: dateFrom, to: dateTo }
    };
  }
}

module.exports = PediatricFeatures;