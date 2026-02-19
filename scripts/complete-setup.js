/**
 * Complete Setup - Admin User + Permissions
 * 
 * Usage: node scripts/complete-setup.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function completeSetup() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clinic_saas'
    });

    console.log('✓ Connected to database\n');

    // 1. Create/Get Clinic
    const [clinics] = await connection.execute('SELECT id, name FROM clinics LIMIT 1');
    let clinicId;
    
    if (clinics.length === 0) {
      const [result] = await connection.execute(`
        INSERT INTO clinics (name, address, contact_number, email, timezone, status, created_at, updated_at)
        VALUES ('My Clinic', '123 Main Street', '+63 912 345 6789', 'clinic@example.com', 'Asia/Manila', 'active', NOW(), NOW())
      `);
      clinicId = result.insertId;
      console.log(`✓ Clinic created (ID: ${clinicId})`);
    } else {
      clinicId = clinics[0].id;
      console.log(`✓ Using clinic: ${clinics[0].name} (ID: ${clinicId})`);
    }

    // 2. Check column types and create user_permissions table
    const [userCols] = await connection.execute(
      "SELECT DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'auth_users' AND COLUMN_NAME = 'id'",
      [process.env.DB_NAME || 'clinic_saas']
    );
    const [clinicCols] = await connection.execute(
      "SELECT DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'clinics' AND COLUMN_NAME = 'id'",
      [process.env.DB_NAME || 'clinic_saas']
    );

    const userIdType = userCols[0]?.COLUMN_TYPE || 'INT';
    const clinicIdType = clinicCols[0]?.COLUMN_TYPE || 'INT';

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id ${userIdType} NOT NULL,
        clinic_id ${clinicIdType} NOT NULL,
        permission_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_permission (user_id, clinic_id, permission_key),
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Permissions table ready');

    // 3. Create/Update Admin User
    const passwordHash = await bcrypt.hash('admin12354', 12);
    const [existingUsers] = await connection.execute(
      'SELECT id FROM auth_users WHERE email = "admin@clinic.com"'
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      await connection.execute(
        'UPDATE auth_users SET password_hash = ?, clinic_id = ?, status = "active" WHERE id = ?',
        [passwordHash, clinicId, userId]
      );
      console.log(`✓ Admin user updated (ID: ${userId})`);
    } else {
      const [result] = await connection.execute(`
        INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at)
        VALUES (?, 'admin@clinic.com', ?, 'Admin User', 'active', NOW(), NOW())
      `, [clinicId, passwordHash]);
      userId = result.insertId;
      console.log(`✓ Admin user created (ID: ${userId})`);
    }

    // 4. Create Super User Role
    const [roles] = await connection.execute(
      'SELECT id FROM roles WHERE name = "Super User" AND clinic_id = ?',
      [clinicId]
    );

    let roleId;
    if (roles.length === 0) {
      const [result] = await connection.execute(`
        INSERT INTO roles (clinic_id, name, description, created_at, updated_at)
        VALUES (?, 'Super User', 'Full system access', NOW(), NOW())
      `, [clinicId]);
      roleId = result.insertId;
      console.log(`✓ Super User role created (ID: ${roleId})`);
    } else {
      roleId = roles[0].id;
      console.log(`✓ Using Super User role (ID: ${roleId})`);
    }

    // 5. Assign Role
    await connection.execute(
      'INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())',
      [userId, roleId]
    );
    console.log('✓ Role assigned');

    // 6. Grant All Permissions
    const permissions = [
      'patient.add', 'patient.edit', 'patient.view', 'patient.delete',
      'appointment.create', 'appointment.edit', 'appointment.view', 'appointment.cancel',
      'billing.create', 'billing.edit', 'billing.view', 'billing.payment',
      'clinical.visit.create', 'clinical.visit.edit', 'clinical.visit.view', 'clinical.lab.order',
      'lab.request.create', 'lab.result.enter', 'lab.result.view', 'lab.dashboard',
      'reports.clinical', 'reports.financial', 'reports.patient', 'reports.export',
      'admin.users', 'admin.permissions', 'admin.settings', 'admin.audit'
    ];

    await connection.execute(
      'DELETE FROM user_permissions WHERE user_id = ? AND clinic_id = ?',
      [userId, clinicId]
    );

    for (const permission of permissions) {
      await connection.execute(`
        INSERT INTO user_permissions (user_id, clinic_id, permission_key, created_at)
        VALUES (?, ?, ?, NOW())
      `, [userId, clinicId, permission]);
    }
    console.log(`✓ ${permissions.length} permissions granted\n`);

    console.log('═══════════════════════════════════════');
    console.log('✓ SETUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log('\nLogin Credentials:');
    console.log('  Email:    admin@clinic.com');
    console.log('  Password: admin12354');
    console.log('\nNext Steps:');
    console.log('  1. Log out from the application');
    console.log('  2. Clear browser local storage');
    console.log('  3. Log in with the credentials above');
    console.log('  4. You should now have full access!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

completeSetup()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
