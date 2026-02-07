const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function setupSuperAdmin() {
    try {
        await db.testConnection();
        
        // Create system clinic (clinic_id = 0)
        const [existingClinic] = await db.executeQuery(
            'SELECT id FROM clinics WHERE id = 0'
        );
        
        if (existingClinic.length === 0) {
            await db.executeQuery(`
                INSERT INTO clinics (id, name, email, contact_number, address, timezone)
                VALUES (0, 'System', 'system-admin@clinic.com', '000', 'System', 'UTC')
            `);
            console.log('✅ System clinic created');
        } else {
            console.log('✅ System clinic already exists');
        }
        
        // Create SuperAdmin role for system clinic
        const [existingRole] = await db.executeQuery(
            'SELECT id FROM roles WHERE name = ? AND clinic_id = 0',
            ['SuperAdmin']
        );
        
        let roleId;
        if (existingRole.length > 0) {
            roleId = existingRole[0].id;
            console.log('✅ SuperAdmin role already exists');
        } else {
            const [result] = await db.executeQuery(`
                INSERT INTO roles (clinic_id, name, description)
                VALUES (0, 'SuperAdmin', 'System Administrator')
            `);
            roleId = result.insertId;
            console.log('✅ SuperAdmin role created');
        }
        
        // Create SuperAdmin user
        const password = 'TestPass123!';
        const passwordHash = await bcrypt.hash(password, 12);
        
        await db.executeQuery(`
            INSERT IGNORE INTO auth_users (clinic_id, email, password_hash, full_name, status)
            VALUES (0, 'superadmin@test.com', ?, 'Super Administrator', 'active')
        `, [passwordHash]);
        
        // Get user ID
        const [userRows] = await db.executeQuery(
            'SELECT id FROM auth_users WHERE email = ?',
            ['superadmin@test.com']
        );
        
        if (userRows.length > 0) {
            const userId = userRows[0].id;
            
            // Assign SuperAdmin role
            await db.executeQuery(`
                INSERT IGNORE INTO user_roles (user_id, role_id)
                VALUES (?, ?)
            `, [userId, roleId]);
            
            console.log('✅ SuperAdmin user created successfully!');
            console.log('   Email: superadmin@test.com');
            console.log('   Password: TestPass123!');
            console.log('   Clinic ID: 0 (System)');
        }
        
        await db.closePool();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setupSuperAdmin();
