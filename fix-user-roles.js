const db = require('./src/config/database');

async function fixUserRoles() {
    try {
        // Find users without roles
        const [usersWithoutRoles] = await db.execute(`
            SELECT u.id, u.email, u.full_name, u.clinic_id
            FROM auth_users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            WHERE u.status = 'active' AND ur.user_id IS NULL
        `);

        if (usersWithoutRoles.length === 0) {
            console.log('✅ All users have roles assigned');
            await db.closePool();
            return;
        }

        console.log(`\n🔧 Found ${usersWithoutRoles.length} users without roles:\n`);
        usersWithoutRoles.forEach(u => {
            console.log(`- ${u.email} (ID: ${u.id}, Clinic: ${u.clinic_id})`);
        });

        // Get Staff role for each clinic
        for (const user of usersWithoutRoles) {
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Staff', user.clinic_id]
            );

            if (roles.length > 0) {
                await db.execute(
                    'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
                    [user.id, roles[0].id]
                );
                console.log(`✓ Assigned Staff role to ${user.email}`);
            } else {
                console.log(`⚠ No Staff role found for clinic ${user.clinic_id}`);
            }
        }

        console.log('\n✅ Role assignment complete!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.closePool();
    }
}

fixUserRoles();
