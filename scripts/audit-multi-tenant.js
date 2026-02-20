/**
 * Multi-Tenant Database Audit Script
 * Verifies all tables have proper clinic_id foreign keys and indexes
 */

const db = require('../src/config/database');

const TABLES_REQUIRING_CLINIC_ID = [
    'auth_users',
    'patients',
    'appointments',
    'visits',
    'visit_notes',
    'visit_diagnoses',
    'visit_vital_signs',
    'visit_attachments',
    'patient_allergies',
    'patient_medications',
    'patient_medical_history',
    'services',
    'billings',
    'billing_items',
    'payments',
    'lab_tests',
    'lab_requests',
    'lab_results',
    'audit_logs'
];

async function auditMultiTenantCompliance() {
    console.log('🔍 Starting Multi-Tenant Database Audit...\n');

    const issues = [];

    for (const table of TABLES_REQUIRING_CLINIC_ID) {
        try {
            // Check if table exists
            const [tables] = await db.query(`SHOW TABLES LIKE '${table}'`);
            if (tables.length === 0) {
                console.log(`⚠️  Table '${table}' does not exist (may not be implemented yet)`);
                continue;
            }

            // Check if clinic_id column exists
            const [columns] = await db.query(`SHOW COLUMNS FROM ${table} LIKE 'clinic_id'`);
            if (columns.length === 0) {
                issues.push(`❌ Table '${table}' is MISSING clinic_id column`);
                continue;
            }

            // Check if clinic_id has an index
            const [indexes] = await db.query(`SHOW INDEX FROM ${table} WHERE Column_name = 'clinic_id'`);
            if (indexes.length === 0) {
                issues.push(`⚠️  Table '${table}' has clinic_id but NO INDEX (performance issue)`);
            } else {
                console.log(`✅ Table '${table}' has clinic_id with index`);
            }

            // Check for foreign key constraint
            const [fks] = await db.query(`
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = '${table}' 
                AND COLUMN_NAME = 'clinic_id' 
                AND REFERENCED_TABLE_NAME = 'clinics'
            `);
            
            if (fks.length === 0) {
                issues.push(`⚠️  Table '${table}' clinic_id has NO FOREIGN KEY to clinics table`);
            }

        } catch (error) {
            issues.push(`❌ Error checking table '${table}': ${error.message}`);
        }
    }

    console.log('\n📊 Audit Summary:\n');
    
    if (issues.length === 0) {
        console.log('✅ All tables are properly configured for multi-tenancy!');
    } else {
        console.log('⚠️  Issues found:\n');
        issues.forEach(issue => console.log(issue));
    }

    await db.end();
}

// Run audit
auditMultiTenantCompliance().catch(console.error);
