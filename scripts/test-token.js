/**
 * Test JWT Token Decoding
 * Paste your token from browser localStorage to test
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.log('\nUsage: node scripts/test-token.js YOUR_TOKEN_HERE\n');
  console.log('To get your token:');
  console.log('1. Open browser console (F12)');
  console.log('2. Run: localStorage.getItem("clinic_token")');
  console.log('3. Copy the token and run this script\n');
  process.exit(1);
}

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('\n✓ Token is valid!\n');
  console.log('Decoded payload:');
  console.log(JSON.stringify(decoded, null, 2));
  console.log('');
} catch (error) {
  console.log('\n✗ Token verification failed:', error.message, '\n');
}
