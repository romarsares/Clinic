/**
 * Security Validation Middleware - Phase 6 Hardening
 * 
 * Author: Security Engineer
 * Created: 2024-01-19
 * Purpose: Comprehensive input validation and sanitization for healthcare data
 */

const Joi = require('joi');
const DOMPurify = require('isomorphic-dompurify');
const rateLimit = require('express-rate-limit');

// Medical data validation schemas
const medicalSchemas = {
  // Vital signs validation with medical ranges
  vitalSigns: Joi.object({
    temperature: Joi.number().min(32).max(45).precision(1),
    blood_pressure_systolic: Joi.number().integer().min(60).max(250),
    blood_pressure_diastolic: Joi.number().integer().min(30).max(150),
    heart_rate: Joi.number().integer().min(30).max(220),
    respiratory_rate: Joi.number().integer().min(8).max(60),
    weight: Joi.number().min(0.5).max(500).precision(2),
    height: Joi.number().min(30).max(250).precision(1),
    oxygen_saturation: Joi.number().integer().min(70).max(100)
  }),

  // Clinical diagnosis validation
  diagnosis: Joi.object({
    diagnosis_name: Joi.string().trim().min(3).max(200).required(),
    diagnosis_type: Joi.string().valid('primary', 'secondary').default('primary'),
    diagnosis_code: Joi.string().trim().max(20).pattern(/^[A-Z0-9.-]+$/),
    clinical_notes: Joi.string().trim().max(2000).allow('')
  }),

  // Patient data validation
  patient: Joi.object({
    first_name: Joi.string().trim().min(1).max(50).pattern(/^[a-zA-Z\s'-]+$/).required(),
    last_name: Joi.string().trim().min(1).max(50).pattern(/^[a-zA-Z\s'-]+$/).required(),
    date_of_birth: Joi.date().max('now').required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    contact_number: Joi.string().pattern(/^(\+63|0)?[0-9]{10}$/).required(),
    email: Joi.string().email().max(100).allow(''),
    address: Joi.string().trim().max(500).allow('')
  }),

  // Lab result validation
  labResult: Joi.object({
    test_values: Joi.object().required(),
    normal_ranges: Joi.object(),
    result_file: Joi.string().max(255),
    notes: Joi.string().max(1000).allow('')
  })
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj.trim());
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// SQL injection prevention
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b).*?[=<>]/gi
  ];

  const checkForSQL = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (checkForSQL(value) || checkForSQL(key)) {
        return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) return true;
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      code: 'SECURITY_VIOLATION'
    });
  }

  next();
};

// Medical data validation middleware
const validateMedicalData = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Medical data validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

// Enhanced rate limiting for medical endpoints
const medicalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Stricter limit for medical data
  message: {
    success: false,
    message: 'Too many medical data requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.user?.clinic_id || 'anonymous'}`
});

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (req.files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of Object.values(req.files)) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPEG, PNG, and PDF allowed.'
        });
      }
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }
    }
  }
  next();
};

module.exports = {
  medicalSchemas,
  sanitizeInput,
  preventSQLInjection,
  validateMedicalData,
  medicalRateLimit,
  validateFileUpload
};