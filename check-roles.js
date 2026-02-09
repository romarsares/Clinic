const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRoleStructure() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== ROLES TABLE STRUCTURE ===\n');
    const [roleColumns] = await connection.execute("DESCRIBE roles");
    console.table(roleColumns);

    console.log('\n=== USER_ROLES TABLE STRUCTURE ===\n');
    const [userRoleColumns] = await connection.execute("DESCRIBE user_roles");
    console.table(userRoleColumns);

    console.log('\n=== ALL ROLES ===\n');
    const [roles] = await connection.execute("SELECT * FROM roles");
    console.table(roles);

    console.log('\n=== USER ROLE ASSIGNMENTS ===\n');
    const [userRoles] = await connection.execute("SELECT * FROM user_roles");
    console.table(userRoles);

    // Now find super user with correct column names
    console.log('\n=== FINDING SUPER USER ===\n');
    const [users] = await connection.execute(`
        SELECT ur.*, u.email, u.full_name, r.*
        FROM user_roles ur
        JOIN auth_users u ON ur.user_id = u.id
        JOIN roles r ON ur.role_id = r.id
        ORDER BY u.id
    `);
    console.table(users);

    await connection.end();
}

checkRoleStructure().catch(console.error);
