const db = require('../src/config/database');

async function grantPermissions() {
    try {
        // Create permission if not exists
        await db.execute(`
            INSERT IGNORE INTO permissions (name, display_name, description, category, created_at)
            VALUES ('admin.users', 'Manage Users', 'Create, update, and delete users', 'admin', NOW())
        `);
        console.log('✓ Permission created/verified');

        // Get permission ID
        const [perms] = await db.execute("SELECT id FROM permissions WHERE name = 'admin.users'");
        const permId = perms[0].id;

        // Assign to all Owner roles
        const [result] = await db.execute(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at)
            SELECT r.id, ?, NOW()
            FROM roles r
            WHERE r.name = 'Owner'
        `, [permId]);

        console.log(`✅ Permission granted to ${result.affectedRows} Owner role(s)`);

        // Verify
        const [verify] = await db.execute(`
            SELECT r.name, r.clinic_id, p.name as permission
            FROM roles r
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE r.name = 'Owner' AND p.name = 'admin.users'
        `);

        console.log('\n📋 Verified permissions:');
        verify.forEach(row => {
            console.log(`   Clinic ${row.clinic_id}: ${row.name} has ${row.permission}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

grantPermissions();
