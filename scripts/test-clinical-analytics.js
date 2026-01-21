const mysql = require('mysql2/promise');

async function testClinicalAnalytics() {
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

    // Check if we have sample data for testing
    const [visits] = await connection.execute('SELECT COUNT(*) as count FROM visits WHERE clinic_id = 1');
    const [diagnoses] = await connection.execute('SELECT COUNT(*) as count FROM visit_diagnoses WHERE clinic_id = 1');
    const [labRequests] = await connection.execute('SELECT COUNT(*) as count FROM lab_requests WHERE clinic_id = 1');

    console.log('📊 Current data counts:');
    console.log(`  - Visits: ${visits[0].count}`);
    console.log(`  - Diagnoses: ${diagnoses[0].count}`);
    console.log(`  - Lab Requests: ${labRequests[0].count}`);

    if (visits[0].count === 0) {
      console.log('⚠️  No sample data found. Creating test data...');
      await createTestData(connection);
    }

    // Test common diagnoses query
    console.log('\n🔍 Testing Common Diagnoses Report...');
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
      WHERE v.clinic_id = 1
      GROUP BY vd.diagnosis_name, vd.diagnosis_code
      ORDER BY frequency DESC
      LIMIT 10
    `);

    console.log('📋 Common Diagnoses Results:');
    commonDiagnoses.forEach((diagnosis, index) => {
      console.log(`  ${index + 1}. ${diagnosis.diagnosis_name} (${diagnosis.diagnosis_code}): ${diagnosis.frequency} cases`);
    });

    // Test lab volumes query
    console.log('\n🧪 Testing Lab Test Volumes...');
    const [labVolumes] = await connection.execute(`
      SELECT 
        lt.test_name,
        lt.category,
        COUNT(DISTINCT lr.id) as requests_count,
        COUNT(DISTINCT lres.id) as completed_count
      FROM lab_tests lt
      JOIN lab_request_items lri ON lt.id = lri.lab_test_id
      JOIN lab_requests lr ON lri.lab_request_id = lr.id
      LEFT JOIN lab_results lres ON lr.id = lres.lab_request_id
      WHERE lr.clinic_id = 1
      GROUP BY lt.id, lt.test_name, lt.category
      ORDER BY requests_count DESC
      LIMIT 10
    `);

    console.log('🧪 Lab Test Volumes Results:');
    labVolumes.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.test_name} (${test.category}): ${test.requests_count} requests, ${test.completed_count} completed`);
    });

    // Test seasonal trends
    console.log('\n📈 Testing Seasonal Diagnosis Trends...');
    const [seasonalTrends] = await connection.execute(`
      SELECT 
        vd.diagnosis_name,
        MONTH(v.visit_date) as month,
        MONTHNAME(v.visit_date) as month_name,
        COUNT(*) as frequency
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      WHERE v.clinic_id = 1 AND YEAR(v.visit_date) = YEAR(CURDATE())
      GROUP BY vd.diagnosis_name, MONTH(v.visit_date), MONTHNAME(v.visit_date)
      ORDER BY vd.diagnosis_name, month
      LIMIT 20
    `);

    console.log('📈 Seasonal Trends Results:');
    seasonalTrends.forEach((trend, index) => {
      console.log(`  ${index + 1}. ${trend.diagnosis_name} - ${trend.month_name}: ${trend.frequency} cases`);
    });

    console.log('\n✅ Clinical Analytics testing completed successfully!');

  } catch (error) {
    console.error('❌ Error testing clinical analytics:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function createTestData(connection) {
  try {
    // Add some sample diagnoses if they don't exist
    const sampleDiagnoses = [
      { name: 'Hypertension', code: 'I10' },
      { name: 'Type 2 Diabetes Mellitus', code: 'E11' },
      { name: 'Upper Respiratory Tract Infection', code: 'J06.9' },
      { name: 'Gastroenteritis', code: 'K59.1' },
      { name: 'Headache', code: 'R51' }
    ];

    // Check if we have visits to add diagnoses to
    const [existingVisits] = await connection.execute('SELECT id FROM visits WHERE clinic_id = 1 LIMIT 5');
    
    if (existingVisits.length > 0) {
      console.log('📝 Adding sample diagnoses...');
      
      for (let i = 0; i < existingVisits.length; i++) {
        const visit = existingVisits[i];
        const diagnosis = sampleDiagnoses[i % sampleDiagnoses.length];
        
        await connection.execute(`
          INSERT IGNORE INTO visit_diagnoses (visit_id, clinic_id, diagnosis_type, diagnosis_code, diagnosis_name, diagnosed_by, diagnosed_at)
          VALUES (?, 1, 'primary', ?, ?, 1, NOW())
        `, [visit.id, diagnosis.code, diagnosis.name]);
      }
      
      console.log('✅ Sample diagnoses added');
    }

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

testClinicalAnalytics();