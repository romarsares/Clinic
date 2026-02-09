const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== DATABASE CONTENT CHECK ===\n');

    // Check all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Total Tables: ${tables.length}\n`);

    for (const table of tables) {
        const tableName = Object.values(table)[0];
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = rows[0].count;
        
        console.log(`📋 ${tableName}: ${count} records`);
        
        // Show sample data for tables with records
        if (count > 0 && count <= 10) {
            const [data] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
            console.log(`   Sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
        }
    }

    console.log('\n=== KEY TABLES DETAIL ===\n');

    // Check clinics
    const [clinics] = await connection.execute('SELECT clinic_id, clinic_name, status FROM clinics');
    console.log('🏥 Clinics:', clinics);

    // Check users
    const [users] = await connection.execute('SELECT user_id, email, full_name, status FROM auth_users LIMIT 5');
    console.log('\n👤 Users:', users);

    // Check patients
    const [patients] = await connection.execute('SELECT patient_id, first_name, last_name, date_of_birth FROM patients LIMIT 5');
    console.log('\n🧑‍⚕️ Patients:', patients);

    // Check appointments
    const [appointments] = await connection.execute('SELECT appointment_id, appointment_date, status FROM appointments LIMIT 5');
    console.log('\n📅 Appointments:', appointments);

    await connection.end();
}

checkDatabase().catch(console.error);
