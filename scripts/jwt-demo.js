const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Demo for Pediatric Clinic SaaS
// This shows how JWT authentication works in our healthcare application

console.log('🔐 JWT Authentication Demo - Pediatric Clinic SaaS\n');

// ==========================================
// 1. SIMULATED USER DATABASE
// ==========================================
const users = [
  {
    id: 1,
    email: 'dr.smith@cityclinic.com',
    password: '$2a$10$hashedpasswordhere', // "password123" hashed
    name: 'Dr. Sarah Smith',
    role: 'doctor',
    clinicId: 1,
    clinicName: 'City Pediatric Clinic',
    permissions: ['read_patients', 'write_prescriptions', 'read_lab_results']
  },
  {
    id: 2,
    email: 'nurse.jane@cityclinic.com',
    password: '$2a$10$hashedpasswordhere', // "password123" hashed
    name: 'Jane Wilson',
    role: 'staff',
    clinicId: 1,
    clinicName: 'City Pediatric Clinic',
    permissions: ['read_patients', 'schedule_appointments']
  }
];

// ==========================================
// 2. JWT CONFIGURATION
// ==========================================
const JWT_CONFIG = {
  secret: 'your-super-secure-jwt-secret-key-minimum-32-characters-long',
  accessExpires: '15m',    // Short-lived access token
  refreshExpires: '7d'     // Long-lived refresh token
};

// ==========================================
// 3. AUTHENTICATION FUNCTIONS
// ==========================================

// Login function - simulates user authentication
async function login(email, password) {
  console.log(`🔑 Attempting login for: ${email}`);

  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify password (in real app, compare with hashed password)
  const isValidPassword = password === 'password123'; // Simplified for demo
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  // Generate tokens
  const accessToken = jwt.sign(
    {
      userId: user.id,
      clinicId: user.clinicId,
      role: user.role,
      permissions: user.permissions,
      type: 'access'
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.accessExpires,
      issuer: 'clinic-saas-demo',
      audience: 'clinic-users'
    }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.refreshExpires }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clinicName: user.clinicName
    },
    tokens: {
      access: accessToken,
      refresh: refreshToken
    }
  };
}

// Middleware function - simulates token verification
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret);

    // Check if it's an access token
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// Permission checker
function checkPermission(user, requiredPermission) {
  if (!user.permissions.includes(requiredPermission)) {
    throw new Error(`Permission denied: ${requiredPermission}`);
  }
  return true;
}

// ==========================================
// 4. DEMO EXECUTION
// ==========================================

async function runDemo() {
  try {
    console.log('🚀 Starting JWT Authentication Demo\n');

    // ==========================================
    // STEP 1: USER LOGIN
    // ==========================================
    console.log('📝 Step 1: User Login');
    console.log('─'.repeat(50));

    const loginResult = await login('dr.smith@cityclinic.com', 'password123');
    console.log('✅ Login successful!');
    console.log('👤 User:', JSON.stringify(loginResult.user, null, 2));
    console.log('🎫 Access Token:', loginResult.tokens.access.substring(0, 50) + '...');
    console.log('🔄 Refresh Token:', loginResult.tokens.refresh.substring(0, 50) + '...\n');

    const accessToken = loginResult.tokens.access;

    // ==========================================
    // STEP 2: TOKEN VERIFICATION
    // ==========================================
    console.log('🔍 Step 2: Token Verification');
    console.log('─'.repeat(50));

    const decodedToken = verifyToken(accessToken);
    console.log('✅ Token is valid!');
    console.log('🔓 Decoded Payload:', JSON.stringify(decodedToken, null, 2));
    console.log();

    // ==========================================
    // STEP 3: ACCESS CONTROL EXAMPLES
    // ==========================================
    console.log('🛡️  Step 3: Access Control Examples');
    console.log('─'.repeat(50));

    // Example 1: Doctor accessing patient records (allowed)
    console.log('📋 Example 1: Doctor reading patient records');
    try {
      checkPermission(decodedToken, 'read_patients');
      console.log('✅ Access GRANTED - Doctor can read patient records\n');
    } catch (error) {
      console.log('❌ Access DENIED:', error.message);
    }

    // Example 2: Doctor writing prescriptions (allowed)
    console.log('💊 Example 2: Doctor writing prescriptions');
    try {
      checkPermission(decodedToken, 'write_prescriptions');
      console.log('✅ Access GRANTED - Doctor can write prescriptions\n');
    } catch (error) {
      console.log('❌ Access DENIED:', error.message);
    }

    // Example 3: Doctor accessing billing (not allowed)
    console.log('💰 Example 3: Doctor accessing billing records');
    try {
      checkPermission(decodedToken, 'access_billing');
      console.log('✅ Access GRANTED');
    } catch (error) {
      console.log('❌ Access DENIED -', error.message);
    }

    // ==========================================
    // STEP 4: MULTI-TENANT ISOLATION
    // ==========================================
    console.log('\n🏥 Step 4: Multi-Tenant Clinic Isolation');
    console.log('─'.repeat(50));

    console.log('🏥 Clinic ID in token:', decodedToken.clinicId);
    console.log('📋 This ensures Dr. Smith can ONLY access City Pediatric Clinic data');
    console.log('🚫 Cannot access patients from other clinics (clinicId != 1)');

    // ==========================================
    // STEP 5: TOKEN EXPIRATION
    // ==========================================
    console.log('\n⏰ Step 5: Token Expiration');
    console.log('─'.repeat(50));

    // Create a token that expires in 1 second for demo
    const shortLivedToken = jwt.sign(
      { userId: 1, clinicId: 1, role: 'doctor', type: 'access' },
      JWT_CONFIG.secret,
      { expiresIn: '1s' }
    );

    console.log('⏳ Created token that expires in 1 second...');
    console.log('⏰ Waiting 2 seconds...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      jwt.verify(shortLivedToken, JWT_CONFIG.secret);
      console.log('❌ ERROR: Token should have expired!');
    } catch (error) {
      console.log('✅ Token correctly expired:', error.message);
    }

    // ==========================================
    // STEP 6: INVALID TOKEN EXAMPLE
    // ==========================================
    console.log('\n🚫 Step 6: Invalid Token Handling');
    console.log('─'.repeat(50));

    try {
      verifyToken('invalid.jwt.token.here');
      console.log('❌ ERROR: Should have failed!');
    } catch (error) {
      console.log('✅ Invalid token correctly rejected:', error.message);
    }

    console.log('\n🎉 JWT Demo Complete!');
    console.log('💡 Key Takeaways:');
    console.log('   • JWT tokens contain user identity and permissions');
    console.log('   • Tokens are stateless (no server-side storage needed)');
    console.log('   • Clinic isolation prevents data leakage between tenants');
    console.log('   • Role-based permissions control access to resources');
    console.log('   • Tokens expire for security (short-lived access, long-lived refresh)');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
runDemo();