const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkLogin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== LOGIN CHECK ===\n');

    // Check if auth_users table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'auth_users'");
    
    if (tables.length === 0) {
        console.log('❌ auth_users table does NOT exist!');
        console.log('   You need to run the database initialization script.');
        await connection.end();
        return;
    }

    console.log('✅ auth_users table exists\n');

    // Check for admin user
    const [users] = await connection.execute(
        "SELECT user_id, email, full_name, status, created_at FROM auth_users WHERE email = 'admin@curaone.com'"
    );

    if (users.length === 0) {
        console.log('❌ Admin user (admin@curaone.com) NOT FOUND!');
        console.log('\n📋 Available users:');
        const [allUsers] = await connection.execute(
            "SELECT user_id, email, full_name, status FROM auth_users LIMIT 10"
        );
        console.table(allUsers);
        console.log('\n⚠️  You cannot login until admin user is created.');
    } else {
        console.log('✅ Admin user found!\n');
        console.log('📧 Email:', users[0].email);
        console.log('👤 Name:', users[0].full_name);
        console.log('📊 Status:', users[0].status);
        console.log('📅 Created:', users[0].created_at);
        console.log('\n✅ YOU CAN LOGIN with:');
        console.log('   Email: admin@curaone.com');
        console.log('   Password: admin123');
    }

    await connection.end();
}

checkLogin().catch(console.error);
