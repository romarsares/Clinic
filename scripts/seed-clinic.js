/**
 * Seed Complete Clinic Data
 * 
 * Creates: 1 Clinic, 1 Owner, 1 Doctor, 1 Staff, 3 Patients
 * Usage: node scripts/seed-clinic.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seedClinic() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clinic_saas'
    });

    console.log('✓ Connected to database\n');

    // 1. Get or Create Clinic
    let [clinics] = await connection.execute(
      "SELECT id FROM clinics WHERE email = 'info@sunshinemedical.com'"
    );
    
    let clinicId;
    if (clinics.length > 0) {
      clinicId = clinics[0].id;
      console.log(`✓ Using existing clinic (ID: ${clinicId})`);
    } else {
      const [result] = await connection.execute(`
        INSERT INTO clinics (name, address, contact_number, email, timezone, status, created_at, updated_at)
        VALUES ('Sunshine Medical Clinic', '456 Health Street, Manila', '+63 917 123 4567', 'info@sunshinemedical.com', 'Asia/Manila', 'active', NOW(), NOW())
      `);
      clinicId = result.insertId;
      console.log(`✓ Clinic created (ID: ${clinicId})`);
    }

    // 2. Create user_permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        clinic_id BIGINT NOT NULL,
        permission_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (user_id, clinic_id, permission_key)
      )
    `);

    // 3. Create Roles (check if exists first)
    let ownerRoleId, doctorRoleId, staffRoleId;
    
    let [ownerRoles] = await connection.execute(
      'SELECT id FROM roles WHERE name = "Owner" AND clinic_id = ?', [clinicId]
    );
    if (ownerRoles.length > 0) {
      ownerRoleId = ownerRoles[0].id;
    } else {
      const [r] = await connection.execute(
        'INSERT INTO roles (clinic_id, name, description, created_at, updated_at) VALUES (?, "Owner", "Clinic owner with full access", NOW(), NOW())',
        [clinicId]
      );
      ownerRoleId = r.insertId;
    }

    let [doctorRoles] = await connection.execute(
      'SELECT id FROM roles WHERE name = "Doctor" AND clinic_id = ?', [clinicId]
    );
    if (doctorRoles.length > 0) {
      doctorRoleId = doctorRoles[0].id;
    } else {
      const [r] = await connection.execute(
        'INSERT INTO roles (clinic_id, name, description, created_at, updated_at) VALUES (?, "Doctor", "Medical doctor", NOW(), NOW())',
        [clinicId]
      );
      doctorRoleId = r.insertId;
    }

    let [staffRoles] = await connection.execute(
      'SELECT id FROM roles WHERE name = "Staff" AND clinic_id = ?', [clinicId]
    );
    if (staffRoles.length > 0) {
      staffRoleId = staffRoles[0].id;
    } else {
      const [r] = await connection.execute(
        'INSERT INTO roles (clinic_id, name, description, created_at, updated_at) VALUES (?, "Staff", "Administrative staff", NOW(), NOW())',
        [clinicId]
      );
      staffRoleId = r.insertId;
    }
    console.log('✓ Roles ready');

    // 4. Create Users (check if exists)
    const password = await bcrypt.hash('password123', 12);
    
    let ownerId, doctorId, staffId;
    
    // Owner
    let [owners] = await connection.execute('SELECT id FROM auth_users WHERE email = "owner@clinic.com"');
    if (owners.length > 0) {
      ownerId = owners[0].id;
      await connection.execute('UPDATE auth_users SET clinic_id = ?, password_hash = ? WHERE id = ?', [clinicId, password, ownerId]);
    } else {
      const [r] = await connection.execute(
        'INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at) VALUES (?, "owner@clinic.com", ?, "Dr. Maria Santos", "active", NOW(), NOW())',
        [clinicId, password]
      );
      ownerId = r.insertId;
    }
    await connection.execute('INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())', [ownerId, ownerRoleId]);
    
    // Doctor
    let [doctors] = await connection.execute('SELECT id FROM auth_users WHERE email = "doctor@clinic.com"');
    if (doctors.length > 0) {
      doctorId = doctors[0].id;
      await connection.execute('UPDATE auth_users SET clinic_id = ?, password_hash = ? WHERE id = ?', [clinicId, password, doctorId]);
    } else {
      const [r] = await connection.execute(
        'INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at) VALUES (?, "doctor@clinic.com", ?, "Dr. Juan Cruz", "active", NOW(), NOW())',
        [clinicId, password]
      );
      doctorId = r.insertId;
    }
    await connection.execute('INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())', [doctorId, doctorRoleId]);
    
    // Staff
    let [staffs] = await connection.execute('SELECT id FROM auth_users WHERE email = "staff@clinic.com"');
    if (staffs.length > 0) {
      staffId = staffs[0].id;
      await connection.execute('UPDATE auth_users SET clinic_id = ?, password_hash = ? WHERE id = ?', [clinicId, password, staffId]);
    } else {
      const [r] = await connection.execute(
        'INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at) VALUES (?, "staff@clinic.com", ?, "Ana Reyes", "active", NOW(), NOW())',
        [clinicId, password]
      );
      staffId = r.insertId;
    }
    await connection.execute('INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())', [staffId, staffRoleId]);
    
    console.log('✓ Users ready');

    // 5. Grant Permissions
    const allPerms = [
      'patient.add', 'patient.edit', 'patient.view', 'patient.delete',
      'appointment.create', 'appointment.edit', 'appointment.view', 'appointment.cancel',
      'clinical.visit.create', 'clinical.visit.edit', 'clinical.visit.view',
      'billing.create', 'billing.edit', 'billing.view',
      'admin.users', 'admin.settings'
    ];

    const doctorPerms = [
      'patient.view', 'appointment.view', 'clinical.visit.create', 
      'clinical.visit.edit', 'clinical.visit.view'
    ];

    const staffPerms = [
      'patient.add', 'patient.edit', 'patient.view',
      'appointment.create', 'appointment.edit', 'appointment.view'
    ];

    // Owner gets all permissions
    await connection.execute('DELETE FROM user_permissions WHERE user_id = ?', [ownerId]);
    for (const perm of allPerms) {
      await connection.execute(
        'INSERT INTO user_permissions (user_id, clinic_id, permission_key) VALUES (?, ?, ?)',
        [ownerId, clinicId, perm]
      );
    }

    // Doctor permissions
    await connection.execute('DELETE FROM user_permissions WHERE user_id = ?', [doctorId]);
    for (const perm of doctorPerms) {
      await connection.execute(
        'INSERT INTO user_permissions (user_id, clinic_id, permission_key) VALUES (?, ?, ?)',
        [doctorId, clinicId, perm]
      );
    }

    // Staff permissions
    await connection.execute('DELETE FROM user_permissions WHERE user_id = ?', [staffId]);
    for (const perm of staffPerms) {
      await connection.execute(
        'INSERT INTO user_permissions (user_id, clinic_id, permission_key) VALUES (?, ?, ?)',
        [staffId, clinicId, perm]
      );
    }

    console.log('✓ Permissions granted');

    // 6. Create Patients
    const patients = [
      {
        first_name: 'Pedro',
        last_name: 'Dela Cruz',
        full_name: 'Pedro Dela Cruz',
        birth_date: '1985-03-15',
        gender: 'male',
        contact_number: '+63 918 111 2222',
        email: 'pedro.delacruz@email.com',
        notes: 'Adult patient, regular checkups'
      },
      {
        first_name: 'Sofia',
        last_name: 'Garcia',
        full_name: 'Sofia Garcia',
        birth_date: '2015-07-22',
        gender: 'female',
        contact_number: '+63 919 333 4444',
        email: 'garcia.family@email.com',
        notes: 'Pediatric patient'
      },
      {
        first_name: 'Miguel',
        last_name: 'Ramos',
        full_name: 'Miguel Ramos',
        birth_date: '1992-11-08',
        gender: 'male',
        contact_number: '+63 920 555 6666',
        email: 'miguel.ramos@email.com',
        notes: 'Adult patient'
      }
    ];

    for (const patient of patients) {
      await connection.execute(`
        INSERT INTO patients (
          clinic_id, patient_code, full_name, first_name, last_name, birth_date, 
          gender, contact_number, email, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        clinicId, `P${Date.now()}${Math.floor(Math.random()*1000)}`, 
        patient.full_name, patient.first_name, patient.last_name, patient.birth_date,
        patient.gender, patient.contact_number, patient.email, patient.notes
      ]);
    }

    console.log('✓ 3 Patients created\n');

    console.log('═══════════════════════════════════════');
    console.log('✓ CLINIC DATA SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log('\nClinic: Sunshine Medical Clinic');
    console.log(`Clinic ID: ${clinicId}`);
    console.log('\nLogin Credentials (password for all: password123):');
    console.log('┌─────────────────────────────────────┐');
    console.log('│ Owner:  owner@clinic.com            │');
    console.log('│ Doctor: doctor@clinic.com           │');
    console.log('│ Staff:  staff@clinic.com            │');
    console.log('└─────────────────────────────────────┘');
    console.log('\nPatients:');
    console.log('  1. Pedro Dela Cruz (Adult, Male)');
    console.log('  2. Sofia Garcia (Child, Female)');
    console.log('  3. Miguel Ramos (Adult, Male)');
    console.log('\n⚠ IMPORTANT: Change passwords after first login!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n✗ Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedClinic().then(() => process.exit(0));
