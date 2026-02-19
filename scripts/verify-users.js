/**
 * Verify Users Have Clinic Association
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clinic_saas'
    });

    const [users] = await connection.execute(`
      SELECT u.id, u.email, u.clinic_id, u.status, GROUP_CONCAT(r.name) as roles
      FROM auth_users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
    `);

    console.log('\n═══════════════════════════════════════');
    console.log('USER VERIFICATION REPORT');
    console.log('═══════════════════════════════════════\n');

    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`  Clinic ID: ${user.clinic_id || '❌ MISSING'}`);
      console.log(`  Status: ${user.status}`);
      console.log(`  Roles: ${user.roles || 'None'}`);
      console.log('');
    });

    const missingClinic = users.filter(u => !u.clinic_id);
    if (missingClinic.length > 0) {
      console.log('⚠ WARNING: Users without clinic_id found!');
      console.log('Run: node scripts/seed-clinic.js\n');
    } else {
      console.log('✓ All users have clinic associations\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verifyUsers();
