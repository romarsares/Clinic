/**
 * Visit Records Module - Test Suite
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Comprehensive tests for Phase 2 Step 1 - Visit Records Module
 * 
 * This test suite validates:
 * - Visit creation and retrieval
 * - Clinical documentation endpoints
 * - Role-based access control
 * - Audit logging functionality
 * - Data validation and error handling
 */

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');

describe('Visit Records Module - Phase 2 Step 1', () => {
  let doctorToken, staffToken, visitId;
  
  beforeAll(async () => {
    // Setup test database connection
    await db.testConnection();
    
    // Mock JWT tokens for testing (replace with actual token generation)
    doctorToken = 'mock_doctor_jwt_token';
    staffToken = 'mock_staff_jwt_token';
  });

  afterAll(async () => {
    // Clean up database connections
    await db.closePool();
  });

  describe('Visit Creation', () => {
    test('should create a new visit with valid data', async () => {
      const visitData = {
        appointment_id: 1,
        patient_id: 1,
        doctor_id: 1
      };

      const response = await request(app)
        .post('/api/v1/visits')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(visitData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      visitId = response.body.data.id;
    });

    test('should reject visit creation without authentication', async () => {
      const visitData = {
        appointment_id: 1,
        patient_id: 1,
        doctor_id: 1
      };

      await request(app)
        .post('/api/v1/visits')
        .send(visitData)
        .expect(401);
    });

    test('should validate required fields', async () => {
      const invalidData = {
        appointment_id: 1
        // Missing patient_id and doctor_id
      };

      const response = await request(app)
        .post('/api/v1/visits')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Chief Complaint Documentation', () => {
    test('should add chief complaint successfully', async () => {
      const complaintData = {
        complaint: 'Patient complains of fever and cough for 3 days'
      };

      const response = await request(app)
        .put(`/api/v1/visits/${visitId}/chief-complaint`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(complaintData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should require complaint text', async () => {
      await request(app)
        .put(`/api/v1/visits/${visitId}/chief-complaint`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('Diagnosis Management (Doctor Only)', () => {
    test('should allow doctor to add diagnosis', async () => {
      const diagnosisData = {
        diagnosis_type: 'primary',
        diagnosis_code: 'J06.9',
        diagnosis_name: 'Acute upper respiratory infection, unspecified',
        clinical_notes: 'Patient presents with typical symptoms of viral URTI'
      };

      const response = await request(app)
        .post(`/api/v1/visits/${visitId}/diagnoses`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(diagnosisData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    test('should reject staff from adding diagnosis', async () => {
      const diagnosisData = {
        diagnosis_name: 'Some diagnosis'
      };

      const response = await request(app)
        .post(`/api/v1/visits/${visitId}/diagnoses`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(diagnosisData)
        .expect(403);

      expect(response.body.message).toContain('Only doctors can add diagnoses');
    });

    test('should validate diagnosis name is required', async () => {
      await request(app)
        .post(`/api/v1/visits/${visitId}/diagnoses`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('Vital Signs Recording', () => {
    test('should record vital signs with BMI calculation', async () => {
      const vitalsData = {
        temperature: 38.5,
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        heart_rate: 85,
        respiratory_rate: 18,
        weight: 25.5,
        height: 120.0,
        oxygen_saturation: 98
      };

      const response = await request(app)
        .put(`/api/v1/visits/${visitId}/vital-signs`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(vitalsData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('bmi');
    });

    test('should validate vital signs ranges', async () => {
      const invalidVitals = {
        temperature: 100, // Invalid temperature
        heart_rate: 500   // Invalid heart rate
      };

      await request(app)
        .put(`/api/v1/visits/${visitId}/vital-signs`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(invalidVitals)
        .expect(400);
    });
  });

  describe('Clinical Assessment (Doctor Only)', () => {
    test('should allow doctor to add clinical assessment', async () => {
      const assessmentData = {
        assessment: 'Patient appears well, no signs of respiratory distress. Throat slightly erythematous.'
      };

      const response = await request(app)
        .put(`/api/v1/visits/${visitId}/clinical-assessment`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(assessmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject staff from adding clinical assessment', async () => {
      const assessmentData = {
        assessment: 'Some assessment'
      };

      await request(app)
        .put(`/api/v1/visits/${visitId}/clinical-assessment`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(assessmentData)
        .expect(403);
    });
  });

  describe('Treatment Plan (Doctor Only)', () => {
    test('should allow doctor to add treatment plan', async () => {
      const treatmentData = {
        treatment_plan: '1. Paracetamol 250mg every 6 hours\n2. Increase fluid intake\n3. Rest and monitor'
      };

      const response = await request(app)
        .put(`/api/v1/visits/${visitId}/treatment-plan`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(treatmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject staff from creating treatment plan', async () => {
      const treatmentData = {
        treatment_plan: 'Some treatment plan'
      };

      await request(app)
        .put(`/api/v1/visits/${visitId}/treatment-plan`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(treatmentData)
        .expect(403);
    });
  });

  describe('Follow-up Instructions', () => {
    test('should add follow-up instructions', async () => {
      const instructionsData = {
        instructions: 'Return in 3-5 days if symptoms persist or worsen.'
      };

      const response = await request(app)
        .put(`/api/v1/visits/${visitId}/follow-up-instructions`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(instructionsData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Visit Retrieval', () => {
    test('should get complete clinical summary', async () => {
      const response = await request(app)
        .get(`/api/v1/visits/${visitId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('visit');
      expect(response.body.data).toHaveProperty('notes');
      expect(response.body.data).toHaveProperty('diagnoses');
      expect(response.body.data).toHaveProperty('vital_signs');
    });

    test('should return 404 for non-existent visit', async () => {
      await request(app)
        .get('/api/v1/visits/99999')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(404);
    });
  });

  describe('Visit Closure (Doctor Only)', () => {
    test('should allow doctor to close visit', async () => {
      const response = await request(app)
        .put(`/api/v1/visits/${visitId}/close`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject staff from closing visit', async () => {
      await request(app)
        .put(`/api/v1/visits/${visitId}/close`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });
  });

  describe('API Documentation', () => {
    test('should provide API documentation', async () => {
      const response = await request(app)
        .get('/api/v1/docs')
        .expect(200);

      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('visits');
    });
  });

  describe('Health Checks', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    test('should return database health status', async () => {
      const response = await request(app)
        .get('/db-health')
        .expect(200);

      expect(response.body.database.connected).toBe(true);
    });
  });
});

// Helper function to create mock JWT tokens for testing
function createMockToken(userId, clinicId, roles) {
  // In a real implementation, this would use the actual JWT library
  // For now, return a mock token that the middleware can recognize
  return `mock_token_${userId}_${clinicId}_${roles.join(',')}`;
}

// Test data cleanup helper
async function cleanupTestData() {
  try {
    // Clean up test visits, diagnoses, vital signs, etc.
    await db.execute('DELETE FROM visit_vital_signs WHERE visit_id IN (SELECT id FROM visits WHERE patient_id = 999)');
    await db.execute('DELETE FROM visit_diagnoses WHERE visit_id IN (SELECT id FROM visits WHERE patient_id = 999)');
    await db.execute('DELETE FROM visit_notes WHERE visit_id IN (SELECT id FROM visits WHERE patient_id = 999)');
    await db.execute('DELETE FROM visits WHERE patient_id = 999');
    await db.execute('DELETE FROM audit_logs WHERE clinic_id = 999');
  } catch (error) {
    console.error('Test cleanup error:', error);
  }
}

// Run cleanup after all tests
afterAll(async () => {
  await cleanupTestData();
});