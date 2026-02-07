/**
 * Create Test Users for Auth Tests
 * Run this before running auth-rbac tests
 */

const bcrypt = require('bcrypt');
const db = require('../src/config/database');

async function createTestUsers() {
    console.log('🔧 Creating test users for auth tests...\n');

    try {
        // Hash password once for all users
        const password = 'TestPass123!';
        const passwordHash = await bcrypt.hash(password, 12);
        console.log('✅ Password hashed');

        // Create test users with different roles
        const users = [
            { email: 'owner@test.com', name: 'Test Owner', role: 'Owner' },
            { email: 'doctor@test.com', name: 'Test Doctor', role: 'Doctor' },
            { email: 'staff@test.com', name: 'Test Staff', role: 'Staff' },
            { email: 'labtech@test.com', name: 'Test Lab Tech', role: 'Lab Technician' },
            { email: 'admin@test.com', name: 'Test Admin', role: 'Owner' },
            { email: 'parent@test.com', name: 'Test Parent', role: 'Parent' }
        ];

        for (const user of users) {
            // Insert user
            await db.executeQuery(`
                INSERT IGNORE INTO auth_users (clinic_id, email, password_hash, full_name, status)
                VALUES (999, ?, ?, ?, 'active')
            `, [user.email, passwordHash, user.name]);

            // Get user ID
            const [userRows] = await db.executeQuery(
                'SELECT id FROM auth_users WHERE email = ?',
                [user.email]
            );

            if (userRows.length > 0) {
                const userId = userRows[0].id;

                // Get role ID for clinic 999
                const [roleRows] = await db.executeQuery(
                    'SELECT id FROM roles WHERE name = ? AND clinic_id = 999',
                    [user.role]
                );

                if (roleRows.length > 0) {
                    const roleId = roleRows[0].id;

                    // Assign role
                    await db.executeQuery(`
                        INSERT IGNORE INTO user_roles (user_id, role_id)
                        VALUES (?, ?)
                    `, [userId, roleId]);

                    console.log(`✅ Created ${user.email} with ${user.role} role`);
                } else {
                    console.log(`⚠️  Role ${user.role} not found`);
                }
            }
        }

        console.log('\n✅ All test users created successfully!');
        console.log('\nTest credentials:');
        console.log('  Email: owner@test.com, doctor@test.com, staff@test.com, etc.');
        console.log('  Password: TestPass123!');

    } catch (error) {
        console.error('❌ Error creating test users:', error.message);
        throw error;
    } finally {
        await db.closePool();
    }
}

// Run if called directly
if (require.main === module) {
    createTestUsers().catch(console.error);
}

module.exports = { createTestUsers };
