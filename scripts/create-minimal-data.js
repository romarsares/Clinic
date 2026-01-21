const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createMinimalSampleData() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    
    // Database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD || 'N1mbu$12354',
      database: 'clinic_saas'
    });

    console.log('✅ Connected to database');

    // Generate password hashes
    const adminHash = await bcrypt.hash('admin12354', 10);
    const doctorHash = await bcrypt.hash('doctor123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);
    const labtechHash = await bcrypt.hash('labtech123', 10);

    console.log('🔐 Generated password hashes');

    // 1. Insert clinics
    await connection.execute(`
      INSERT IGNORE INTO clinics (id, name, contact_number, email, created_at) VALUES
      (1, 'Sunshine Pediatric Clinic', '+63-2-123-4567', 'info@sunshineclinic.com', NOW())
    `);
    console.log('✅ Clinics created');

    // 2. Insert roles
    await connection.execute(`
      INSERT IGNORE INTO roles (id, clinic_id, name, description, created_at) VALUES
      (1, 1, 'Owner', 'Clinic owner with full access', NOW()),
      (2, 1, 'Doctor', 'Medical doctor', NOW()),
      (3, 1, 'Staff', 'Administrative staff', NOW()),
      (4, 1, 'Lab Technician', 'Laboratory technician', NOW()),
      (5, 1, 'Admin', 'System administrator', NOW())
    `);
    console.log('✅ Roles created');

    // 3. Insert users
    await connection.execute(`
      INSERT IGNORE INTO auth_users (id, clinic_id, email, password_hash, full_name, status, created_at) VALUES
      (1, 1, 'admin@clinic.com', ?, 'System Administrator', 'active', NOW()),
      (2, 1, 'dr.santos@clinic.com', ?, 'Dr. Maria Santos', 'active', NOW()),
      (3, 1, 'staff@clinic.com', ?, 'Jane Dela Cruz', 'active', NOW()),
      (4, 1, 'labtech@clinic.com', ?, 'John Lab Tech', 'active', NOW())
    `, [adminHash, doctorHash, staffHash, labtechHash]);
    console.log('✅ Users created');

    // 4. Assign user roles
    await connection.execute(`
      INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES
      (1, 1, NOW()),  -- Admin as Owner
      (1, 5, NOW()),  -- Admin as Admin
      (2, 2, NOW()),  -- Dr. Santos as Doctor
      (3, 3, NOW()),  -- Jane as Staff
      (4, 4, NOW())   -- John as Lab Technician
    `);
    console.log('✅ User roles assigned');

    // 5. Insert appointment types
    await connection.execute(`
      INSERT IGNORE INTO appointment_types (id, clinic_id, name, description, duration_minutes, color, created_at) VALUES
      (1, 1, 'General Consultation', 'Regular pediatric consultation', 30, '#007bff', NOW()),
      (2, 1, 'Follow-up Visit', 'Follow-up consultation', 20, '#28a745', NOW()),
      (3, 1, 'Vaccination', 'Immunization appointment', 15, '#ffc107', NOW()),
      (4, 1, 'Emergency', 'Emergency consultation', 45, '#dc3545', NOW())
    `);
    console.log('✅ Appointment types created');

    // 6. Insert sample patients (basic info only)
    await connection.execute(`
      INSERT IGNORE INTO patients (id, clinic_id, patient_code, full_name, first_name, last_name, birth_date, gender, contact_number, email, created_at) VALUES
      (1, 1, 'P001', 'Juan Dela Cruz', 'Juan', 'Dela Cruz', '2018-05-15', 'male', '+63-912-345-6789', 'parent1@email.com', NOW()),
      (2, 1, 'P002', 'Maria Garcia', 'Maria', 'Garcia', '2020-03-22', 'female', '+63-917-123-4567', 'parent2@email.com', NOW()),
      (3, 1, 'P003', 'Pedro Santos', 'Pedro', 'Santos', '2019-08-10', 'male', '+63-918-987-6543', 'parent3@email.com', NOW())
    `);
    console.log('✅ Sample patients created');

    console.log('\n🎉 Minimal sample data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👑 Admin: admin@clinic.com / admin12354');
    console.log('👨‍⚕️ Doctor: dr.santos@clinic.com / doctor123');
    console.log('👩‍💼 Staff: staff@clinic.com / staff123');
    console.log('🔬 Lab Tech: labtech@clinic.com / labtech123');
    console.log('\n📊 Created:');
    console.log('• 1 Clinic (Sunshine Pediatric Clinic)');
    console.log('• 5 Roles (Owner, Doctor, Staff, Lab Technician, Admin)');
    console.log('• 4 Users with proper role assignments');
    console.log('• 4 Appointment types');
    console.log('• 3 Sample patients');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createMinimalSampleData();