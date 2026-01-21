const mysql = require('mysql2/promise');

async function quickPediatricTest() {
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

    // Test 1: Check pediatric patients
    const [pediatricPatients] = await connection.execute(`
      SELECT 
        COUNT(*) as total_pediatric,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 2 THEN 1 END) as infants,
        COUNT(CASE WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 2 AND 5 THEN 1 END) as toddlers
      FROM patients 
      WHERE clinic_id = 1 AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 18
    `);

    console.log('👶 Pediatric Patients:');
    console.log(`  Total: ${pediatricPatients[0].total_pediatric}`);
    console.log(`  Infants: ${pediatricPatients[0].infants}`);
    console.log(`  Toddlers: ${pediatricPatients[0].toddlers}`);

    // Test 2: Check growth data
    const [growthData] = await connection.execute(`
      SELECT 
        COUNT(*) as measurements,
        AVG(vs.weight) as avg_weight,
        AVG(vs.height) as avg_height
      FROM visit_vital_signs vs
      JOIN visits v ON vs.visit_id = v.id
      JOIN patients p ON v.patient_id = p.id
      WHERE v.clinic_id = 1 
      AND TIMESTAMPDIFF(YEAR, p.birth_date, v.visit_date) < 18
      AND vs.weight IS NOT NULL AND vs.height IS NOT NULL
    `);

    console.log('📈 Growth Measurements:');
    console.log(`  Total measurements: ${growthData[0].measurements}`);
    if (growthData[0].avg_weight) {
      console.log(`  Average weight: ${parseFloat(growthData[0].avg_weight).toFixed(1)}kg`);
      console.log(`  Average height: ${parseFloat(growthData[0].avg_height).toFixed(1)}cm`);
    }

    // Test 3: Check milestones table
    const [milestones] = await connection.execute(`
      SELECT COUNT(*) as milestone_count FROM patient_milestones WHERE clinic_id = 1
    `);

    console.log('🎯 Developmental Milestones:');
    console.log(`  Recorded milestones: ${milestones[0].milestone_count}`);

    // Test 4: Check vaccines
    const [vaccines] = await connection.execute(`
      SELECT 
        COUNT(*) as total_vaccines,
        COUNT(DISTINCT vaccine_name) as unique_vaccines
      FROM patient_vaccines 
      WHERE clinic_id = 1
    `);

    console.log('💉 Vaccines:');
    console.log(`  Total administered: ${vaccines[0].total_vaccines}`);
    console.log(`  Unique vaccine types: ${vaccines[0].unique_vaccines}`);

    console.log('\n✅ Pediatric features data verified!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickPediatricTest();