const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'admin12354';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password hash for admin12354:');
    console.log(hash);
    
    console.log('\nRun this SQL:');
    console.log(`UPDATE auth_users SET password_hash = '${hash}' WHERE email = 'admin@clinic.com';`);
}

generateHash();