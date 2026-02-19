/**
 * Simple Setup - No Foreign Keys
 * 
 * Usage: node scripts/simple-setup.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function simpleSetup() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clinic_saas'
    });

    console.log('✓ Connected\n');

    // 1. Get/Create Clinic
    let [clinics] = await connection.execute('SELECT id FROM clinics LIMIT 1');
    let clinicId = clinics[0]?.id;
    
    if (!clinicId) {
      const [r] = await connection.execute(`
        INSERT INTO clinics (name, address, contact_number, email, timezone, status, created_at, updated_at)
        VALUES ('My Clinic', '123 Main St', '+1234567890', 'clinic@example.com', 'Asia/Manila', 'active', NOW(), NOW())
      `);
      clinicId = r.insertId;
    }
    console.log(`✓ Clinic ID: ${clinicId}`);

    // 2. Create permissions table (no FK)
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
    console.log('✓ Permissions table ready');

    // 3. Create/Update Admin
    const hash = await bcrypt.hash('admin12354', 12);
    let [users] = await connection.execute('SELECT id FROM auth_users WHERE email = "admin@clinic.com"');
    let userId = users[0]?.id;

    if (userId) {
      await connection.execute(
        'UPDATE auth_users SET password_hash = ?, clinic_id = ?, status = "active" WHERE id = ?',
        [hash, clinicId, userId]
      );
    } else {
      const [r] = await connection.execute(
        'INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at) VALUES (?, "admin@clinic.com", ?, "Admin", "active", NOW(), NOW())',
        [clinicId, hash]
      );
      userId = r.insertId;
    }
    console.log(`✓ Admin ID: ${userId}`);

    // 4. Create Role
    let [roles] = await connection.execute('SELECT id FROM roles WHERE name = "Super User" AND clinic_id = ?', [clinicId]);
    let roleId = roles[0]?.id;

    if (!roleId) {
      const [r] = await connection.execute(
        'INSERT INTO roles (clinic_id, name, description, created_at, updated_at) VALUES (?, "Super User", "Full access", NOW(), NOW())',
        [clinicId]
      );
      roleId = r.insertId;
    }

    await connection.execute('INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())', [userId, roleId]);
    console.log('✓ Role assigned');

    // 5. Grant Permissions
    const perms = [
      'patient.add', 'patient.edit', 'patient.view', 'patient.delete',
      'appointment.create', 'appointment.edit', 'appointment.view', 'appointment.cancel',
      'clinical.visit.create', 'clinical.visit.edit', 'clinical.visit.view'
    ];

    await connection.execute('DELETE FROM user_permissions WHERE user_id = ?', [userId]);

    for (const p of perms) {
      await connection.execute(
        'INSERT INTO user_permissions (user_id, clinic_id, permission_key) VALUES (?, ?, ?)',
        [userId, clinicId, p]
      );
    }
    console.log(`✓ ${perms.length} permissions granted\n`);

    console.log('═══════════════════════════════════════');
    console.log('✓ DONE!');
    console.log('═══════════════════════════════════════');
    console.log('Email:    admin@clinic.com');
    console.log('Password: admin12354');
    console.log('\n1. Log out');
    console.log('2. Clear local storage (F12)');
    console.log('3. Log in again');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

simpleSetup().then(() => process.exit(0));
