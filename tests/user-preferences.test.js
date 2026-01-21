/**
 * User Preferences Testing
 * 
 * Author: AI Assistant
 * Created: 2025-01-20
 * Purpose: Test user preferences functionality
 */

const request = require('supertest');
const app = require('../src/server');

describe('User Preferences Testing', () => {
    let adminToken;
    const adminUserId = 1;

    beforeAll(async () => {
        // Login as admin
        const adminLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@clinic.com',
                password: 'admin12354'
            });

        expect(adminLogin.status).toBe(200);
        adminToken = adminLogin.body.data?.token;
        expect(adminToken).toBeDefined();
    });

    describe('User Preferences API', () => {
        test('Should get user preferences', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${adminUserId}/preferences`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(typeof response.body.data).toBe('object');
        });

        test('Should update user preferences', async () => {
            const preferences = {
                theme: 'dark',
                language: 'en',
                dashboard_refresh_interval: '60',
                notifications_enabled: 'true'
            };

            const response = await request(app)
                .put(`/api/v1/users/${adminUserId}/preferences`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(preferences);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should get specific preference', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${adminUserId}/preferences/theme`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.key).toBe('theme');
            expect(response.body.data.value).toBe('dark');
        });

        test('Should set specific preference', async () => {
            const response = await request(app)
                .put(`/api/v1/users/${adminUserId}/preferences/timezone`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ value: 'Asia/Manila' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should require authentication', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${adminUserId}/preferences`);

            expect(response.status).toBe(401);
        });

        test('Should deny access to other users preferences', async () => {
            const response = await request(app)
                .get('/api/v1/users/999/preferences')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(403); // Access denied
        });
    });
});

module.exports = {};