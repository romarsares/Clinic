const db = require('./src/config/database');
require('dotenv').config({ path: '.env.test' });

async function inspect() {
    try {
        const [users] = await db.execute('SELECT id, clinic_id, email, status FROM auth_users');
        console.log('--- Users ---');
        console.table(users);

        const [roles] = await db.execute('SELECT id, clinic_id, name FROM roles');
        console.log('--- Roles ---');
        console.table(roles);

        const [userRoles] = await db.execute('SELECT user_id, role_id FROM user_roles');
        console.log('--- User Roles ---');
        console.table(userRoles);

        const [clinics] = await db.execute('SELECT id, name FROM clinics');
        console.log('--- Clinics ---');
        console.table(clinics);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
