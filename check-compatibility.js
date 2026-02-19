const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCompatibility() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('\n=== PERMISSION SYSTEM COMPATIBILITY CHECK ===\n');

    // Check if user_permissions table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'user_permissions'");
    
    if (tables.length > 0) {
        console.log('✅ user_permissions table EXISTS\n');
        
        // Check structure
        const [columns] = await connection.execute("DESCRIBE user_permissions");
        console.log('📋 Current Structure:');
        console.table(columns);
        
        // Check data
        const [perms] = await connection.execute("SELECT * FROM user_permissions LIMIT 10");
        console.log('\n📊 Sample Data:', perms.length, 'records');
        if (perms.length > 0) {
            console.table(perms);
        }
    } else {
        console.log('❌ user_permissions table DOES NOT EXIST\n');
    }

    // Check existing roles table
    console.log('\n=== EXISTING ROLES SYSTEM ===\n');
    const [roles] = await connection.execute("SELECT * FROM roles WHERE clinic_id = 1");
    console.log('📋 Roles:');
    console.table(roles);

    // Check user_roles
    console.log('\n=== USER ROLE ASSIGNMENTS ===\n');
    const [userRoles] = await connection.execute(`
        SELECT ur.*, u.email, r.name as role_name
        FROM user_roles ur
        JOIN auth_users u ON ur.user_id = u.id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.clinic_id = 1
        LIMIT 10
    `);
    console.table(userRoles);

    // Check permissions table
    const [permTables] = await connection.execute("SHOW TABLES LIKE 'permissions'");
    if (permTables.length > 0) {
        console.log('\n=== EXISTING PERMISSIONS TABLE ===\n');
        const [permissions] = await connection.execute("SELECT * FROM permissions LIMIT 20");
        console.table(permissions);
    }

    // Check role_permissions
    const [rolePermTables] = await connection.execute("SHOW TABLES LIKE 'role_permissions'");
    if (rolePermTables.length > 0) {
        console.log('\n=== ROLE PERMISSIONS MAPPING ===\n');
        const [rolePerms] = await connection.execute("SELECT * FROM role_permissions LIMIT 20");
        console.table(rolePerms);
    }

    console.log('\n=== COMPATIBILITY ANALYSIS ===\n');
    
    const hasUserPermissions = tables.length > 0;
    const hasRoles = roles.length > 0;
    const hasPermissions = permTables.length > 0;
    const hasRolePermissions = rolePermTables.length > 0;

    console.log('Current System:');
    console.log('  - Roles table:', hasRoles ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - Permissions table:', hasPermissions ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - Role_permissions table:', hasRolePermissions ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - User_permissions table:', hasUserPermissions ? '✅ EXISTS' : '❌ MISSING');

    console.log('\nYour Plan Requirements:');
    console.log('  - Granular user permissions: user_permissions table');
    console.log('  - Permission keys: patient.add, appointment.create, etc.');
    console.log('  - Audit trail: granted_by, granted_at columns');

    if (hasRoles && hasPermissions && hasRolePermissions) {
        console.log('\n⚠️  COMPATIBILITY ISSUE DETECTED:');
        console.log('You have a ROLE-BASED system (roles → permissions)');
        console.log('Your plan wants USER-BASED system (users → permissions directly)');
        console.log('\nOptions:');
        console.log('1. REPLACE: Drop role-based, use user-based only');
        console.log('2. HYBRID: Keep roles as templates, override per user');
        console.log('3. MIGRATE: Convert role permissions to user permissions');
    } else if (hasUserPermissions) {
        console.log('\n✅ COMPATIBLE: user_permissions table exists');
        console.log('Need to verify column structure matches your plan');
    } else {
        console.log('\n✅ CLEAN SLATE: No permission system exists');
        console.log('Can implement your plan from scratch');
    }

    await connection.end();
}

checkCompatibility().catch(console.error);
