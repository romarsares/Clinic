const jwt = require('jsonwebtoken');
const winston = require('winston');

// JWT Authentication Middleware for Pediatric Clinic SaaS
// This implements healthcare-grade authentication with multi-tenant support

// ==========================================
// CONFIGURATION
// ==========================================
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'dev_clinic_saas_2024_secure_jwt_key_a8f9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
  accessExpires: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d'
};

// Role-based permissions (expandable)
const ROLE_PERMISSIONS = {
  owner: [
    'all' // Owners can do everything
  ],
  doctor: [
    'read_patients',
    'write_patients',
    'read_appointments',
    'write_appointments',
    'read_prescriptions',
    'write_prescriptions',
    'read_lab_results',
    'write_lab_orders',
    'read_billing'
  ],
  staff: [
    'read_patients',
    'write_patients',    // ✅ Staff can add patients (registration/intake)
    'read_appointments',
    'write_appointments',
    'read_billing'
  ],
  'lab_technician': [
    'read_lab_orders',
    'write_lab_results',
    'read_patients_basic' // Limited patient info
  ],
  parent: [
    'read_own_children',
    'read_own_appointments',
    'write_own_appointments'
  ]
};

// ==========================================
// JWT UTILITY FUNCTIONS
// ==========================================

/**
 * Generate access token for authenticated user
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      clinicId: user.clinicId,
      role: user.role,
      permissions: getRolePermissions(user.role),
      type: 'access'
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.accessExpires,
      issuer: 'clinic-saas',
      audience: 'clinic-users'
    }
  );
}

/**
 * Generate refresh token for token renewal
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.refreshExpires }
  );
}

/**
 * Get permissions for a role
 */
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Please provide a valid JWT token in Authorization header'
    });
  }

  jwt.verify(token, JWT_CONFIG.secret, (err, decoded) => {
    if (err) {
      // Log security events
      winston.warn('JWT verification failed', {
        error: err.message,
        token: token.substring(0, 20) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({
        error: 'Invalid or expired token',
        message: 'Please login again to get a new token'
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      clinicId: decoded.clinicId,
      role: decoded.role,
      permissions: decoded.permissions
    };

    next();
  });
}

/**
 * Permission-based Authorization Middleware
 * Checks if user has required permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Owners can do everything
    if (req.user.permissions.includes('all')) {
      return next();
    }

    // Check specific permission
    if (!req.user.permissions.includes(permission)) {
      winston.warn('Permission denied', {
        userId: req.user.id,
        permission: permission,
        userPermissions: req.user.permissions,
        endpoint: req.path,
        method: req.method
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required permission: ${permission}`,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Clinic Isolation Middleware
 * Ensures users can only access their own clinic's data
 */
function requireClinicAccess(req, res, next) {
  const clinicId = req.params.clinicId || req.body.clinicId || req.query.clinicId;

  if (clinicId && parseInt(clinicId) !== req.user.clinicId) {
    winston.warn('Clinic access violation', {
      userId: req.user.id,
      userClinicId: req.user.clinicId,
      requestedClinicId: clinicId,
      endpoint: req.path
    });

    return res.status(403).json({
      error: 'Clinic access denied',
      message: 'You can only access data from your own clinic'
    });
  }

  next();
}

/**
 * Role-based Authorization Middleware
 * Checks if user has one of the allowed roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Role access denied',
        message: `Required roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role
      });
    }

    next();
  };
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

/**
 * Login route implementation
 * In real app, this would validate against database
 */
function createAuthRoutes(app) {

  // Mock user database (replace with real database)
  const mockUsers = [
    {
      id: 1,
      email: 'owner@clinic1.com',
      password: 'password123', // In real app: bcrypt.hashSync('password123', 10)
      name: 'Clinic Owner',
      role: 'owner',
      clinicId: 1,
      clinicName: 'City Pediatric Clinic'
    },
    {
      id: 2,
      email: 'doctor@clinic1.com',
      password: 'password123',
      name: 'Dr. Sarah Smith',
      role: 'doctor',
      clinicId: 1,
      clinicName: 'City Pediatric Clinic'
    }
  ];

  // POST /api/auth/login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Email and password are required'
        });
      }

      // Find user (in real app: database query)
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Verify password (in real app: bcrypt.compare(password, user.passwordHash))
      if (password !== user.password) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Log successful login
      winston.info('User logged in', {
        userId: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          clinicName: user.clinicName
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken,
          expiresIn: JWT_CONFIG.accessExpires
        }
      });

    } catch (error) {
      winston.error('Login error', { error: error.message, email: req.body.email });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Login failed due to server error'
      });
    }
  });

  // POST /api/auth/refresh
  app.post('/api/auth/refresh', (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          error: 'Validation error',
          message: 'Refresh token required' 
        });
      }

      const decoded = jwt.verify(refreshToken, JWT_CONFIG.secret);

      if (decoded.type !== 'refresh') {
        return res.status(403).json({ 
          error: 'Invalid token type',
          message: 'Invalid refresh token' 
        });
      }

      // In real app: validate refresh token against database
      // For demo: create new access token
      const newAccessToken = generateAccessToken({
        id: decoded.userId,
        clinicId: 1, // Would get from database
        role: 'doctor' // Would get from database
      });

      res.json({
        success: true,
        accessToken: newAccessToken,
        expiresIn: JWT_CONFIG.accessExpires
      });

    } catch (error) {
      winston.error('Token refresh error', { 
        error: error.message,
        userId: req.body?.refreshToken ? 'present' : 'missing'
      });
      
      res.status(403).json({ 
        error: 'Token verification failed',
        message: 'Invalid or expired refresh token' 
      });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', authenticateToken, (req, res) => {
    try {
      // In real app: add token to blacklist
      winston.info('User logged out', { userId: req.user.id });
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      winston.error('Logout error', { 
        error: error.message, 
        userId: req.user?.id 
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Logout failed'
      });
    }
  });

  // GET /api/auth/me - Get current user info
  app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  });
}

/**
 * Validate request origin for CSRF protection
 */
function isValidOrigin(origin) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yourdomain.com'
  ];
  return allowedOrigins.includes(origin);
}

// ==========================================
// EXAMPLE USAGE IN ROUTES
// ==========================================

/**
 * Example of how to use JWT middleware in routes
 */
function setupProtectedRoutes(app) {

  // Public routes (no auth required)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Authentication routes
  createAuthRoutes(app);

  // Protected routes (require authentication)

  // Patients - Doctors and Staff can read, Doctors can write
  app.get('/api/patients',
    authenticateToken,
    requirePermission('read_patients'),
    requireClinicAccess,
    (req, res) => {
      // Verify request origin for CSRF protection
      const origin = req.get('Origin');
      const referer = req.get('Referer');
      
      if (origin && !isValidOrigin(origin)) {
        return res.status(403).json({
          error: 'Invalid origin',
          message: 'Request from unauthorized origin'
        });
      }
      
      res.json({
        success: true,
        message: 'Patients list',
        clinicId: req.user.clinicId,
        userRole: req.user.role
      });
    }
  );

  app.post('/api/patients',
    authenticateToken,
    requirePermission('write_patients'),
    requireClinicAccess,
    (req, res) => {
      // Verify request origin for CSRF protection
      const origin = req.get('Origin');
      
      if (!origin || !isValidOrigin(origin)) {
        return res.status(403).json({
          error: 'Invalid origin',
          message: 'Request from unauthorized origin'
        });
      }
      
      res.json({
        success: true,
        message: 'Patient created',
        clinicId: req.user.clinicId
      });
    }
  );

  // Prescriptions - Only Doctors
  app.post('/api/prescriptions',
    authenticateToken,
    requireRole('doctor'),
    requireClinicAccess,
    (req, res) => {
      res.json({
        success: true,
        message: 'Prescription created by doctor',
        doctorId: req.user.id,
        clinicId: req.user.clinicId
      });
    }
  );

  // Lab Results - Lab Techs can write, Doctors can read
  app.get('/api/lab-results',
    authenticateToken,
    requirePermission('read_lab_results'),
    requireClinicAccess,
    (req, res) => {
      res.json({
        success: true,
        message: 'Lab results accessed',
        userRole: req.user.role
      });
    }
  );

  app.post('/api/lab-results',
    authenticateToken,
    requireRole('doctor', 'lab_technician'),
    requireClinicAccess,
    (req, res) => {
      res.json({
        success: true,
        message: 'Lab result recorded',
        recordedBy: req.user.id,
        role: req.user.role
      });
    }
  );
}

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  authenticateToken,
  requirePermission,
  requireRole,
  requireClinicAccess,
  generateAccessToken,
  generateRefreshToken,
  setupProtectedRoutes,
  JWT_CONFIG
};