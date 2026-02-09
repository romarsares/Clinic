const mysql = require('mysql2/promise');
require('dotenv').config();

async function findSuperUser() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== FINDING SUPER USER ===\n');

    // Check user_roles table
    const [userRoles] = await connection.execute(`
        SELECT ur.user_id, u.email, u.full_name, r.role_name, r.description
        FROM user_roles ur
        JOIN auth_users u ON ur.user_id = u.id
        JOIN roles r ON ur.role_id = r.role_id
        ORDER BY u.id
    `);

    console.log('📋 User Roles:\n');
    console.table(userRoles);

    // Check for Owner role (highest access)
    const owners = userRoles.filter(ur => ur.role_name === 'Owner');
    
    if (owners.length > 0) {
        console.log('\n👑 SUPER USER (Owner Role):');
        owners.forEach(owner => {
            console.log(`   Email: ${owner.email}`);
            console.log(`   Name: ${owner.full_name}`);
            console.log(`   Password: password123 (default)`);
        });
    } else {
        console.log('\n❌ No Owner found!');
    }

    // Check all roles
    console.log('\n📊 Available Roles:');
    const [roles] = await connection.execute('SELECT * FROM roles');
    console.table(roles);

    await connection.end();
}

findSuperUser().catch(console.error);
