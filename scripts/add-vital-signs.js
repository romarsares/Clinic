const mysql = require('mysql2/promise');

async function addVitalSigns() {
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

    // Get some visits to add vital signs to
    const [visits] = await connection.execute(`
      SELECT id FROM visits WHERE clinic_id = 1 ORDER BY id LIMIT 15
    `);

    console.log(`📊 Adding vital signs to ${visits.length} visits...`);

    for (let i = 0; i < visits.length; i++) {
      const visitId = visits[i].id;
      
      // Generate realistic vital signs
      const temperature = 36.5 + (Math.random() * 2); // 36.5-38.5°C
      const systolic = 110 + Math.floor(Math.random() * 40); // 110-150
      const diastolic = 70 + Math.floor(Math.random() * 20); // 70-90
      const heartRate = 60 + Math.floor(Math.random() * 40); // 60-100
      const weight = 50 + Math.floor(Math.random() * 50); // 50-100kg
      const height = 150 + Math.floor(Math.random() * 30); // 150-180cm
      const bmi = weight / ((height/100) * (height/100));
      
      await connection.execute(`
        INSERT IGNORE INTO visit_vital_signs (
          visit_id, clinic_id, temperature, blood_pressure_systolic, 
          blood_pressure_diastolic, heart_rate, weight, height, bmi, 
          recorded_by, recorded_at
        ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, 8, NOW())
      `, [visitId, temperature.toFixed(1), systolic, diastolic, heartRate, weight, height, bmi.toFixed(1)]);
    }

    console.log('✅ Vital signs added');

    // Test the updated metrics
    console.log('\n📊 Testing Updated Quality Indicators...');
    const [quality] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT v.id) as total_visits,
        COUNT(DISTINCT CASE WHEN vd.id IS NOT NULL THEN v.id END) as visits_with_diagnosis,
        COUNT(DISTINCT CASE WHEN vs.id IS NOT NULL THEN v.id END) as visits_with_vitals,
        ROUND(COUNT(DISTINCT CASE WHEN vd.id IS NOT NULL THEN v.id END) * 100.0 / COUNT(DISTINCT v.id), 2) as diagnosis_rate,
        ROUND(COUNT(DISTINCT CASE WHEN vs.id IS NOT NULL THEN v.id END) * 100.0 / COUNT(DISTINCT v.id), 2) as vitals_rate
      FROM visits v
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN visit_vital_signs vs ON v.id = vs.visit_id
      WHERE v.clinic_id = 1
    `);

    const q = quality[0];
    console.log(`  Total Visits: ${q.total_visits}`);
    console.log(`  Diagnosis Documentation Rate: ${q.diagnosis_rate}%`);
    console.log(`  Vitals Documentation Rate: ${q.vitals_rate}%`);

    console.log('\n✅ Vital signs data added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addVitalSigns();