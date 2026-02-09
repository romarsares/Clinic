const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTableStructure() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== AUTH_USERS TABLE STRUCTURE ===\n');

    // Get table structure
    const [columns] = await connection.execute("DESCRIBE auth_users");
    console.table(columns);

    console.log('\n=== CHECKING LOGIN ===\n');

    // Get all users (using correct column names)
    const [users] = await connection.execute("SELECT * FROM auth_users LIMIT 5");
    
    if (users.length === 0) {
        console.log('❌ NO USERS FOUND! Database is empty.');
        console.log('   Run: npm run init-db');
    } else {
        console.log('✅ Users found:', users.length);
        console.table(users);
        
        // Check for admin
        const admin = users.find(u => u.email === 'admin@curaone.com' || u.email === 'admin@clinic.com');
        if (admin) {
            console.log('\n✅ YOU CAN LOGIN!');
            console.log('   Email:', admin.email);
            console.log('   Password: admin123 (or admin12354)');
        } else {
            console.log('\n⚠️  Admin user not found. Available emails:');
            users.forEach(u => console.log('   -', u.email));
        }
    }

    await connection.end();
}

checkTableStructure().catch(console.error);
