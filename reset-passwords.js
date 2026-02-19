const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    try {
        const users = [
            { email: 'test.owner@clinic.com', password: 'Owner@123' },
            { email: 'test.doctor@clinic.com', password: 'Doctor@123' },
            { email: 'test.staff@clinic.com', password: 'Staff@123' },
            { email: 'admin@clinic.com', password: 'Admin@123' }
        ];

        console.log('\n🔧 Resetting passwords...\n');

        for (const user of users) {
            const hash = await bcrypt.hash(user.password, 10);
            const [result] = await db.execute(
                'UPDATE auth_users SET password_hash = ? WHERE email = ?',
                [hash, user.email]
            );

            if (result.affectedRows > 0) {
                console.log(`✓ ${user.email} -> ${user.password}`);
            } else {
                console.log(`⚠ ${user.email} not found`);
            }
        }

        console.log('\n✅ Password reset complete!');
        console.log('\n📝 You can now login with:');
        users.forEach(u => console.log(`   ${u.email} / ${u.password}`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.closePool();
    }
}

resetPasswords();
