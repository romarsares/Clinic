const mysql = require('mysql2/promise');

async function quickProductivityTest() {
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

    // Quick test of doctor productivity
    const [result] = await connection.execute(`
      SELECT 
        u.full_name as doctor_name,
        COUNT(DISTINCT v.id) as visits,
        COUNT(DISTINCT vd.id) as diagnoses
      FROM auth_users u
      JOIN visits v ON u.id = v.doctor_id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      WHERE u.clinic_id = 1
      GROUP BY u.id, u.full_name
      LIMIT 2
    `);

    console.log('👨⚕️ Doctor Productivity:');
    result.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.doctor_name}: ${d.visits} visits, ${d.diagnoses} diagnoses`);
    });

    // Quick quality check
    const [quality] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT v.id) as total_visits,
        COUNT(DISTINCT vs.id) as visits_with_vitals,
        ROUND(COUNT(DISTINCT vs.id) * 100.0 / COUNT(DISTINCT v.id), 1) as vitals_rate
      FROM visits v
      LEFT JOIN visit_vital_signs vs ON v.id = vs.visit_id
      WHERE v.clinic_id = 1
    `);

    console.log('📊 Quality Metrics:');
    console.log(`  Vitals Documentation: ${quality[0].vitals_rate}%`);

    console.log('✅ Doctor Productivity features working!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickProductivityTest();