require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixAllUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clinic_saas'
  });

  // Get first clinic
  const [clinics] = await connection.execute('SELECT id FROM clinics LIMIT 1');
  if (clinics.length === 0) {
    console.log('No clinic found!');
    process.exit(1);
  }
  
  const clinicId = clinics[0].id;
  
  // Update all users without clinic_id
  const [result] = await connection.execute(
    'UPDATE auth_users SET clinic_id = ? WHERE clinic_id IS NULL',
    [clinicId]
  );
  
  console.log(`✓ Updated ${result.affectedRows} users with clinic_id ${clinicId}`);
  
  // Show all users
  const [users] = await connection.execute(
    'SELECT id, email, clinic_id FROM auth_users'
  );
  
  console.log('\nAll users:');
  users.forEach(u => console.log(`  ${u.email} - Clinic: ${u.clinic_id}`));
  
  await connection.end();
}

fixAllUsers();
