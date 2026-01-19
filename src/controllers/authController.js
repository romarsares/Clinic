/**
 * Authentication Controller
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles user authentication, registration, and JWT token management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const AuditService = require('../services/AuditService');

class AuthController {
  /**
   * User login
   * POST /auth/login
   */
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Get user with roles
      const userQuery = `
        SELECT u.id, u.clinic_id, u.email, u.password_hash, u.full_name, u.status,
               GROUP_CONCAT(r.name) as roles
        FROM auth_users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.email = ? AND u.status = 'active'
        GROUP BY u.id
      `;

      const [users] = await db.execute(userQuery, [email]);
      
      if (!users.length) {
        await AuditService.logAuth({ email }, 'login_failed', req, false, 'User not found');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        await AuditService.logAuth({ email, clinic_id: user.clinic_id }, 'login_failed', req, false, 'Invalid password');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          clinicId: user.clinic_id,
          roles: user.roles ? user.roles.split(',') : []
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Update last login
      await db.execute(
        'UPDATE auth_users SET last_login_at = NOW() WHERE id = ?',
        [user.id]
      );

      // Log successful login
      await AuditService.logAuth(user, 'login', req, true);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            clinic_id: user.clinic_id,
            email: user.email,
            full_name: user.full_name,
            roles: user.roles ? user.roles.split(',') : []
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  /**
   * User registration
   * POST /auth/register
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, full_name, clinic_id } = req.body;

      // Check if user exists
      const [existingUsers] = await db.execute(
        'SELECT id FROM auth_users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const [result] = await db.execute(`
        INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', NOW(), NOW())
      `, [clinic_id, email, password_hash, full_name]);

      // Log user registration
      await AuditService.logAction({
        clinic_id,
        user_id: result.insertId,
        action: 'user_register',
        entity: 'user',
        entity_id: result.insertId,
        ip_address: req.ip || req.connection?.remoteAddress,
        user_agent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl,
        new_value: { email, full_name, clinic_id }
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: result.insertId,
          email,
          full_name
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  /**
   * Validation rules for login
   */
  static getLoginValidation() {
    return [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ];
  }

  /**
   * Validation rules for registration
   */
  static getRegisterValidation() {
    return [
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
      body('full_name').trim().isLength({ min: 2 }).withMessage('Full name is required'),
      body('clinic_id').isInt().withMessage('Valid clinic ID is required')
    ];
  }
}

module.exports = new AuthController();