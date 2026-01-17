/**
 * Test Helper Utilities
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Common testing utilities and mock functions for clinic SaaS
 */

const jwt = require('jsonwebtoken');

// Mock JWT tokens for testing
const createMockToken = (userId, clinicId, roles) => {
  return jwt.sign(
    { 
      userId, 
      clinicId, 
      roles: Array.isArray(roles) ? roles : [roles]
    },
    process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only',
    { expiresIn: '1h' }
  );
};

// Test user tokens
const testTokens = {
  doctor: createMockToken(999, 999, ['Doctor']),
  staff: createMockToken(998, 999, ['Staff']),
  invalid: 'invalid_token_for_testing'
};

// Mock request data
const mockVisitData = {
  appointment_id: 1,
  patient_id: 999,
  doctor_id: 999
};

const mockVitalSigns = {
  temperature: 37.5,
  blood_pressure_systolic: 120,
  blood_pressure_diastolic: 80,
  heart_rate: 75,
  respiratory_rate: 16,
  weight: 25.0,
  height: 120.0,
  oxygen_saturation: 98
};

const mockDiagnosis = {
  diagnosis_type: 'primary',
  diagnosis_code: 'J06.9',
  diagnosis_name: 'Acute upper respiratory infection, unspecified',
  clinical_notes: 'Test diagnosis notes'
};

const mockChiefComplaint = {
  complaint: 'Patient complains of fever and cough for 3 days'
};

const mockClinicalAssessment = {
  assessment: 'Patient appears well, no signs of respiratory distress. Throat slightly erythematous.'
};

const mockTreatmentPlan = {
  treatment_plan: '1. Paracetamol 250mg every 6 hours for fever\n2. Increase fluid intake\n3. Rest and monitor symptoms'
};

const mockFollowUpInstructions = {
  instructions: 'Return in 3-5 days if symptoms persist or worsen. Seek immediate care if difficulty breathing develops.'
};

// Database test helpers
const createTestVisit = async (db) => {
  const query = `
    INSERT INTO visits (clinic_id, appointment_id, patient_id, doctor_id, visit_date, status)
    VALUES (999, 1, 999, 999, NOW(), 'open')
  `;
  const [result] = await db.execute(query);
  return result.insertId;
};

const cleanupTestVisit = async (db, visitId) => {
  if (!visitId) return;
  
  await db.execute('DELETE FROM visit_vital_signs WHERE visit_id = ?', [visitId]);
  await db.execute('DELETE FROM visit_diagnoses WHERE visit_id = ?', [visitId]);
  await db.execute('DELETE FROM visit_notes WHERE visit_id = ?', [visitId]);
  await db.execute('DELETE FROM visits WHERE id = ?', [visitId]);
  await db.execute('DELETE FROM audit_logs WHERE entity_id = ?', [visitId]);
};

// API response validators
const validateApiResponse = (response, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success');
  
  if (expectedStatus >= 200 && expectedStatus < 300) {
    expect(response.body.success).toBe(true);
  } else {
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
  }
};

const validateVisitResponse = (response) => {
  validateApiResponse(response, 200);
  expect(response.body.data).toHaveProperty('visit');
  expect(response.body.data).toHaveProperty('notes');
  expect(response.body.data).toHaveProperty('diagnoses');
  expect(response.body.data).toHaveProperty('vital_signs');
};

const validateErrorResponse = (response, expectedStatus, expectedMessage) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.success).toBe(false);
  if (expectedMessage) {
    expect(response.body.message).toContain(expectedMessage);
  }
};

// Test data generators
const generateRandomVitalSigns = () => ({
  temperature: (36 + Math.random() * 4).toFixed(1),
  blood_pressure_systolic: Math.floor(90 + Math.random() * 50),
  blood_pressure_diastolic: Math.floor(60 + Math.random() * 30),
  heart_rate: Math.floor(60 + Math.random() * 40),
  respiratory_rate: Math.floor(12 + Math.random() * 8),
  weight: (20 + Math.random() * 30).toFixed(1),
  height: (100 + Math.random() * 50).toFixed(1),
  oxygen_saturation: Math.floor(95 + Math.random() * 5)
});

const generateRandomDiagnosis = () => ({
  diagnosis_type: Math.random() > 0.5 ? 'primary' : 'secondary',
  diagnosis_code: `J${Math.floor(10 + Math.random() * 89)}.${Math.floor(Math.random() * 10)}`,
  diagnosis_name: `Test Diagnosis ${Math.random().toString(36).substr(2, 9)}`,
  clinical_notes: `Clinical notes for test diagnosis ${Math.random().toString(36).substr(2, 9)}`
});

// Wait helper for async operations
const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Database query helpers
const countRecords = async (db, table, whereClause = '1=1') => {
  const [rows] = await db.execute(`SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause}`);
  return rows[0].count;
};

const getLastInsertedRecord = async (db, table, orderBy = 'id') => {
  const [rows] = await db.execute(`SELECT * FROM ${table} ORDER BY ${orderBy} DESC LIMIT 1`);
  return rows[0] || null;
};

// Mock middleware for testing
const mockAuthMiddleware = (user = { id: 999, clinic_id: 999, roles: ['Doctor'] }) => {
  return (req, res, next) => {
    req.user = user;
    next();
  };
};

const mockAuditMiddleware = () => {
  return (req, res, next) => {
    // Skip audit logging in tests
    next();
  };
};

module.exports = {
  // Tokens and auth
  testTokens,
  createMockToken,
  
  // Mock data
  mockVisitData,
  mockVitalSigns,
  mockDiagnosis,
  mockChiefComplaint,
  mockClinicalAssessment,
  mockTreatmentPlan,
  mockFollowUpInstructions,
  
  // Database helpers
  createTestVisit,
  cleanupTestVisit,
  countRecords,
  getLastInsertedRecord,
  
  // Validators
  validateApiResponse,
  validateVisitResponse,
  validateErrorResponse,
  
  // Generators
  generateRandomVitalSigns,
  generateRandomDiagnosis,
  
  // Utilities
  waitFor,
  
  // Mock middleware
  mockAuthMiddleware,
  mockAuditMiddleware
};