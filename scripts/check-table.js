require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clinic_saas'
  });

  const [columns] = await connection.execute("DESCRIBE patients");
  console.log('\nPatients table columns:');
  columns.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
  
  await connection.end();
}

checkTable();
