require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUser() {
  const connection = await mysql.createConnection({
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
    WHERE u.id = 1042
    GROUP BY u.id
  `);

  console.log('\nUser 1042:', users.length ? users[0] : 'NOT FOUND');
  
  await connection.end();
}

checkUser();
