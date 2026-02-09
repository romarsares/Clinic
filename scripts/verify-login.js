const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function verifyLogin() {
    try {
        await db.testConnection();
        
        const email = 'owner@test.com';
        const password = 'TestPass123!';
        
        // Get user
        const [users] = await db.executeQuery(
            'SELECT id, email, password_hash, clinic_id, status FROM auth_users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            console.log('❌ User not found:', email);
            await db.closePool();
            return;
        }
        
        const user = users[0];
        console.log('\n✅ User found:');
        console.log('  ID:', user.id);
        console.log('  Email:', user.email);
        console.log('  Clinic ID:', user.clinic_id);
        console.log('  Status:', user.status);
        console.log('  Password Hash:', user.password_hash.substring(0, 20) + '...');
        
        // Test password
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log('\n🔐 Password Test:');
        console.log('  Input:', password);
        console.log('  Valid:', isValid ? '✅ YES' : '❌ NO');
        
        // Get roles
        const [roles] = await db.executeQuery(`
            SELECT r.name 
            FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = ?
        `, [user.id]);
        
        console.log('\n👤 Roles:', roles.map(r => r.name).join(', ') || 'None');
        
        await db.closePool();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

verifyLogin();
