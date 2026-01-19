/**
 * Authentication Middleware
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles JWT authentication and role-based access control for clinical endpoints
 * 
 * This middleware provides:
 * - JWT token verification
 * - User context extraction
 * - Role-based access control (RBAC)
 * - Multi-tenant isolation
 */

const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Authenticate JWT token and extract user context
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details with roles
    const userQuery = `
      SELECT u.id, u.clinic_id, u.email, u.full_name, u.status,
             GROUP_CONCAT(r.name) as roles
      FROM auth_users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = ? AND u.status = 'active'
      GROUP BY u.id
    `;

    const [users] = await db.execute(userQuery, [decoded.userId]);

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const user = users[0];

    // Debug log for RBAC troubleshooting
    if (process.env.NODE_ENV === 'test') {
      console.log(`[AUTH DEBUG] User: ${user.email}, Clinic: ${user.clinic_id}, Roles: ${user.roles}`);
    }

    // Add user context to request
    req.user = {
      id: user.id,
      clinic_id: user.clinic_id,
      email: user.email,
      full_name: user.full_name,
      roles: user.roles ? user.roles.split(',') : []
    };

    next();

  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Require specific roles for access
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Require specific permissions for access
 */
const requirePermission = (requiredPermissions) => {
  return async (req, res, next) => { // Ensure requiredPermissions is an array
    const permissionsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Owner role has all permissions
      if (req.user.roles.includes('Owner')) {
        return next();
      }

      // Get user permissions through roles
      const permissionQuery = `
        SELECT DISTINCT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN roles r ON rp.role_id = r.id
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ? AND r.clinic_id = ?
      `;

      const [permissions] = await db.execute(permissionQuery, [req.user.id, req.user.clinic_id]);
      const userPermissions = permissions.map(p => p.name);

      const hasRequiredPermission = permissionsToCheck.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasRequiredPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permissions: ${permissionsToCheck.join(', ')}`
        });
      }

      next();

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Ensure multi-tenant data isolation
 */
const ensureTenantIsolation = (req, res, next) => {
  if (!req.user || !req.user.clinic_id) {
    return res.status(401).json({
      success: false,
      message: 'Tenant context required'
    });
  }

  // Add clinic_id to request body for create/update operations
  if (req.method === 'POST' || req.method === 'PUT') {
    req.body.clinic_id = req.user.clinic_id;
  }

  next();
};

/**
 * Rate limiting per clinic
 */
const clinicRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user || !req.user.clinic_id) {
      return next();
    }

    const clinicId = req.user.clinic_id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(clinicId)) {
      const clinicRequests = requests.get(clinicId);
      const validRequests = clinicRequests.filter(timestamp => timestamp > windowStart);
      requests.set(clinicId, validRequests);
    }

    // Check current requests
    const currentRequests = requests.get(clinicId) || [];

    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests for this clinic. Please try again later.'
      });
    }

    // Add current request
    currentRequests.push(now);
    requests.set(clinicId, currentRequests);

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  ensureTenantIsolation,
  clinicRateLimit
};