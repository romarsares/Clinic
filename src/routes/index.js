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
const clinicRoutes = require('./clinicRoutes');
const userRoutes = require('./userRoutes');
const userPreferencesRoutes = require('./userPreferencesRoutes');
const auditRoutes = require('./auditRoutes');
const patientRoutes = require('./patientRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const appointmentTypesRoutes = require('./appointmentTypesRoutes');
const tenantRoutes = require('./tenantRoutes');
const medicalHistoryRoutes = require('./medicalHistoryRoutes');
const labRoutes = require('./labRoutes');
const patientHistoryRoutes = require('./patientHistoryRoutes');
const billingRoutes = require('./billingRoutes');
const featureRoutes = require('./featureRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const { enforceTenantIsolation } = require('../middleware/tenant');

const router = express.Router();

// API version prefix
const API_VERSION = '/api/v1';

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'curaone-api',
    version: '1.0.0'
  });
});

/**
 * Authentication Routes
 * Handles user login, registration, and JWT token management
 */
router.use(`${API_VERSION}/auth`, authRoutes);

/**
 * Test Authentication Routes (for debugging)
 */
const testAuthRoutes = require('./test-auth');
router.use(`${API_VERSION}/test-auth`, testAuthRoutes);

/**
 * User Management Routes
 * Handles user management within clinic tenants
 */
router.use(`${API_VERSION}/users`, userRoutes);

/**
 * User Preferences Routes
 * Handles user preference settings and personalization
 */
router.use(`${API_VERSION}/users`, userPreferencesRoutes);

/**
 * Patient Management Routes
 * Handles patient demographics and parent-child relationships
 */
router.use(`${API_VERSION}/patients`, enforceTenantIsolation, patientRoutes);

/**
 * Appointment Management Routes
 * Handles appointment scheduling, updates, and cancellations
 */
router.use(`${API_VERSION}/appointments`, enforceTenantIsolation, appointmentRoutes);

/**
 * Appointment Types Management Routes
 * Handles appointment type configuration and management
 */
router.use(`${API_VERSION}/appointment-types`, enforceTenantIsolation, appointmentTypesRoutes);

/**
 * Clinical Documentation Routes
 * Handles visit records, diagnoses, vital signs, treatment plans
 */
router.use(`${API_VERSION}/visits`, enforceTenantIsolation, visitRoutes);

/**
 * Medical History Routes
 * Handles patient medical history, allergies, medications, family history
 */
router.use(`${API_VERSION}/medical-history`, medicalHistoryRoutes);

/**
 * Laboratory Routes
 * Handles lab requests, results, and dashboard statistics
 */
router.use(`${API_VERSION}/lab`, labRoutes);

/**
 * Patient History & Reporting Routes
 * Handles medical history, search, reports, and pediatric features
 */
router.use(`${API_VERSION}/patient-history`, patientHistoryRoutes);

/**
 * Billing Routes
 * Handles clinical billing, charges, and revenue tracking
 */
router.use(`${API_VERSION}/billing`, enforceTenantIsolation, billingRoutes);

/**
 * Feature Management Routes
 * Handles Super User feature toggle controls
 */
router.use(`${API_VERSION}/features`, featureRoutes);

/**
 * Dashboard Routes
 * Handles role-specific dashboard data and quick actions
 */
router.use(`${API_VERSION}/dashboard`, dashboardRoutes);

/**
 * Clinic Management Routes
 * Handles clinic profile and settings
 */
router.use(`${API_VERSION}/clinics`, clinicRoutes);

/**
 * Tenant Management Routes
 * Handles multi-tenant monitoring and validation
 */
router.use(`${API_VERSION}/tenant`, enforceTenantIsolation, tenantRoutes);

/**
 * Audit Management Routes
 * Handles audit log viewing and management
 */
router.use(`${API_VERSION}/audit`, auditRoutes);

/**
 * API Documentation endpoint
 */
router.get(`${API_VERSION}/docs`, (req, res) => {
  res.json({
    title: 'CuraOne API',
    version: '1.0.0',
    description: 'Multi-tenant clinic management system with clinical documentation',
    tagline: 'CuraOne — One Platform. Better Care.',
    endpoints: {
      auth: {
        'POST /auth/login': 'User login',
        'POST /auth/register': 'User registration'
      },
      users: {
        'GET /users': 'List clinic users',
        'POST /users': 'Create new user',
        'GET /users/:id': 'Get user details',
        'PUT /users/:id': 'Update user',
        'PUT /users/:id/roles': 'Update user roles',
        'PUT /users/:id/status': 'Update user status',
        'PUT /users/:id/password': 'Change password',
        'DELETE /users/:id': 'Delete user'
      },
      patients: {
        'GET /patients': 'List patients',
        'POST /patients': 'Create new patient',
        'GET /patients/search': 'Search patients',
        'GET /patients/:id': 'Get patient details',
        'PUT /patients/:id': 'Update patient',
        'POST /patients/:id/children': 'Add child to parent',
        'GET /patients/:id/children': 'Get patient children',
        'GET /patients/:id/parent': 'Get patient parent'
      },
      appointments: {
        'GET /appointments': 'List appointments',
        'POST /appointments': 'Create new appointment',
        'GET /appointments/calendar': 'Get calendar view',
        'GET /appointments/today': 'Get today appointments',
        'GET /appointments/:id': 'Get appointment details',
        'PUT /appointments/:id': 'Update appointment',
        'PUT /appointments/:id/status': 'Update appointment status',
        'DELETE /appointments/:id': 'Cancel appointment'
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
      },
      medical_history: {
        'GET /medical-history/:patientId': 'Get complete medical history',
        'POST /medical-history/:patientId/allergies': 'Add allergy record',
        'POST /medical-history/:patientId/medications': 'Add current medication',
        'POST /medical-history/:patientId/past-history': 'Add past medical history',
        'POST /medical-history/:patientId/family-history': 'Add family history',
        'PUT /medical-history/allergies/:allergyId/status': 'Update allergy status',
        'PUT /medical-history/medications/:medicationId/stop': 'Stop medication'
      },
      lab: {
        'POST /lab/requests': 'Create lab request (Doctor only)',
        'GET /lab/requests': 'List lab requests',
        'GET /lab/requests/:id': 'Get lab request details',
        'PUT /lab/requests/:id/status': 'Update lab request status',
        'POST /lab/results': 'Enter lab results (Lab Technician only)',
        'GET /lab/results/request/:labRequestId': 'Get lab result',
        'GET /lab/results/patient/:patientId': 'Get patient lab history',
        'GET /lab/templates': 'Get lab test templates',
        'GET /lab/dashboard': 'Get lab dashboard statistics'
      },
      patient_history: {
        'GET /patient-history/patients/:patientId/history': 'Get complete patient history',
        'GET /patient-history/patients/:patientId/summary': 'Generate patient summary report',
        'GET /patient-history/patients/:patientId/referral': 'Generate referral report',
        'GET /patient-history/search/diagnosis': 'Search by diagnosis',
        'GET /patient-history/search/advanced': 'Advanced patient search',
        'GET /patient-history/reports/:type': 'Get clinical reports',
        'GET /patient-history/patients/:patientId/growth-chart': 'Get growth chart data',
        'GET /patient-history/patients/:patientId/milestones': 'Get developmental milestones',
        'GET /patient-history/patients/:patientId/vaccines/compliance': 'Get vaccine compliance',
        'POST /patient-history/patients/:patientId/vaccines': 'Add vaccine record'
      },
      billing: {
        'POST /billing/visits/:visitId/patients/:patientId/bill': 'Generate visit bill',
        'POST /billing/lab-requests/:labRequestId/charges': 'Add lab charges to bill',
        'GET /billing/patients/:patientId/bills': 'Get patient bills',
        'GET /billing/bills/:billId': 'Get bill details',
        'POST /billing/bills/:billId/charges': 'Add service charge',
        'PUT /billing/bills/:billId/status': 'Update bill status',
        'GET /billing/revenue/by-service': 'Get revenue by service type',
        'GET /billing/dashboard': 'Get billing dashboard'
      },
      features: {
        'GET /features/clinics/:clinicId/features': 'Get clinic features (Super User)',
        'POST /features/clinics/:clinicId/features/enable': 'Enable feature (Super User)',
        'POST /features/clinics/:clinicId/features/disable': 'Disable feature (Super User)',
        'PUT /features/clinics/:clinicId/features': 'Bulk update features (Super User)',
        'GET /features/my-features': 'Get current user enabled features',
        'GET /features/definitions': 'Get all feature definitions'
      },
      audit: {
        'GET /audit/logs': 'Get audit logs',
        'POST /audit/log': 'Create manual audit log'
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