const db = require('../src/config/database');

async function setupClinic999() {
    try {
        await db.testConnection();
        
        // Check if clinic 999 exists
        const [clinics] = await db.executeQuery('SELECT * FROM clinics WHERE id = 999');
        
        if (clinics.length === 0) {
            console.log('❌ Clinic 999 not found. Creating...');
            await db.executeQuery(`
                INSERT INTO clinics (id, name, email, contact_number, address, timezone, status)
                VALUES (999, 'Test Clinic', 'test@clinic.com', '1234567890', 'Test Address', 'Asia/Manila', 'active')
            `);
            console.log('✅ Clinic 999 created');
        } else {
            console.log('✅ Clinic 999 exists:', clinics[0].name);
        }
        
        await db.closePool();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setupClinic999();
