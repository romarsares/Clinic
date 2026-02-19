const db = require('./src/config/database');

async function fixUserClinic() {
    try {
        // Check users without clinic_id
        const [usersWithoutClinic] = await db.execute(`
            SELECT u.id, u.email, u.full_name, u.clinic_id, GROUP_CONCAT(r.name) as roles
            FROM auth_users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.status = 'active'
            GROUP BY u.id
        `);

        console.log('\n=== ALL ACTIVE USERS ===\n');
        usersWithoutClinic.forEach(user => {
            console.log(`ID: ${user.id}, Email: ${user.email}, Clinic: ${user.clinic_id || 'NULL'}, Roles: ${user.roles || 'None'}`);
        });

        // Get first clinic
        const [clinics] = await db.execute('SELECT id, name FROM clinics LIMIT 1');
        if (clinics.length === 0) {
            console.log('\n❌ No clinics found in database');
            return;
        }

        const defaultClinic = clinics[0];
        console.log(`\n📍 Default Clinic: ${defaultClinic.name} (ID: ${defaultClinic.id})`);

        // Fix users without clinic (except SuperAdmin)
        const usersToFix = usersWithoutClinic.filter(u => 
            !u.clinic_id && (!u.roles || !u.roles.includes('SuperAdmin'))
        );

        if (usersToFix.length === 0) {
            console.log('\n✅ All users have clinic associations');
            return;
        }

        console.log(`\n🔧 Fixing ${usersToFix.length} users...`);
        
        for (const user of usersToFix) {
            await db.execute(
                'UPDATE auth_users SET clinic_id = ? WHERE id = ?',
                [defaultClinic.id, user.id]
            );
            console.log(`✓ Fixed: ${user.email} -> Clinic ${defaultClinic.id}`);
        }

        console.log('\n✅ All users fixed!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.closePool();
    }
}

fixUserClinic();
