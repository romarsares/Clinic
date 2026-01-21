const mysql = require('mysql2/promise');

async function addVaccineTable() {
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

    // Create patient_vaccines table
    console.log('📋 Creating patient_vaccines table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patient_vaccines (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        clinic_id BIGINT NOT NULL,
        patient_id BIGINT NOT NULL,
        vaccine_name VARCHAR(255) NOT NULL,
        vaccine_type VARCHAR(100),
        administered_date DATE NOT NULL,
        dose_number INT,
        batch_number VARCHAR(100),
        manufacturer VARCHAR(255),
        site_administered VARCHAR(100),
        administered_by BIGINT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (administered_by) REFERENCES auth_users(id),
        INDEX idx_patient_vaccines_patient (patient_id),
        INDEX idx_patient_vaccines_clinic (clinic_id),
        INDEX idx_patient_vaccines_date (administered_date)
      )
    `);

    console.log('✅ patient_vaccines table created successfully');

    // Check if table was created
    const [tables] = await connection.execute("SHOW TABLES LIKE 'patient_vaccines'");
    console.log('📋 patient_vaccines table exists:', tables.length > 0);

  } catch (error) {
    console.error('❌ Error creating vaccine table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addVaccineTable();