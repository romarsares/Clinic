const db = require('./src/config/database');

async function test() {
    console.log('Testing connection...');
    try {
        const connected = await db.testConnection();
        console.log('Connected:', connected);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
