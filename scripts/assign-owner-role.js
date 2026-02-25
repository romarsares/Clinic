const db = require('../src/config/database');

async function assignOwnerRole() {
    try {
        // Get admin user
        const [users] = await db.execute(
            "SELECT id, email, clinic_id FROM auth_users WHERE email = 'admin@clinic.com'"
        );

        if (users.length === 0) {
            console.log('❌ User admin@clinic.com not found');
            process.exit(1);
        }

        const user = users[0];
        console.log(`✓ Found user: ${user.email} (ID: ${user.id}, Clinic: ${user.clinic_id})`);

        // Get Owner role for this clinic
        const [roles] = await db.execute(
            "SELECT id, name FROM roles WHERE name = 'Owner' AND clinic_id = ?",
            [user.clinic_id]
        );

        if (roles.length === 0) {
            console.log('❌ Owner role not found for this clinic');
            process.exit(1);
        }

        const role = roles[0];
        console.log(`✓ Found role: ${role.name} (ID: ${role.id})`);

        // Check if already assigned
        const [existing] = await db.execute(
            'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
            [user.id, role.id]
        );

        if (existing.length > 0) {
            console.log('✓ Role already assigned!');
        } else {
            // Assign role
            await db.execute(
                'INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())',
                [user.id, role.id]
            );
            console.log('✅ Owner role assigned successfully!');
        }

        // Verify
        const [verify] = await db.execute(`
            SELECT u.email, r.name as role_name
            FROM auth_users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE u.email = 'admin@clinic.com'
        `);

        console.log('\n📋 Current roles for admin@clinic.com:');
        verify.forEach(row => {
            console.log(`   - ${row.role_name}`);
        });

        await db.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await db.end();
        process.exit(1);
    }
}

assignOwnerRole();
