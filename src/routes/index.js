/**
 * Routes Index - API Route Registration
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Central registration point for all API routes with proper organization
 * 
 * This file registers:
 * - Authentication routes
 * - Clinical documentation routes (visits)
 * - Patient management routes
 * - Appointment routes
 * - Billing routes
 * - Admin routes
 */

const express = require('express');
const visitRoutes = require('./visits');
const authRoutes = require('./authRoutes');
const { logFailedAccess } = require('../middleware/audit');

const router = express.Router();

// Apply failed access logging to all routes
router.use(logFailedAccess);

// API version prefix
const API_VERSION = '/api/v1';

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'clinic-saas-api',
    version: '1.0.0'
  });
});

/**
 * Authentication Routes
 * Handles user login, registration, and JWT token management
 */
router.use(`${API_VERSION}/auth`, authRoutes);

/**
 * Clinical Documentation Routes
 * Handles visit records, diagnoses, vital signs, treatment plans
 */
router.use(`${API_VERSION}/visits`, visitRoutes);

/**
 * API Documentation endpoint
 */
router.get(`${API_VERSION}/docs`, (req, res) => {
  res.json({
    title: 'Pediatric Clinic SaaS API',
    version: '1.0.0',
    description: 'Multi-tenant clinic management system with clinical documentation',
    endpoints: {
      auth: {
        'POST /auth/login': 'User login',
        'POST /auth/register': 'User registration'
      },
      visits: {
        'POST /visits': 'Create new visit',
        'GET /visits/:id': 'Get visit details',
        'PUT /visits/:id/chief-complaint': 'Add chief complaint',
        'POST /visits/:id/diagnoses': 'Add diagnosis (Doctor only)',
        'PUT /visits/:id/vital-signs': 'Record vital signs',
        'PUT /visits/:id/clinical-assessment': 'Add clinical assessment (Doctor only)',
        'PUT /visits/:id/treatment-plan': 'Add treatment plan (Doctor only)',
        'PUT /visits/:id/follow-up-instructions': 'Add follow-up instructions',
        'PUT /visits/:id/close': 'Close visit (Doctor only)'
      }
    },
    authentication: 'Bearer JWT token required',
    authorization: 'Role-based access control enforced',
    audit: 'All clinical actions are logged for compliance'
  });
});

/**
 * 404 handler for API routes
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;