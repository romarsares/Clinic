/**
 * Quick Setup - Create Default Admin User
 * 
 * Creates an admin user with default credentials:
 * Email: admin@clinic.com
 * Password: admin12354
 * 
 * Usage: node scripts/setup-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function setupAdmin() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clinic_saas'
    });

    console.log('✓ Connected to database\n');

    // Check/Create clinic
    const [clinics] = await connection.execute('SELECT id, name FROM clinics LIMIT 1');
    
    let clinicId;
    if (clinics.length === 0) {
      console.log('Creating default clinic...');
      const [result] = await connection.execute(`
        INSERT INTO clinics (name, address, contact_number, email, timezone, status, created_at, updated_at)
        VALUES ('My Clinic', '123 Main Street', '+63 912 345 6789', 'clinic@example.com', 'Asia/Manila', 'active', NOW(), NOW())
      `);
      clinicId = result.insertId;
      console.log(`✓ Clinic created (ID: ${clinicId})\n`);
    } else {
      clinicId = clinics[0].id;
      console.log(`✓ Using existing clinic: ${clinics[0].name} (ID: ${clinicId})\n`);
    }

    // Check if admin exists
    const [existingUsers] = await connection.execute(
      'SELECT id, email, clinic_id FROM auth_users WHERE email = ?',
      ['admin@clinic.com']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists. Updating...');
      
      // Update password and clinic_id
      const passwordHash = await bcrypt.hash('admin12354', 12);
      await connection.execute(
        'UPDATE auth_users SET password_hash = ?, clinic_id = ?, status = "active" WHERE email = ?',
        [passwordHash, clinicId, 'admin@clinic.com']
      );
      
      console.log('✓ Admin user updated\n');
    } else {
      console.log('Creating admin user...');
      
      // Create admin user
      const passwordHash = await bcrypt.hash('admin12354', 12);
      const [result] = await connection.execute(`
        INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at)
        VALUES (?, 'admin@clinic.com', ?, 'Admin User', 'active', NOW(), NOW())
      `, [clinicId, passwordHash]);
      
      console.log(`✓ Admin user created (ID: ${result.insertId})\n`);
    }

    // Create Super User role if needed
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
      console.log('✓ Super User role created\n');
    } else {
      roleId = roles[0].id;
    }

    // Assign role to admin
    const [user] = await connection.execute(
      'SELECT id FROM auth_users WHERE email = "admin@clinic.com"'
    );
    
    if (user.length > 0) {
      await connection.execute(
        'INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())',
        [user[0].id, roleId]
      );
      console.log('✓ Super User role assigned\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('✓ Setup Complete!');
    console.log('═══════════════════════════════════════');
    console.log('\nLogin Credentials:');
    console.log('  Email:    admin@clinic.com');
    console.log('  Password: admin12354');
    console.log('  Clinic:   ' + clinics[0]?.name || 'My Clinic');
    console.log('\n⚠ IMPORTANT: Change the password after first login!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupAdmin()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
