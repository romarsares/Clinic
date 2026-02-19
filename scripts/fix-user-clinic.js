/**
 * Fix User Clinic Association Script
 * 
 * This script ensures all users have a valid clinic_id.
 * Run this if you encounter "Access denied: No clinic association" errors.
 * 
 * Usage: node scripts/fix-user-clinic.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixUserClinicAssociation() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clinic_saas'
    });

    console.log('Connected to database');

    // Check for users without clinic_id
    const [usersWithoutClinic] = await connection.execute(
      'SELECT id, email, full_name, clinic_id FROM auth_users WHERE clinic_id IS NULL OR clinic_id = 0'
    );

    if (usersWithoutClinic.length === 0) {
      console.log('✓ All users have valid clinic associations');
      return;
    }

    console.log(`\nFound ${usersWithoutClinic.length} user(s) without clinic association:`);
    usersWithoutClinic.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });

    // Check if there's a default clinic
    const [clinics] = await connection.execute(
      'SELECT id, name FROM clinics ORDER BY id LIMIT 1'
    );

    if (clinics.length === 0) {
      console.log('\n⚠ No clinics found in database. Creating default clinic...');
      
      const [result] = await connection.execute(`
        INSERT INTO clinics (name, address, contact_number, email, timezone, status, created_at, updated_at)
        VALUES ('Default Clinic', '123 Main St', '+1234567890', 'clinic@example.com', 'Asia/Manila', 'active', NOW(), NOW())
      `);
      
      const defaultClinicId = result.insertId;
      console.log(`✓ Created default clinic (ID: ${defaultClinicId})`);
      
      // Update users
      await connection.execute(
        'UPDATE auth_users SET clinic_id = ? WHERE clinic_id IS NULL OR clinic_id = 0',
        [defaultClinicId]
      );
      
      console.log(`✓ Updated ${usersWithoutClinic.length} user(s) with clinic ID ${defaultClinicId}`);
    } else {
      const defaultClinicId = clinics[0].id;
      console.log(`\nUsing existing clinic: ${clinics[0].name} (ID: ${defaultClinicId})`);
      
      // Update users
      await connection.execute(
        'UPDATE auth_users SET clinic_id = ? WHERE clinic_id IS NULL OR clinic_id = 0',
        [defaultClinicId]
      );
      
      console.log(`✓ Updated ${usersWithoutClinic.length} user(s) with clinic ID ${defaultClinicId}`);
    }

    // Verify the fix
    const [verifyUsers] = await connection.execute(
      'SELECT id, email, clinic_id FROM auth_users WHERE clinic_id IS NULL OR clinic_id = 0'
    );

    if (verifyUsers.length === 0) {
      console.log('\n✓ All users now have valid clinic associations');
    } else {
      console.log('\n⚠ Some users still without clinic association. Please check manually.');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the script
fixUserClinicAssociation()
  .then(() => {
    console.log('\n✓ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Script failed:', error.message);
    process.exit(1);
  });
