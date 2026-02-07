const db = require('../src/config/database');

async function setupTestRoles() {
    try {
        await db.testConnection();
        
        // Check existing roles
        const [existingRoles] = await db.executeQuery('SELECT * FROM roles WHERE clinic_id = 999');
        console.log('\n=== Existing Roles for Clinic 999 ===');
        console.table(existingRoles);
        
        // Create roles if they don't exist
        const roles = ['Owner', 'Doctor', 'Staff', 'Lab Technician', 'Admin'];
        
        for (const roleName of roles) {
            await db.executeQuery(`
                INSERT IGNORE INTO roles (clinic_id, name, description, created_at)
                VALUES (999, ?, ?, NOW())
            `, [roleName, `Test ${roleName} role`]);
        }
        
        console.log('\n✅ Roles created/verified');
        
        // Show final roles
        const [finalRoles] = await db.executeQuery('SELECT * FROM roles WHERE clinic_id = 999');
        console.log('\n=== Final Roles for Clinic 999 ===');
        console.table(finalRoles);
        
        await db.closePool();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setupTestRoles();
