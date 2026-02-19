/**
 * Setup User Permissions
 * 
 * Grants all necessary permissions to admin user
 * 
 * Usage: node scripts/setup-permissions.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupPermissions() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clinic_saas'
    });

    console.log('✓ Connected to database\n');

    // Get admin user
    const [users] = await connection.execute(
      'SELECT id, email, clinic_id FROM auth_users WHERE email = "admin@clinic.com"'
    );

    if (users.length === 0) {
      console.log('✗ Admin user not found. Run setup-admin.js first.');
      process.exit(1);
    }

    const user = users[0];
    console.log(`Found user: ${user.email} (ID: ${user.id}, Clinic: ${user.clinic_id})\n`);

    // Define all permissions
    const permissions = [
      'patient.add',
      'patient.edit',
      'patient.view',
      'patient.delete',
      'appointment.create',
      'appointment.edit',
      'appointment.view',
      'appointment.cancel',
      'billing.create',
      'billing.edit',
      'billing.view',
      'billing.payment',
      'clinical.visit.create',
      'clinical.visit.edit',
      'clinical.visit.view',
      'clinical.lab.order',
      'lab.request.create',
      'lab.result.enter',
      'lab.result.view',
      'lab.dashboard',
      'reports.clinical',
      'reports.financial',
      'reports.patient',
      'reports.export',
      'admin.users',
      'admin.permissions',
      'admin.settings',
      'admin.audit'
    ];

    console.log('Setting up permissions...\n');

    // Clear existing permissions
    await connection.execute(
      'DELETE FROM user_permissions WHERE user_id = ? AND clinic_id = ?',
      [user.id, user.clinic_id]
    );

    // Insert all permissions
    for (const permission of permissions) {
      await connection.execute(`
        INSERT INTO user_permissions (user_id, clinic_id, permission_key, created_at)
        VALUES (?, ?, ?, NOW())
      `, [user.id, user.clinic_id, permission]);
      console.log(`  ✓ ${permission}`);
    }

    console.log(`\n✓ ${permissions.length} permissions granted to ${user.email}`);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupPermissions()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
