/**
 * Test API Endpoint
 * 
 * Tests the patients endpoint with your current token
 * Usage: node scripts/test-api.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function testAPI() {
  try {
    console.log('\n=== API Endpoint Test ===\n');
    
    const token = await question('Paste your JWT token (from browser localStorage): ');
    
    console.log('\nTesting GET /api/v1/patients...\n');
    
    const response = await fetch('http://localhost:3000/api/v1/patients?limit=50', {
      headers: {
        'Authorization': `Bearer ${token.trim()}`
      }
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.log('\n❌ Request failed!');
      console.log('\nPossible issues:');
      console.log('1. Token expired - log out and log back in');
      console.log('2. Missing permissions - run: node scripts/simple-setup.js');
      console.log('3. No clinic_id in token - clear localStorage and login again');
    } else {
      console.log('\n✓ Request successful!');
    }

  } catch (error) {
    console.error('\n✗ Error:', error.message);
  } finally {
    rl.close();
  }
}

testAPI();
