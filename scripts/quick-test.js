const mysql = require('mysql2/promise');

async function quickTest() {
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

    // Quick test of common diagnoses query
    const [result] = await connection.execute(`
      SELECT 
        vd.diagnosis_name,
        COUNT(*) as frequency
      FROM visit_diagnoses vd
      JOIN visits v ON vd.visit_id = v.id
      WHERE v.clinic_id = 1
      GROUP BY vd.diagnosis_name
      ORDER BY frequency DESC
      LIMIT 3
    `);

    console.log('📋 Top Diagnoses:');
    result.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.diagnosis_name}: ${d.frequency}`);
    });

    // Quick lab test
    const [labResult] = await connection.execute(`
      SELECT 
        lt.test_name,
        COUNT(*) as requests
      FROM lab_tests lt
      JOIN lab_request_items lri ON lt.id = lri.lab_test_id
      JOIN lab_requests lr ON lri.lab_request_id = lr.id
      WHERE lr.clinic_id = 1
      GROUP BY lt.test_name
      LIMIT 3
    `);

    console.log('🧪 Lab Tests:');
    labResult.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.test_name}: ${t.requests} requests`);
    });

    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickTest();