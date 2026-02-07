/**
 * Test Diagnostic Tool
 * Checks test environment configuration
 */

const db = require('./src/config/database');
require('dotenv').config({ path: '.env.test' });

async function diagnose() {
    console.log('🔍 CuraOne Test Diagnostic\n');
    console.log('='.repeat(50));
    
    // Check environment
    console.log('\n📋 Environment Configuration:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   DB_USER: ${process.env.DB_USER}`);
    console.log(`   PORT: ${process.env.PORT}`);
    
    // Check database connection
    console.log('\n🔌 Database Connection:');
    try {
        const connected = await db.testConnection();
        if (connected) {
            console.log('   ✅ Database connected successfully');
            
            // Check tables
            const [tables] = await db.executeQuery('SHOW TABLES');
            console.log(`   ✅ Found ${tables.length} tables`);
            
            // Check critical tables
            const criticalTables = ['auth_users', 'clinics', 'patients', 'appointments'];
            for (const table of criticalTables) {
                const exists = tables.some(t => Object.values(t)[0] === table);
                console.log(`   ${exists ? '✅' : '❌'} Table: ${table}`);
            }
        } else {
            console.log('   ❌ Database connection failed');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Check test user
    console.log('\n👤 Test Users:');
    try {
        const [users] = await db.executeQuery('SELECT id, email, full_name FROM auth_users LIMIT 5');
        if (users.length > 0) {
            console.log(`   ✅ Found ${users.length} users`);
            users.forEach(u => console.log(`      - ${u.email} (${u.full_name})`));
        } else {
            console.log('   ⚠️  No users found - run setup script');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n💡 Next Steps:');
    console.log('   1. If database connection failed: Check MySQL service');
    console.log('   2. If tables missing: Run scripts/init-database.sql');
    console.log('   3. If users missing: Run scripts/setup-admin-complete.js');
    console.log('   4. Then run: npm test -- tests/smoke.test.js\n');
    
    await db.closePool();
    process.exit(0);
}

diagnose().catch(console.error);
