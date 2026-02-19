/**
 * Create User with Password Script
 * 
 * Usage: node scripts/create-user.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createUser() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clinic_saas'
    });

    console.log('✓ Connected to database\n');

    // Get user input
    const email = await question('Email: ');
    const password = await question('Password: ');
    const fullName = await question('Full Name: ');
    
    // Check if clinic exists
    const [clinics] = await connection.execute('SELECT id, name FROM clinics LIMIT 1');
    
    let clinicId;
    if (clinics.length === 0) {
      console.log('\n⚠ No clinic found. Creating default clinic...');
      const [result] = await connection.execute(`
        INSERT INTO clinics (name, address, contact_number, email, timezone, status, created_at, updated_at)
        VALUES ('Default Clinic', '123 Main St', '+1234567890', 'clinic@example.com', 'Asia/Manila', 'active', NOW(), NOW())
      `);
      clinicId = result.insertId;
      console.log(`✓ Created clinic (ID: ${clinicId})`);
    } else {
      clinicId = clinics[0].id;
      console.log(`\n✓ Using clinic: ${clinics[0].name} (ID: ${clinicId})`);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await connection.execute(`
      INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
    `, [clinicId, email, passwordHash, fullName]);

    console.log(`\n✓ User created successfully!`);
    console.log(`\nLogin credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Clinic ID: ${clinicId}`);

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('\n✗ User with this email already exists');
    } else {
      console.error('\n✗ Error:', error.message);
    }
  } finally {
    if (connection) await connection.end();
    rl.close();
  }
}

createUser();
