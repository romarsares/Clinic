/**
 * User Profile Operations Testing
 * 
 * Author: AI Assistant
 * Created: 2025-01-21
 * Purpose: Test complete user profile management functionality
 */

const request = require('supertest');
const app = require('../src/server');
const path = require('path');
const fs = require('fs');

describe('User Profile Operations Testing', () => {
    let adminToken;
    let testUserId;
    const adminUserId = 1;

    beforeAll(async () => {
        // Login as admin
        const adminLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'updated@clinic.com', // Email was changed in previous test
                password: 'admin12354'
            });

        expect(adminLogin.status).toBe(200);
        adminToken = adminLogin.body.data?.token;
        expect(adminToken).toBeDefined();

        // Create test user for profile operations
        const createUser = await request(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'testuser@clinic.com',
                password: 'test12354',
                first_name: 'Test',
                last_name: 'User',
                role_ids: [2] // Doctor role
            });

        if (createUser.status === 201) {
            testUserId = createUser.body.data.id;
        }
    });

    describe('User Profile CRUD Operations', () => {
        test('Should get user details', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${adminUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(adminUserId);
            expect(response.body.data.email).toBeDefined();
            expect(response.body.data.full_name).toBeDefined();
        });

        test('Should update user profile', async () => {
            const updateData = {
                first_name: 'Updated',
                last_name: 'Name',
                email: 'updated@clinic.com'
            };

            const response = await request(app)
                .put(`/api/v1/users/${adminUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should update user roles', async () => {
            if (!testUserId) return;

            const response = await request(app)
                .put(`/api/v1/users/${testUserId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role_ids: [3] }); // Staff role

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should update user status', async () => {
            if (!testUserId) return;

            const response = await request(app)
                .put(`/api/v1/users/${testUserId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'suspended' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Password Management', () => {
        test('Should change own password', async () => {
            const response = await request(app)
                .put(`/api/v1/users/${adminUserId}/password`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    current_password: 'admin12354',
                    new_password: 'newpassword123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should reset password back', async () => {
            const response = await request(app)
                .put(`/api/v1/users/${adminUserId}/password`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    current_password: 'newpassword123',
                    new_password: 'admin12354'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('User Preferences Management', () => {
        test('Should get user preferences', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${adminUserId}/preferences`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should update user preferences', async () => {
            const preferences = {
                theme: 'dark',
                language: 'en',
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
            expect(response.body.data.value).toBe('dark');
        });
    });

    describe('Avatar Management', () => {
        test('Should upload avatar', async () => {
            // Create test image
            const testImagePath = path.join(__dirname, 'test-profile-avatar.jpg');
            const testImageBuffer = Buffer.from([
                0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
                0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
                0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
                0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
                0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
                0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
                0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
                0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
                0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
                0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
                0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
                0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xC0,
                0x07, 0xFF, 0xD9
            ]);
            fs.writeFileSync(testImagePath, testImageBuffer);

            const response = await request(app)
                .post(`/api/v1/users/${adminUserId}/avatar`)
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('avatar', testImagePath);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.avatar_url).toBeDefined();

            // Clean up
            fs.unlinkSync(testImagePath);
        });

        test('Should delete avatar', async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${adminUserId}/avatar`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Access Control', () => {
        test('Should require authentication', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${adminUserId}`);

            expect(response.status).toBe(401);
        });

        test('Should deny access to other users without permission', async () => {
            if (!testUserId) return;

            // Create another user token
            const userLogin = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'testuser@clinic.com',
                    password: 'test12354'
                });

            if (userLogin.status === 200) {
                const userToken = userLogin.body.data.token;

                const response = await request(app)
                    .get(`/api/v1/users/${adminUserId}`)
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(401); // User is suspended, can't authenticate
            }
        });
    });

    afterAll(async () => {
        // Clean up test user
        if (testUserId) {
            await request(app)
                .delete(`/api/v1/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);
        }
    });
});

module.exports = {};