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

// --- Authentication Routes ---
router.post('/login', 
  authController.constructor.getLoginValidation(),
  authController.login
);

router.post('/register', 
  authController.constructor.getRegisterValidation(),
  authController.register
);

module.exports = router;