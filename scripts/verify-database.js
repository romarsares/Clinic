const mysql = require('mysql2/promise');

async function verifyDatabase() {
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

    // Check if auth_users table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'auth_users'");
    console.log('📋 auth_users table exists:', tables.length > 0);

    if (tables.length > 0) {
      // Check users in database
      const [users] = await connection.execute('SELECT id, email, full_name, status FROM auth_users');
      console.log('👥 Users in database:', users.length);
      
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name}, Status: ${user.status}`);
      });

      // Check specific admin user
      const [adminUsers] = await connection.execute("SELECT * FROM auth_users WHERE email = 'admin@clinic.com'");
      console.log('👑 Admin user found:', adminUsers.length > 0);
      
      if (adminUsers.length > 0) {
        console.log('Admin user details:', {
          id: adminUsers[0].id,
          email: adminUsers[0].email,
          clinic_id: adminUsers[0].clinic_id,
          status: adminUsers[0].status
        });
      }

      // Check roles
      const [roles] = await connection.execute('SELECT * FROM roles');
      console.log('🎭 Roles in database:', roles.length);

      // Check user_roles
      const [userRoles] = await connection.execute('SELECT * FROM user_roles');
      console.log('🔗 User role assignments:', userRoles.length);
    }

  } catch (error) {
    console.error('❌ Error verifying database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyDatabase();