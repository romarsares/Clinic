/**
 * Authentication Routes
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles authentication endpoints for login and registration
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('clinic_id').isInt().withMessage('Valid clinic ID is required')
];

// --- Authentication Routes ---
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working', timestamp: new Date().toISOString() });
});

module.exports = router;