# JWT Authentication - How It Works

## 🔐 What is JWT (JSON Web Token)?

JWT is like a **digital passport** for your API. Here's the simple explanation:

### The Analogy: Airport Security
1. **Check-in Counter** = User Login (username/password)
2. **Boarding Pass** = JWT Token (contains your identity + permissions)
3. **Security Check** = API Request (server validates your boarding pass)
4. **Gate Access** = Protected Resource (you get access if boarding pass is valid)

### JWT Structure (3 Parts)
```
Header.Payload.Signature
```

**Example JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJkb2N0b3Jqb2huIiwicm9sZSI6ImRvY3RvciIsImNsaW5pY0lkIjoxLCJpYXQiOjE2NDU4MzM5MDAsImV4cCI6MTY0NTgzNzUwMH0.X7Z3Q8vB2nK8mP9qR5sT1uV4wY6zA8bC0dE2fG4hI6jK
```

**Decoded:**
- **Header**: `{"alg":"HS256","typ":"JWT"}` (algorithm + type)
- **Payload**: `{"userId":123,"username":"doctorjohn","role":"doctor","clinicId":1,"iat":1645833900,"exp":1645837500}` (your data)
- **Signature**: Server's secret signature (proves token is authentic)

## 🔄 JWT Flow in Clinic SaaS

### Step 1: User Login
```javascript
POST /api/auth/login
{
  "email": "doctor.john@clinic.com",
  "password": "securepass123"
}
```

**Server Response:**
```javascript
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 123,
    "name": "Dr. John Smith",
    "role": "doctor",
    "clinicId": 1
  },
  "expiresIn": "24h"
}
```

### Step 2: Using the Token
**Client sends token in every request:**
```javascript
GET /api/patients
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}
```

### Step 3: Server Validates Token
```javascript
// Server checks the token
const token = req.headers.authorization?.replace('Bearer ', '');
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// decoded = {
//   userId: 123,
//   username: "doctorjohn",
//   role: "doctor",
//   clinicId: 1,
//   iat: 1645833900,
//   exp: 1645837500
// }
```

## 🏥 Clinic-Specific JWT Features

### Multi-Tenant Security
```javascript
// JWT Payload includes clinic isolation
{
  "userId": 123,
  "clinicId": 1,        // ← Critical for multi-tenant
  "role": "doctor",
  "permissions": ["read_patients", "write_prescriptions"]
}
```

### Role-Based Access Control (RBAC)
```javascript
// Different roles get different permissions
const rolePermissions = {
  "owner": ["all"],
  "doctor": ["read_patients", "write_patients", "write_prescriptions", "read_lab_results"],
  "staff": ["read_patients", "write_patients", "schedule_appointments"],
  "lab_technician": ["read_lab_orders", "write_lab_results"],
  "parent": ["read_own_children", "schedule_appointments"]
};
```

## 🔧 JWT Implementation Code

### 1. Generate Token (Login)
```javascript
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      clinicId: user.clinicId,
      role: user.role,
      permissions: getRolePermissions(user.role)
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'clinic-saas',
      audience: 'clinic-users'
    }
  );
}
```

### 2. Verify Token (Middleware)
```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded; // Attach user info to request
    next();
  });
}
```

### 3. Check Permissions (Middleware)
```javascript
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Usage in routes:
app.get('/api/patients',
  authenticateToken,
  requirePermission('read_patients'),
  getPatients
);
```

## 🔐 Security Best Practices

### 1. Token Expiration
```javascript
// Short-lived access tokens (15-60 minutes)
expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'

// Long-lived refresh tokens (7-30 days)
expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'
```

### 2. Secure Storage
```javascript
// Client-side: Store in httpOnly cookies or secure localStorage
// NEVER store in regular localStorage (XSS vulnerable)

// Server-side: Use environment variables
JWT_SECRET=your-super-secure-random-key-minimum-32-characters
```

### 3. Token Blacklisting
```javascript
// For logout - add token to blacklist
const blacklistedTokens = new Set();

app.post('/auth/logout', authenticateToken, (req, res) => {
  blacklistedTokens.add(req.token);
  res.json({ message: 'Logged out successfully' });
});
```

## 🚨 Common JWT Mistakes to Avoid

### ❌ Wrong: Storing Sensitive Data
```javascript
// DON'T DO THIS
const token = jwt.sign({
  userId: 123,
  password: "secret123",  // ← Never store passwords!
  creditCard: "4111..."   // ← Never store sensitive data!
}, secret);
```

### ✅ Right: Store Only Identifiers
```javascript
const token = jwt.sign({
  userId: 123,
  clinicId: 1,
  role: "doctor"
}, secret);
```

### ❌ Wrong: No Expiration
```javascript
// DON'T DO THIS
jwt.sign(payload, secret); // Token lives forever!
```

### ✅ Right: Always Set Expiration
```javascript
jwt.sign(payload, secret, { expiresIn: '24h' });
```

## 🧪 Testing JWT

### Manual Test
```bash
# 1. Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@clinic.com","password":"password"}'

# 2. Use token in requests
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/patients
```

### Automated Test
```javascript
const jwt = require('jsonwebtoken');

describe('JWT Authentication', () => {
  test('should generate valid token', () => {
    const user = { id: 1, clinicId: 1, role: 'doctor' };
    const token = generateToken(user);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(1);
    expect(decoded.clinicId).toBe(1);
    expect(decoded.role).toBe('doctor');
  });

  test('should reject expired token', () => {
    const expiredToken = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Already expired
    );

    expect(() => {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
    }).toThrow();
  });
});
```

## 🎯 Why JWT for Healthcare SaaS?

1. **Stateless**: No server-side session storage needed
2. **Scalable**: Works across multiple servers/instances
3. **Secure**: Cryptographically signed, tamper-proof
4. **Multi-tenant**: Clinic isolation built into token
5. **Auditable**: Every request traceable to user
6. **PHI Compliant**: No sensitive data stored in token

JWT is the **industry standard** for API authentication in modern web applications, especially for multi-tenant SaaS platforms like your clinic system!