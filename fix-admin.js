const db = require('./src/config/database');

async function checkAndFixAdmin() {
    try {
        // Check admin@clinic.com specifically
        const [users] = await db.execute(`
            SELECT u.id, u.email, u.full_name, u.clinic_id, u.status,
                   GROUP_CONCAT(r.name) as roles
            FROM auth_users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.email = 'admin@clinic.com'
            GROUP BY u.id
        `);

        if (users.length === 0) {
            console.log('❌ admin@clinic.com not found');
            return;
        }

        const user = users[0];
        console.log('\n📋 Current admin@clinic.com status:');
        console.log('ID:', user.id);
        console.log('Email:', user.email);
        console.log('Clinic ID:', user.clinic_id);
        console.log('Status:', user.status);
        console.log('Roles:', user.roles || 'None');

        // Fix clinic_id if it's wrong
        if (user.clinic_id !== 1) {
            console.log('\n🔧 Fixing clinic_id...');
            await db.execute(
                'UPDATE auth_users SET clinic_id = 1 WHERE id = ?',
                [user.id]
            );
            console.log('✓ Updated clinic_id to 1');
        }

        // Check if user has Super User role
        if (!user.roles || !user.roles.includes('Super User')) {
            console.log('\n🔧 Adding Super User role...');
            
            // Get Super User role for clinic 1
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = "Super User" AND clinic_id = 1'
            );

            if (roles.length > 0) {
                // Remove existing roles
                await db.execute('DELETE FROM user_roles WHERE user_id = ?', [user.id]);
                
                // Add Super User role
                await db.execute(
                    'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
                    [user.id, roles[0].id]
                );
                console.log('✓ Added Super User role');
            }
        }

        console.log('\n✅ admin@clinic.com is ready!');
        console.log('\n🔑 Login with:');
        console.log('Email: admin@clinic.com');
        console.log('Password: Admin@123');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.closePool();
    }
}

checkAndFixAdmin();
