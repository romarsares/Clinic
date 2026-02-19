const Patient = require('./src/models/Patient');
const db = require('./src/config/database');

async function debug() {
    const patient = new Patient(db);
    
    try {
        console.log('\n=== Testing listByClinic ===');
        const result = await patient.listByClinic(1, { page: 1, limit: 5 });
        console.log('Success:', result.patients.length, 'patients found');
        
        console.log('\n=== Testing search ===');
        const searchResult = await patient.search(1, 'Test', { limit: 5 });
        console.log('Success:', searchResult.length, 'patients found');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.closePool();
    }
}

debug();
