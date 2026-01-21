/**
 * Setup Permission System Database
 * Run this script to create the user_permissions table and default permissions
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupPermissionSystem() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'N1mbu$12354',
            database: process.env.DB_NAME || 'clinic_saas'
        });

        console.log('🔗 Connected to database');

        // Create user_permissions table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS user_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                clinic_id INT NOT NULL,
                permission_key VARCHAR(100) NOT NULL,
                granted_by INT NOT NULL,
                granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
                FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
                FOREIGN KEY (granted_by) REFERENCES auth_users(id),
                
                UNIQUE KEY unique_user_permission (user_id, clinic_id, permission_key),
                INDEX idx_user_clinic (user_id, clinic_id),
                INDEX idx_permission_key (permission_key)
            )
        `);

        console.log('✅ Created user_permissions table');

        // Insert default permissions for Super Users and Owners
        await connection.execute(`
            INSERT IGNORE INTO user_permissions (user_id, clinic_id, permission_key, granted_by)
            SELECT 
                u.id,
                u.clinic_id,
                p.permission_key,
                u.id
            FROM auth_users u
            CROSS JOIN (
                SELECT 'patient.add' as permission_key
                UNION SELECT 'patient.edit'
                UNION SELECT 'patient.view'
                UNION SELECT 'patient.delete'
                UNION SELECT 'appointment.create'
                UNION SELECT 'appointment.edit'
                UNION SELECT 'appointment.view'
                UNION SELECT 'appointment.cancel'
                UNION SELECT 'billing.create'
                UNION SELECT 'billing.edit'
                UNION SELECT 'billing.view'
                UNION SELECT 'billing.payment'
                UNION SELECT 'clinical.visit.create'
                UNION SELECT 'clinical.visit.edit'
                UNION SELECT 'clinical.visit.view'
                UNION SELECT 'clinical.lab.order'
                UNION SELECT 'lab.request.create'
                UNION SELECT 'lab.result.enter'
                UNION SELECT 'lab.result.view'
                UNION SELECT 'lab.dashboard'
                UNION SELECT 'reports.clinical'
                UNION SELECT 'reports.financial'
                UNION SELECT 'reports.patient'
                UNION SELECT 'reports.export'
                UNION SELECT 'admin.users'
                UNION SELECT 'admin.permissions'
                UNION SELECT 'admin.settings'
                UNION SELECT 'admin.audit'
            ) p
            WHERE JSON_CONTAINS(u.roles, '"Super User"') OR JSON_CONTAINS(u.roles, '"Owner"')
        `);

        console.log('✅ Added default permissions for Super Users and Owners');

        // Give Owners the admin.permissions by default
        await connection.execute(`
            INSERT IGNORE INTO user_permissions (user_id, clinic_id, permission_key, granted_by)
            SELECT 
                u.id,
                u.clinic_id,
                'admin.permissions',
                u.id
            FROM auth_users u
            WHERE JSON_CONTAINS(u.roles, '"Owner"')
        `);

        console.log('✅ Added admin.permissions for Owners');

        // Check results
        const [results] = await connection.execute(`
            SELECT 
                u.full_name,
                u.roles,
                COUNT(up.permission_key) as permission_count
            FROM auth_users u
            LEFT JOIN user_permissions up ON u.id = up.user_id
            GROUP BY u.id
            ORDER BY u.full_name
        `);

        console.log('\n📊 Permission Summary:');
        results.forEach(user => {
            const roles = JSON.parse(user.roles || '[]');
            console.log(`${user.full_name} (${roles.join(', ')}): ${user.permission_count} permissions`);
        });

        console.log('\n🎉 Permission system setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Access /permissions to manage user permissions');
        console.log('2. Grant specific permissions to users as needed');
        console.log('3. Test permission-based access control');

    } catch (error) {
        console.error('❌ Error setting up permission system:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run setup
setupPermissionSystem();