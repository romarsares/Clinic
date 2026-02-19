/**
 * Patient Management Test Suite
 * Tests CRUD operations, search, parent-child relationships, and photo upload
 */

const request = require('supertest');
const db = require('../src/config/database');

const API_BASE = 'http://localhost:3000/api/v1';
let authToken;
let clinicId;
let testPatientId;
let testChildId;

describe('Patient Management', () => {
    beforeAll(async () => {
        // Login as staff user
        const loginRes = await request(API_BASE)
            .post('/auth/login')
            .send({ email: 'staff@clinic.com', password: 'Staff@123' });
        
        authToken = loginRes.body.token;
        clinicId = loginRes.body.user.clinic_id;
    });

    afterAll(async () => {
        // Cleanup test data
        if (testChildId) {
            await db.execute('DELETE FROM patients WHERE id = ?', [testChildId]);
        }
        if (testPatientId) {
            await db.execute('DELETE FROM patients WHERE id = ?', [testPatientId]);
        }
    });

    describe('POST /patients - Create Patient', () => {
        it('should create a new patient', async () => {
            const res = await request(API_BASE)
                .post('/patients')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    first_name: 'John',
                    last_name: 'Doe',
                    birth_date: '1990-05-15',
                    gender: 'male',
                    contact_number: '09171234567',
                    email: 'john.doe@example.com',
                    address: '123 Main St, Manila',
                    notes: 'Test patient'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.first_name).toBe('John');
            testPatientId = res.body.data.id;
        });

        it('should reject invalid patient data', async () => {
            const res = await request(API_BASE)
                .post('/patients')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    first_name: '',
                    last_name: 'Doe',
                    birth_date: 'invalid-date',
                    gender: 'invalid'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /patients - List Patients', () => {
        it('should list all patients in clinic', async () => {
            const res = await request(API_BASE)
                .get('/patients')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should support pagination', async () => {
            const res = await request(API_BASE)
                .get('/patients?page=1&limit=5')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /patients/search - Search Patients', () => {
        it('should search patients by name', async () => {
            const res = await request(API_BASE)
                .get('/patients/search?q=John')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should require search term', async () => {
            const res = await request(API_BASE)
                .get('/patients/search')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(400);
        });
    });

    describe('GET /patients/:id - Get Patient Details', () => {
        it('should get patient by ID', async () => {
            const res = await request(API_BASE)
                .get(`/patients/${testPatientId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(testPatientId);
            expect(res.body.data.first_name).toBe('John');
        });

        it('should return 404 for non-existent patient', async () => {
            const res = await request(API_BASE)
                .get('/patients/999999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /patients/:id - Update Patient', () => {
        it('should update patient information', async () => {
            const res = await request(API_BASE)
                .put(`/patients/${testPatientId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    contact_number: '09189876543',
                    email: 'john.updated@example.com'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.contact_number).toBe('09189876543');
        });
    });

    describe('Parent-Child Relationships', () => {
        it('should add a child to parent', async () => {
            const res = await request(API_BASE)
                .post(`/patients/${testPatientId}/children`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    first_name: 'Jane',
                    last_name: 'Doe',
                    date_of_birth: '2020-03-10',
                    gender: 'female'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            testChildId = res.body.data.id;
        });

        it('should get patient children', async () => {
            const res = await request(API_BASE)
                .get(`/patients/${testPatientId}/children`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should get child parent', async () => {
            const res = await request(API_BASE)
                .get(`/patients/${testChildId}/parent`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(testPatientId);
        });
    });

    describe('GET /patients/:id/history/summary - Patient Summary', () => {
        it('should get patient medical summary', async () => {
            const res = await request(API_BASE)
                .get(`/patients/${testPatientId}/history/summary`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('totalVisits');
            expect(res.body.data).toHaveProperty('commonDiagnoses');
            expect(res.body.data).toHaveProperty('allergies');
        });
    });

    describe('Authentication & Authorization', () => {
        it('should reject requests without token', async () => {
            const res = await request(API_BASE)
                .get('/patients');

            expect(res.status).toBe(401);
        });

        it('should reject invalid token', async () => {
            const res = await request(API_BASE)
                .get('/patients')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(401);
        });
    });
});
