const mysql = require('mysql2/promise');

async function createComprehensiveTestData() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD || 'N1mbu$12354',
      database: 'clinic_saas'
    });

    console.log('✅ Connected to database');

    // Use existing clinic and user data
    const clinicId = 1;
    const userId = 8; // Admin user

    console.log(`📋 Using clinic ID: ${clinicId}, user ID: ${userId}`);

    // Create sample patients if needed
    console.log('👥 Creating sample patients...');
    const patients = [];
    for (let i = 1; i <= 10; i++) {
      const [result] = await connection.execute(`
        INSERT IGNORE INTO patients (clinic_id, patient_code, full_name, birth_date, gender, contact_number, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        clinicId,
        `P${String(i).padStart(3, '0')}`,
        `Test Patient ${i}`,
        `199${i % 10}-0${(i % 12) + 1}-${10 + (i % 20)}`,
        i % 2 === 0 ? 'male' : 'female',
        `09${String(i).padStart(9, '0')}`
      ]);
      
      if (result.insertId) {
        patients.push(result.insertId);
      }
    }

    // Get existing patients
    const [existingPatients] = await connection.execute('SELECT id FROM patients WHERE clinic_id = ? LIMIT 10', [clinicId]);
    const patientIds = existingPatients.map(p => p.id);

    console.log(`👥 Working with ${patientIds.length} patients`);

    // Create sample visits
    console.log('🏥 Creating sample visits...');
    const visits = [];
    for (let i = 0; i < 20; i++) {
      const patientId = patientIds[i % patientIds.length];
      const visitDate = new Date();
      visitDate.setDate(visitDate.getDate() - (i * 7)); // Weekly visits going back
      
      const [result] = await connection.execute(`
        INSERT INTO visits (clinic_id, patient_id, doctor_id, visit_date, status, created_at)
        VALUES (?, ?, ?, ?, 'closed', NOW())
      `, [clinicId, patientId, userId, visitDate.toISOString().split('T')[0]]);
      
      visits.push(result.insertId);
    }

    console.log(`🏥 Created ${visits.length} visits`);

    // Create sample diagnoses
    console.log('🩺 Creating sample diagnoses...');
    const sampleDiagnoses = [
      { name: 'Hypertension', code: 'I10' },
      { name: 'Type 2 Diabetes Mellitus', code: 'E11.9' },
      { name: 'Upper Respiratory Tract Infection', code: 'J06.9' },
      { name: 'Gastroenteritis', code: 'K59.1' },
      { name: 'Headache', code: 'R51' },
      { name: 'Back Pain', code: 'M54.9' },
      { name: 'Allergic Rhinitis', code: 'J30.9' },
      { name: 'Urinary Tract Infection', code: 'N39.0' },
      { name: 'Anxiety Disorder', code: 'F41.9' },
      { name: 'Asthma', code: 'J45.9' }
    ];

    for (let i = 0; i < visits.length; i++) {
      const visitId = visits[i];
      const diagnosis = sampleDiagnoses[i % sampleDiagnoses.length];
      
      await connection.execute(`
        INSERT INTO visit_diagnoses (visit_id, clinic_id, diagnosis_type, diagnosis_code, diagnosis_name, diagnosed_by, diagnosed_at, created_at)
        VALUES (?, ?, 'primary', ?, ?, ?, NOW(), NOW())
      `, [visitId, clinicId, diagnosis.code, diagnosis.name, userId]);
      
      // Add secondary diagnosis for some visits
      if (i % 3 === 0) {
        const secondaryDiagnosis = sampleDiagnoses[(i + 1) % sampleDiagnoses.length];
        await connection.execute(`
          INSERT INTO visit_diagnoses (visit_id, clinic_id, diagnosis_type, diagnosis_code, diagnosis_name, diagnosed_by, diagnosed_at, created_at)
          VALUES (?, ?, 'secondary', ?, ?, ?, NOW(), NOW())
        `, [visitId, clinicId, secondaryDiagnosis.code, secondaryDiagnosis.name, userId]);
      }
    }

    console.log('🩺 Created sample diagnoses');

    // Create sample lab tests if they don't exist
    console.log('🧪 Creating sample lab tests...');
    const labTests = [
      { code: 'CBC', name: 'Complete Blood Count', category: 'hematology', price: 150.00 },
      { code: 'FBS', name: 'Fasting Blood Sugar', category: 'chemistry', price: 80.00 },
      { code: 'URIN', name: 'Urinalysis', category: 'urinalysis', price: 60.00 },
      { code: 'LIPID', name: 'Lipid Profile', category: 'chemistry', price: 200.00 },
      { code: 'HBA1C', name: 'Hemoglobin A1c', category: 'chemistry', price: 300.00 }
    ];

    for (const test of labTests) {
      await connection.execute(`
        INSERT IGNORE INTO lab_tests (clinic_id, test_code, test_name, category, price, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW())
      `, [clinicId, test.code, test.name, test.category, test.price]);
    }

    // Get lab test IDs
    const [labTestIds] = await connection.execute('SELECT id, test_code FROM lab_tests WHERE clinic_id = ?', [clinicId]);

    // Create sample lab requests
    console.log('🧪 Creating sample lab requests...');
    for (let i = 0; i < 15; i++) {
      const visitId = visits[i % visits.length];
      const requestNumber = `LAB${String(Date.now() + i).slice(-6)}`;
      
      const [labRequestResult] = await connection.execute(`
        INSERT INTO lab_requests (clinic_id, patient_id, visit_id, request_number, requested_by, request_date, status, urgency, created_at)
        VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), 'completed', 'routine', NOW())
      `, [clinicId, patientIds[i % patientIds.length], visitId, requestNumber, userId, i]);
      
      const labRequestId = labRequestResult.insertId;
      
      // Add lab request items
      const testId = labTestIds[i % labTestIds.length].id;
      await connection.execute(`
        INSERT INTO lab_request_items (lab_request_id, lab_test_id, status, created_at)
        VALUES (?, ?, 'completed', NOW())
      `, [labRequestId, testId]);
      
      // Create lab results
      const [labResultResult] = await connection.execute(`
        INSERT INTO lab_results (lab_request_id, clinic_id, result_date, entered_by, overall_status, created_at)
        VALUES (?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), ?, 'normal', NOW())
      `, [labRequestId, clinicId, i - 1, userId]);
      
      const labResultId = labResultResult.insertId;
      
      // Add lab result details
      await connection.execute(`
        INSERT INTO lab_result_details (lab_result_id, lab_test_id, parameter_name, result_value, unit, normal_range, is_abnormal, created_at)
        VALUES (?, ?, 'Test Parameter', ?, 'mg/dL', '70-100', ?, NOW())
      `, [labResultId, testId, 85 + (i * 5), i % 4 === 0 ? 1 : 0]);
    }

    console.log('🧪 Created sample lab requests and results');

    // Test the analytics
    console.log('\n📊 Testing Clinical Analytics...');
    
    // Test common diagnoses
    const [commonDiagnoses] = await connection.execute(`
      SELECT 
        vd.diagnosis_name,
        vd.diagnosis_code,
        COUNT(*) as frequency,
        COUNT(DISTINCT vd.visit_id) as unique_visits,
        COUNT(DISTINCT p.id) as unique_patients
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.clinic_id = ?
      GROUP BY vd.diagnosis_name, vd.diagnosis_code
      ORDER BY frequency DESC
      LIMIT 5
    `, [clinicId]);

    console.log('\n📋 Top 5 Common Diagnoses:');
    commonDiagnoses.forEach((diagnosis, index) => {
      console.log(`  ${index + 1}. ${diagnosis.diagnosis_name} (${diagnosis.diagnosis_code}): ${diagnosis.frequency} cases, ${diagnosis.unique_patients} patients`);
    });

    // Test lab volumes
    const [labVolumes] = await connection.execute(`
      SELECT 
        lt.test_name,
        lt.category,
        COUNT(DISTINCT lr.id) as requests_count,
        COUNT(DISTINCT lres.id) as completed_count,
        ROUND(COUNT(DISTINCT lres.id) * 100.0 / COUNT(DISTINCT lr.id), 2) as completion_rate
      FROM lab_tests lt
      JOIN lab_request_items lri ON lt.id = lri.lab_test_id
      JOIN lab_requests lr ON lri.lab_request_id = lr.id
      LEFT JOIN lab_results lres ON lr.id = lres.lab_request_id
      WHERE lr.clinic_id = ?
      GROUP BY lt.id, lt.test_name, lt.category
      ORDER BY requests_count DESC
    `, [clinicId]);

    console.log('\n🧪 Lab Test Volumes:');
    labVolumes.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.test_name} (${test.category}): ${test.requests_count} requests, ${test.completed_count} completed (${test.completion_rate}%)`);
    });

    console.log('\n✅ Comprehensive test data created and analytics tested successfully!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createComprehensiveTestData();