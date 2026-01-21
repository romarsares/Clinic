const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdminUser() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD || 'N1mbu$12354',
      database: 'clinic_saas'
    });

    console.log('✅ Connected to database');

    // Generate password hash
    const adminHash = await bcrypt.hash('admin12354', 10);
    console.log('🔐 Generated password hash');

    // Insert admin user
    await connection.execute(`
      INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at) 
      VALUES (1, 'admin@clinic.com', ?, 'System Administrator', 'active', NOW())
      ON DUPLICATE KEY UPDATE 
      password_hash = VALUES(password_hash),
      full_name = VALUES(full_name),
      status = VALUES(status)
    `, [adminHash]);

    // Get the user ID
    const [users] = await connection.execute("SELECT id FROM auth_users WHERE email = 'admin@clinic.com'");
    const userId = users[0].id;

    // Assign Owner role (assuming role ID 1 is Owner)
    await connection.execute(`
      INSERT IGNORE INTO user_roles (user_id, role_id, created_at) 
      VALUES (?, 1, NOW())
    `, [userId]);

    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email: admin@clinic.com');
    console.log('🔑 Password: admin12354');
    console.log('👑 Role: Owner');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminUser();