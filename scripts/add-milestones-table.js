const mysql = require('mysql2/promise');

async function addMilestonesTable() {
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

    // Create patient_milestones table
    console.log('📋 Creating patient_milestones table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patient_milestones (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        clinic_id BIGINT NOT NULL,
        patient_id BIGINT NOT NULL,
        milestone_description VARCHAR(255) NOT NULL,
        milestone_category VARCHAR(100),
        milestone_type VARCHAR(100),
        expected_age_months INT,
        achieved_date DATE,
        achieved_age_months INT,
        notes TEXT,
        recorded_by BIGINT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (recorded_by) REFERENCES auth_users(id),
        INDEX idx_patient_milestones_patient (patient_id),
        INDEX idx_patient_milestones_clinic (clinic_id)
      )
    `);

    console.log('✅ patient_milestones table created successfully');

    // Add some sample milestone data
    console.log('📊 Adding sample milestone data...');
    
    const [patients] = await connection.execute(`
      SELECT id FROM patients WHERE clinic_id = 1 
      AND TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 5 
      LIMIT 3
    `);

    if (patients.length > 0) {
      for (const patient of patients) {
        // Add some achieved milestones
        await connection.execute(`
          INSERT IGNORE INTO patient_milestones (
            clinic_id, patient_id, milestone_description, milestone_category, 
            milestone_type, expected_age_months, achieved_date, achieved_age_months, 
            recorded_by, created_at
          ) VALUES 
          (1, ?, 'Lifts head when on tummy', 'motor', 'gross_motor', 2, DATE_SUB(CURDATE(), INTERVAL 200 DAY), 2, 8, NOW()),
          (1, ?, 'Smiles at people', 'social', 'social_emotional', 3, DATE_SUB(CURDATE(), INTERVAL 180 DAY), 3, 8, NOW()),
          (1, ?, 'Sits without support', 'motor', 'gross_motor', 6, DATE_SUB(CURDATE(), INTERVAL 150 DAY), 6, 8, NOW())
        `, [patient.id, patient.id, patient.id]);
      }
      
      console.log(`✅ Added sample milestones for ${patients.length} patients`);
    }

    console.log('✅ Milestones table setup completed');

  } catch (error) {
    console.error('❌ Error creating milestones table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMilestonesTable();