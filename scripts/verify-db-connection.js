const db = require('../src/config/database');

async function verifyConnection() {
    console.log('Testing database connection...');
    const result = await db.testConnection();
    if (result) {
        console.log('SUCCESS: Connected to database');
        process.exit(0);
    } else {
        console.error('FAILURE: Could not connect to database');
        process.exit(1);
    }
}

verifyConnection();
