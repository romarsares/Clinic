const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function setupAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'N1mbu$12354',
            database: 'clinic_saas'
        });

        // Generate proper password hash
        const password = 'admin12354';
        const hash = await bcrypt.hash(password, 10);
        
        console.log('🔑 Generated hash:', hash);

        // Delete existing admin user
        await connection.execute('DELETE FROM user_roles WHERE user_id = 1');
        await connection.execute('DELETE FROM auth_users WHERE email = ?', ['admin@clinic.com']);

        // Insert admin user with correct hash
        const [result] = await connection.execute(`
            INSERT INTO auth_users (id, clinic_id, email, password_hash, full_name, status, created_at) 
            VALUES (1, 1, ?, ?, 'System Administrator', 'active', NOW())
        `, ['admin@clinic.com', hash]);

        console.log('✅ Admin user created with ID:', result.insertId || 1);

        // Assign Owner role
        await connection.execute(`
            INSERT INTO user_roles (user_id, role_id, created_at) 
            VALUES (1, 1, NOW())
        `);

        console.log('✅ Owner role assigned');

        // Verify the user
        const [users] = await connection.execute(`
            SELECT u.*, GROUP_CONCAT(r.name) as roles
            FROM auth_users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.email = ?
            GROUP BY u.id
        `, ['admin@clinic.com']);

        console.log('👤 User verification:', users[0]);

        await connection.end();
        
        console.log('\n🎉 Admin user setup complete!');
        console.log('📧 Email: admin@clinic.com');
        console.log('🔑 Password: admin12354');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

setupAdmin();