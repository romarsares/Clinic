const db = require('./src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testLogin() {
    try {
        const email = 'test.staff@clinic.com';
        const password = 'Staff@123';

        // Find user
        const [users] = await db.execute(
            'SELECT * FROM auth_users WHERE email = ? AND status = "active"',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            return;
        }

        const user = users[0];
        console.log('\n📋 User Info:');
        console.log('ID:', user.id);
        console.log('Email:', user.email);
        console.log('Clinic ID:', user.clinic_id);
        console.log('Status:', user.status);

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log('\n🔐 Password valid:', validPassword);

        if (!validPassword) {
            console.log('❌ Invalid password');
            return;
        }

        // Get roles
        const [roles] = await db.execute(`
            SELECT GROUP_CONCAT(r.name) as roles
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
        `, [user.id]);

        console.log('👤 Roles:', roles[0]?.roles || 'None');

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('\n🎫 Token generated successfully');
        console.log('Token:', token.substring(0, 50) + '...');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('\n✅ Token verified, userId:', decoded.userId);

        console.log('\n📝 To login, use:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('\nOr try these test users:');
        console.log('- test.owner@clinic.com / Owner@123');
        console.log('- test.doctor@clinic.com / Doctor@123');
        console.log('- test.staff@clinic.com / Staff@123');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.closePool();
    }
}

testLogin();
