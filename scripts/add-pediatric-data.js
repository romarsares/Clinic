const mysql = require('mysql2/promise');

async function addPediatricTestData() {
  let connection;
  
  try {
    console.log('🔗 Connecting...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD || 'N1mbu$12354',
      database: 'clinic_saas'
    });

    console.log('✅ Connected');

    // Add pediatric patients
    console.log('👶 Adding pediatric patients...');
    
    const pediatricPatients = [
      { code: 'PED001', name: 'Baby Emma', birth: '2023-06-15', gender: 'female' }, // 6 months
      { code: 'PED002', name: 'Toddler Max', birth: '2022-03-10', gender: 'male' },   // 2 years
      { code: 'PED003', name: 'Child Sofia', birth: '2019-08-20', gender: 'female' }  // 5 years
    ];

    const patientIds = [];
    for (const patient of pediatricPatients) {
      const [result] = await connection.execute(`
        INSERT IGNORE INTO patients (clinic_id, patient_code, full_name, birth_date, gender, created_at)
        VALUES (1, ?, ?, ?, ?, NOW())
      `, [patient.code, patient.name, patient.birth, patient.gender]);
      
      if (result.insertId) {
        patientIds.push(result.insertId);
      } else {
        // Get existing patient ID
        const [existing] = await connection.execute(`
          SELECT id FROM patients WHERE patient_code = ? AND clinic_id = 1
        `, [patient.code]);
        if (existing[0]) patientIds.push(existing[0].id);
      }
    }

    console.log(`✅ Added ${patientIds.length} pediatric patients`);

    // Add visits for pediatric patients
    console.log('🏥 Adding pediatric visits...');
    
    const visitIds = [];
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      
      // Add 2-3 visits per patient
      for (let j = 0; j < 3; j++) {
        const visitDate = new Date();
        visitDate.setDate(visitDate.getDate() - (j * 30)); // Monthly visits
        
        const [result] = await connection.execute(`
          INSERT INTO visits (clinic_id, patient_id, doctor_id, visit_date, status, created_at)
          VALUES (1, ?, 8, ?, 'closed', NOW())
        `, [patientId, visitDate.toISOString().split('T')[0]]);
        
        visitIds.push({ visitId: result.insertId, patientId, visitIndex: j });
      }
    }

    console.log(`✅ Added ${visitIds.length} pediatric visits`);

    // Add pediatric vital signs (growth measurements)
    console.log('📏 Adding growth measurements...');
    
    for (const visit of visitIds) {
      // Generate age-appropriate measurements
      let weight, height;
      
      if (visit.patientId === patientIds[0]) { // Baby Emma (6 months)
        weight = 7.5 + (visit.visitIndex * 0.5); // Growing baby
        height = 67 + (visit.visitIndex * 2);
      } else if (visit.patientId === patientIds[1]) { // Toddler Max (2 years)
        weight = 12 + (visit.visitIndex * 0.3);
        height = 85 + (visit.visitIndex * 1);
      } else { // Child Sofia (5 years)
        weight = 18 + (visit.visitIndex * 0.2);
        height = 110 + (visit.visitIndex * 0.5);
      }
      
      const bmi = weight / ((height/100) * (height/100));
      
      await connection.execute(`
        INSERT INTO visit_vital_signs (
          visit_id, clinic_id, temperature, weight, height, bmi, 
          recorded_by, recorded_at, created_at
        ) VALUES (?, 1, 36.8, ?, ?, ?, 8, NOW(), NOW())
      `, [visit.visitId, weight, height, bmi.toFixed(1)]);
    }

    console.log('✅ Added growth measurements');

    // Add developmental milestones
    console.log('🎯 Adding developmental milestones...');
    
    const milestones = [
      { patientId: patientIds[0], milestone: 'Lifts head when on tummy', category: 'motor', type: 'gross_motor', expectedAge: 2, achievedAge: 2 },
      { patientId: patientIds[0], milestone: 'Smiles at people', category: 'social', type: 'social_emotional', expectedAge: 3, achievedAge: 3 },
      { patientId: patientIds[1], milestone: 'Walks alone', category: 'motor', type: 'gross_motor', expectedAge: 12, achievedAge: 13 },
      { patientId: patientIds[1], milestone: 'Says first words', category: 'language', type: 'language', expectedAge: 12, achievedAge: 11 },
      { patientId: patientIds[2], milestone: 'Runs', category: 'motor', type: 'gross_motor', expectedAge: 18, achievedAge: 17 },
      { patientId: patientIds[2], milestone: 'Two-word phrases', category: 'language', type: 'language', expectedAge: 24, achievedAge: 22 }
    ];

    for (const milestone of milestones) {
      const achievedDate = new Date();
      achievedDate.setMonth(achievedDate.getMonth() - (24 - milestone.achievedAge));
      
      await connection.execute(`
        INSERT INTO patient_milestones (
          clinic_id, patient_id, milestone_description, milestone_category, 
          milestone_type, expected_age_months, achieved_date, achieved_age_months, 
          recorded_by, created_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, 8, NOW())
      `, [
        milestone.patientId, milestone.milestone, milestone.category, 
        milestone.type, milestone.expectedAge, achievedDate.toISOString().split('T')[0], 
        milestone.achievedAge
      ]);
    }

    console.log('✅ Added developmental milestones');

    // Add vaccines
    console.log('💉 Adding vaccine records...');
    
    const vaccines = [
      { patientId: patientIds[0], vaccine: 'BCG', dose: 1, ageMonths: 0 },
      { patientId: patientIds[0], vaccine: 'Hepatitis B', dose: 1, ageMonths: 0 },
      { patientId: patientIds[0], vaccine: 'DPT', dose: 1, ageMonths: 2 },
      { patientId: patientIds[1], vaccine: 'BCG', dose: 1, ageMonths: 0 },
      { patientId: patientIds[1], vaccine: 'DPT', dose: 1, ageMonths: 2 },
      { patientId: patientIds[1], vaccine: 'DPT', dose: 2, ageMonths: 4 },
      { patientId: patientIds[1], vaccine: 'Measles', dose: 1, ageMonths: 9 },
      { patientId: patientIds[2], vaccine: 'MMR', dose: 1, ageMonths: 12 }
    ];

    for (const vaccine of vaccines) {
      const adminDate = new Date();
      adminDate.setMonth(adminDate.getMonth() - vaccine.ageMonths);
      
      await connection.execute(`
        INSERT INTO patient_vaccines (
          clinic_id, patient_id, vaccine_name, dose_number, administered_date, 
          administered_by, created_at
        ) VALUES (1, ?, ?, ?, ?, 8, NOW())
      `, [vaccine.patientId, vaccine.vaccine, vaccine.dose, adminDate.toISOString().split('T')[0]]);
    }

    console.log('✅ Added vaccine records');

    // Test the data
    console.log('\n📊 Testing pediatric data...');
    
    const [testResult] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT p.id) as pediatric_patients,
        COUNT(DISTINCT v.id) as pediatric_visits,
        COUNT(DISTINCT vs.id) as growth_measurements,
        COUNT(DISTINCT pm.id) as milestones,
        COUNT(DISTINCT pv.id) as vaccines
      FROM patients p
      LEFT JOIN visits v ON p.id = v.patient_id
      LEFT JOIN visit_vital_signs vs ON v.id = vs.visit_id
      LEFT JOIN patient_milestones pm ON p.id = pm.patient_id
      LEFT JOIN patient_vaccines pv ON p.id = pv.patient_id
      WHERE p.clinic_id = 1 AND TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) < 18
    `);

    console.log('📈 Pediatric Data Summary:');
    console.log(`  Patients: ${testResult[0].pediatric_patients}`);
    console.log(`  Visits: ${testResult[0].pediatric_visits}`);
    console.log(`  Growth measurements: ${testResult[0].growth_measurements}`);
    console.log(`  Milestones: ${testResult[0].milestones}`);
    console.log(`  Vaccines: ${testResult[0].vaccines}`);

    console.log('\n✅ Pediatric test data created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addPediatricTestData();