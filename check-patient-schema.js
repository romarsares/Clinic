const db = require('./src/config/database');

async function checkSchema() {
    try {
        const [columns] = await db.execute('SHOW COLUMNS FROM patients');
        console.log('\n=== PATIENTS TABLE SCHEMA ===\n');
        columns.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });
        
        const [tables] = await db.execute("SHOW TABLES LIKE 'patient%'");
        console.log('\n=== PATIENT-RELATED TABLES ===\n');
        tables.forEach(t => console.log(Object.values(t)[0]));
        
        await db.closePool();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkSchema();
