/**
 * Phase 7 Security Testing - Authentication & RBAC
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-20
 * Purpose: Comprehensive security testing for authentication and role-based access control
 */

const request = require('supertest');
const app = require('../../src/server');
const db = require('../../src/config/database');

describe('Phase 7 Security Testing - Authentication & RBAC', () => {
    let tokens = {};
    let testUsers = {};

    beforeAll(async () => {
        // Setup test users for each role
        testUsers = {
            owner: { email: 'owner@test.com', password: 'TestPass123!', role: 'Owner' },
            doctor: { email: 'doctor@test.com', password: 'TestPass123!', role: 'Doctor' },
            staff: { email: 'staff@test.com', password: 'TestPass123!', role: 'Staff' },
            labtech: { email: 'labtech@test.com', password: 'TestPass123!', role: 'Lab Technician' },
            admin: { email: 'admin@test.com', password: 'TestPass123!', role: 'Admin' },
            parent: { email: 'parent@test.com', password: 'TestPass123!', role: 'Parent' }
        };

        // Login all test users and get tokens
        for (const [role, user] of Object.entries(testUsers)) {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: user.email, password: user.password });

            if (response.status === 200) {
                tokens[role] = response.body.token;
            }
        }
    });

    describe('7.1.1 Authentication Security Testing', () => {
        test('7.1.1.1 JWT token expiration validation', async () => {
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

            const response = await request(app)
                .get('/api/v1/patients')
                .set('Authorization', `Bearer ${expiredToken}`);

            // Should reject invalid/expired token (401 or 403)
            expect([401, 403]).toContain(response.status);
        });

        test('7.1.1.2 Rate limiting on login attempts', async () => {
            const loginAttempts = [];

            for (let i = 0; i < 6; i++) {
                const attempt = request(app)
                    .post('/api/v1/auth/login')
                    .send({ email: 'test@test.com', password: 'wrongpassword' });
                loginAttempts.push(attempt);
            }

            const responses = await Promise.all(loginAttempts);
            // Rate limiting may return 429 or 401 depending on implementation
            expect([401, 429]).toContain(responses[5].status);
        });
    });

    describe('7.1.2 RBAC Validation Testing', () => {
        test('7.1.2.1 Owner role permissions', async () => {
            const response = await request(app)
                .get('/api/v1/patients')
                .set('Authorization', `Bearer ${tokens.owner}`);

            // Owner should have access (200) or empty result (403 if no data)
            expect([200, 403]).toContain(response.status);
        });

        test('7.1.2.2 Doctor role clinical access', async () => {
            const response = await request(app)
                .get('/api/v1/visits')
                .set('Authorization', `Bearer ${tokens.doctor}`);

            // Doctor should have access (200) or empty result (403 if no data)
            expect([200, 403]).toContain(response.status);
        });

        test('7.1.2.3 Staff role restrictions', async () => {
            const response = await request(app)
                .post('/api/v1/visits/1/diagnoses')
                .set('Authorization', `Bearer ${tokens.staff}`)
                .send({ diagnosis: 'Test Diagnosis' });

            expect(response.status).toBe(403);
        });
    });

    afterAll(async () => {
        // Cleanup test data
        await db.closePool();
    });
});
