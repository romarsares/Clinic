/**
 * Avatar Upload Testing
 * 
 * Author: AI Assistant
 * Created: 2025-01-21
 * Purpose: Test user avatar upload functionality
 */

const request = require('supertest');
const app = require('../src/server');
const path = require('path');
const fs = require('fs');

describe('Avatar Upload Testing', () => {
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

        // Create test image file
        const testImagePath = path.join(__dirname, 'test-avatar.jpg');
        if (!fs.existsSync(testImagePath)) {
            // Create a minimal test image (1x1 pixel JPEG)
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
        }
    });

    describe('Avatar Upload API', () => {
        test('Should upload avatar successfully', async () => {
            const testImagePath = path.join(__dirname, 'test-avatar.jpg');
            
            const response = await request(app)
                .post(`/api/v1/users/${adminUserId}/avatar`)
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('avatar', testImagePath);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.avatar_url).toBeDefined();
            expect(response.body.data.avatar_url).toMatch(/^\/uploads\/avatars\/avatar-\d+-\d+\.jpg$/);
        });

        test('Should require authentication', async () => {
            const testImagePath = path.join(__dirname, 'test-avatar.jpg');
            
            const response = await request(app)
                .post(`/api/v1/users/${adminUserId}/avatar`)
                .attach('avatar', testImagePath);

            expect(response.status).toBe(401);
        });

        test('Should require file upload', async () => {
            const response = await request(app)
                .post(`/api/v1/users/${adminUserId}/avatar`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('No file uploaded');
        });

        test('Should delete avatar successfully', async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${adminUserId}/avatar`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Avatar deleted successfully');
        });

        test('Should handle delete when no avatar exists', async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${adminUserId}/avatar`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('No avatar to delete');
        });
    });

    afterAll(async () => {
        // Clean up test image
        const testImagePath = path.join(__dirname, 'test-avatar.jpg');
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    });
});

module.exports = {};