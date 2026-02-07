const db = require('../src/config/database');

async function checkTestUsers() {
    try {
        await db.testConnection();
        
        const [users] = await db.executeQuery(`
            SELECT u.id, u.email, u.clinic_id, r.name as role 
            FROM auth_users u 
            LEFT JOIN user_roles ur ON u.id = ur.user_id 
            LEFT JOIN roles r ON ur.role_id = r.id 
            WHERE u.email IN ('owner@test.com', 'staff@test.com', 'admin@test.com', 'doctor@test.com')
            ORDER BY u.email, r.name
        `);
        
        console.log('\n=== Test Users and Roles ===');
        console.table(users);
        
        await db.closePool();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkTestUsers();
