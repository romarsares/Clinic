const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    console.log('Testing direct connection...');
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'N1mbu$12354',
            database: 'clinic_saas'
        });
        console.log('Connected directly!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Direct connection failed:', error);
        process.exit(1);
    }
}

test();
