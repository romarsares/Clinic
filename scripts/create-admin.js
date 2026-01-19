// Generate Admin User with Proper Password Hash
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdminUser() {
  try {
    // Generate password hash
    const password = 'admin12354';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Generated password hash:', passwordHash);
    
    // Database connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD || 'N1mbu$12354',
      database: 'clinic_saas'
    });

    // Insert default clinic
    await connection.execute(`
      INSERT IGNORE INTO clinics (id, name, address, contact_number, email, created_at) 
      VALUES (1, 'Demo Clinic', '123 Main St', '+63-912-345-6789', 'demo@clinic.com', NOW())
    `);

    // Insert admin user
    await connection.execute(`
      INSERT IGNORE INTO auth_users (id, clinic_id, email, password_hash, full_name, status, created_at) 
      VALUES (1, 1, 'admin@clinic.com', ?, 'System Administrator', 'active', NOW())
    `, [passwordHash]);

    // Insert roles
    await connection.execute(`
      INSERT IGNORE INTO roles (id, clinic_id, name, description, created_at) VALUES
      (1, 1, 'Owner', 'Clinic owner with full access', NOW()),
      (2, 1, 'Doctor', 'Medical doctor', NOW()),
      (3, 1, 'Staff', 'Administrative staff', NOW()),
      (4, 1, 'Lab Technician', 'Laboratory technician', NOW())
    `);

    // Assign Owner role
    await connection.execute(`
      INSERT IGNORE INTO user_roles (user_id, role_id, created_at) 
      VALUES (1, 1, NOW())
    `);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@clinic.com');
    console.log('🔑 Password: admin12354');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();