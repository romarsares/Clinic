const mysql = require('mysql2/promise');

async function addSimplePediatricData() {
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

    // Add some milestones to existing pediatric patients
    console.log('🎯 Adding milestones to existing patients...');
    
    const [pediatricPatients] = await connection.execute(`
      SELECT id FROM patients 
      WHERE clinic_id = 1 AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 10 
      LIMIT 3
    `);

    if (pediatricPatients.length > 0) {
      for (const patient of pediatricPatients) {
        await connection.execute(`
          INSERT IGNORE INTO patient_milestones (
            clinic_id, patient_id, milestone_description, milestone_category, 
            milestone_type, expected_age_months, achieved_date, achieved_age_months, 
            recorded_by
          ) VALUES 
          (1, ?, 'Lifts head when on tummy', 'motor', 'gross_motor', 2, DATE_SUB(CURDATE(), INTERVAL 200 DAY), 2, 8),
          (1, ?, 'Smiles at people', 'social', 'social_emotional', 3, DATE_SUB(CURDATE(), INTERVAL 180 DAY), 3, 8)
        `, [patient.id, patient.id]);
      }
      
      console.log(`✅ Added milestones for ${pediatricPatients.length} patients`);
    }

    // Add some vaccines
    console.log('💉 Adding vaccines...');
    
    if (pediatricPatients.length > 0) {
      for (const patient of pediatricPatients) {
        await connection.execute(`
          INSERT IGNORE INTO patient_vaccines (
            clinic_id, patient_id, vaccine_name, dose_number, administered_date, administered_by
          ) VALUES 
          (1, ?, 'BCG', 1, DATE_SUB(CURDATE(), INTERVAL 300 DAY), 8),
          (1, ?, 'DPT', 1, DATE_SUB(CURDATE(), INTERVAL 250 DAY), 8)
        `, [patient.id, patient.id]);
      }
      
      console.log(`✅ Added vaccines for ${pediatricPatients.length} patients`);
    }

    // Test the results
    console.log('\n📊 Testing updated data...');
    
    const [results] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT pm.id) as milestones,
        COUNT(DISTINCT pv.id) as vaccines
      FROM patients p
      LEFT JOIN patient_milestones pm ON p.id = pm.patient_id
      LEFT JOIN patient_vaccines pv ON p.id = pv.patient_id
      WHERE p.clinic_id = 1
    `);

    console.log(`  Milestones: ${results[0].milestones}`);
    console.log(`  Vaccines: ${results[0].vaccines}`);

    console.log('\n✅ Pediatric data added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addSimplePediatricData();