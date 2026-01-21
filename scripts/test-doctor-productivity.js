const mysql = require('mysql2/promise');

async function testDoctorProductivity() {
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

    const clinicId = 1;

    // Test 1: Doctor Productivity
    console.log('\n👨‍⚕️ Testing Doctor Productivity...');
    const [productivity] = await connection.execute(`
      SELECT 
        u.id as doctor_id,
        u.full_name as doctor_name,
        COUNT(DISTINCT v.id) as total_visits,
        COUNT(DISTINCT v.patient_id) as unique_patients,
        COUNT(DISTINCT vd.id) as total_diagnoses,
        ROUND(COUNT(DISTINCT vd.id) / COUNT(DISTINCT v.id), 2) as avg_diagnoses_per_visit
      FROM auth_users u
      JOIN visits v ON u.id = v.doctor_id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      WHERE u.clinic_id = ?
      GROUP BY u.id, u.full_name
      HAVING total_visits > 0
      ORDER BY total_visits DESC
    `, [clinicId]);

    console.log('📊 Doctor Productivity Results:');
    productivity.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.doctor_name}: ${doc.total_visits} visits, ${doc.unique_patients} patients, ${doc.avg_diagnoses_per_visit} diagnoses/visit`);
    });

    // Test 2: Appointment Efficiency
    console.log('\n📅 Testing Appointment Efficiency...');
    const [efficiency] = await connection.execute(`
      SELECT 
        u.full_name as doctor_name,
        COUNT(DISTINCT a.id) as total_appointments,
        COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed,
        COUNT(DISTINCT CASE WHEN a.status = 'no_show' THEN a.id END) as no_shows,
        ROUND(COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) * 100.0 / COUNT(DISTINCT a.id), 2) as completion_rate
      FROM auth_users u
      JOIN appointments a ON u.id = a.doctor_id
      WHERE u.clinic_id = ?
      GROUP BY u.id, u.full_name
      HAVING total_appointments > 0
    `, [clinicId]);

    console.log('📈 Appointment Efficiency Results:');
    efficiency.forEach((eff, index) => {
      console.log(`  ${index + 1}. ${eff.doctor_name}: ${eff.total_appointments} appointments, ${eff.completion_rate}% completion rate`);
    });

    // Test 3: Documentation Completeness
    console.log('\n📝 Testing Documentation Completeness...');
    const [completeness] = await connection.execute(`
      SELECT 
        u.full_name as doctor_name,
        COUNT(DISTINCT v.id) as total_visits,
        COUNT(DISTINCT vd.id) as visits_with_diagnosis,
        COUNT(DISTINCT vs.id) as visits_with_vitals,
        ROUND(COUNT(DISTINCT vd.id) * 100.0 / COUNT(DISTINCT v.id), 2) as diagnosis_rate,
        ROUND(COUNT(DISTINCT vs.id) * 100.0 / COUNT(DISTINCT v.id), 2) as vitals_rate
      FROM auth_users u
      JOIN visits v ON u.id = v.doctor_id
      LEFT JOIN visit_diagnoses vd ON v.id = vd.visit_id
      LEFT JOIN visit_vital_signs vs ON v.id = vs.visit_id
      WHERE u.clinic_id = ?
      GROUP BY u.id, u.full_name
      HAVING total_visits > 0
    `, [clinicId]);

    console.log('📋 Documentation Completeness Results:');
    completeness.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.doctor_name}: ${comp.diagnosis_rate}% diagnosis rate, ${comp.vitals_rate}% vitals rate`);
    });

    // Test 4: Follow-up Compliance
    console.log('\n🔄 Testing Follow-up Compliance...');
    const [followup] = await connection.execute(`
      SELECT 
        p.patient_code,
        p.full_name as patient_name,
        vd.diagnosis_name,
        COUNT(DISTINCT v.id) as visit_count,
        CASE 
          WHEN COUNT(DISTINCT v.id) >= 3 THEN 'Good'
          WHEN COUNT(DISTINCT v.id) = 2 THEN 'Fair'
          ELSE 'Poor'
        END as compliance_level
      FROM patients p
      JOIN visits v ON p.id = v.patient_id
      JOIN visit_diagnoses vd ON v.id = vd.visit_id
      WHERE p.clinic_id = ?
      GROUP BY p.id, vd.diagnosis_name
      HAVING visit_count >= 2
      ORDER BY visit_count DESC
      LIMIT 5
    `, [clinicId]);

    console.log('🎯 Follow-up Compliance Results:');
    followup.forEach((follow, index) => {
      console.log(`  ${index + 1}. ${follow.patient_name} (${follow.diagnosis_name}): ${follow.visit_count} visits - ${follow.compliance_level}`);
    });

    // Test 5: Quality Indicators
    console.log('\n⭐ Testing Quality Indicators...');
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
      WHERE v.clinic_id = ?
    `, [clinicId]);

    console.log('🏆 Quality Indicators Results:');
    const q = quality[0];
    console.log(`  Total Visits: ${q.total_visits}`);
    console.log(`  Diagnosis Documentation Rate: ${q.diagnosis_rate}%`);
    console.log(`  Vitals Documentation Rate: ${q.vitals_rate}%`);

    console.log('\n✅ Doctor Productivity testing completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDoctorProductivity();