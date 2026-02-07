/**
 * Smoke Test - Verify Core APIs Work
 * Minimal test to validate system is functional
 */

const request = require('supertest');
const app = require('../src/server');

describe('Smoke Test - Core API Verification', () => {
    
    test('Health endpoint responds', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
    });

    test('Login endpoint exists and validates input', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'test@test.com', password: 'testpass123' });
        
        // Should return 400 or 401, not 404 (endpoint exists)
        expect(response.status).not.toBe(404);
        expect([400, 401]).toContain(response.status);
    });

    test('Protected route requires authentication', async () => {
        const response = await request(app).get('/api/v1/patients');
        // Should return 401 or 403 (unauthorized/forbidden), not 404
        expect(response.status).not.toBe(404);
        expect([401, 403]).toContain(response.status);
    });

    test('Server handles invalid routes', async () => {
        const response = await request(app).get('/invalid-route-that-does-not-exist');
        expect(response.status).toBe(404);
    });
});
