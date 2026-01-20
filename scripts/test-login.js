const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function testLogin() {
    try {
        // Connect to database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'N1mbu$12354',
            database: 'clinic_saas'
        });

        console.log('✅ Database connected');

        // Check if user exists
        const [users] = await connection.execute(
            'SELECT id, email, password_hash, full_name FROM auth_users WHERE email = ?',
            ['admin@clinic.com']
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            
            // Create user with correct hash
            const password = 'admin12354';
            const hash = await bcrypt.hash(password, 10);
            
            await connection.execute(`
                INSERT INTO auth_users (clinic_id, email, password_hash, first_name, last_name, full_name, status)
                VALUES (1, 'admin@clinic.com', ?, 'Admin', 'User', 'Admin User', 'active')
            `, [hash]);
            
            console.log('✅ Admin user created with hash:', hash);
        } else {
            const user = users[0];
            console.log('✅ User found:', user.email);
            
            // Test password
            const isValid = await bcrypt.compare('admin12354', user.password_hash);
            console.log('Password valid:', isValid);
            
            if (!isValid) {
                // Update with correct hash
                const newHash = await bcrypt.hash('admin12354', 10);
                await connection.execute(
                    'UPDATE auth_users SET password_hash = ? WHERE email = ?',
                    [newHash, 'admin@clinic.com']
                );
                console.log('✅ Password updated with new hash:', newHash);
            }
        }

        await connection.end();
        console.log('✅ Test completed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testLogin();