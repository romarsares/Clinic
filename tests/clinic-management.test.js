/**
 * Clinic Management Module - Test Suite
 * 
 * Author: Antigravity
 * Created: 2026-01-19
 * Purpose: Comprehensive tests for Tenant / Clinic Management
 */

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');
const jwt = require('jsonwebtoken');

describe('Clinic Management Module', () => {
    let ownerToken, staffToken, adminToken;
    const clinicId = 999;
    const JWT_SECRET = 'test_jwt_secret_key_for_testing_only_do_not_use_in_production';

    // Helper to create token
    const createToken = (userId, clinicId, roles) => {
        return jwt.sign(
            { userId, clinicId, roles },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    };

    beforeAll(async () => {
        // Ensure test database connection
        await db.testConnection();

        // Create valid tokens
        ownerToken = createToken(900, clinicId, ['Owner']);
        staffToken = createToken(901, clinicId, ['Staff']);
        adminToken = createToken(1, 0, ['SuperAdmin']); // Global admin

        // Insert a test clinics
        await db.executeQuery(`
          INSERT IGNORE INTO clinics (id, name, email, contact_number, address, timezone)
          VALUES 
          (0, 'System Clinic', 'admin@system.com', '000', 'System', 'UTC'),
          (999, 'Test Clinic', 'test@clinic.com', '123456', 'Test Address', 'Asia/Manila')
        `);

        // Insert test roles for RBAC verification (roles are per-clinic)
        await db.executeQuery(`INSERT IGNORE INTO roles (id, clinic_id, name) VALUES (1, 0, 'SuperAdmin')`);
        await db.executeQuery(`INSERT IGNORE INTO roles (id, clinic_id, name) VALUES (2, 999, 'Owner')`);
        await db.executeQuery(`INSERT IGNORE INTO roles (id, clinic_id, name) VALUES (3, 999, 'Staff')`);

        // Insert test users into auth_users for middleware verify
        await db.executeQuery(`
           INSERT IGNORE INTO auth_users (id, clinic_id, email, password_hash, full_name, status)
           VALUES 
           (1, 0, 'admin@test.com', 'hash', 'Super Admin', 'active'),
           (900, 999, 'owner@test.com', 'hash', 'Test Owner', 'active'),
           (901, 999, 'staff@test.com', 'hash', 'Test Staff', 'active')
        `);

        // Map users to roles using subqueries to be safe
        await db.executeQuery(`INSERT IGNORE INTO user_roles (user_id, role_id) SELECT 1, id FROM roles WHERE clinic_id = 0 AND name = 'SuperAdmin'`);
        await db.executeQuery(`INSERT IGNORE INTO user_roles (user_id, role_id) SELECT 900, id FROM roles WHERE clinic_id = 999 AND name = 'Owner'`);
        await db.executeQuery(`INSERT IGNORE INTO user_roles (user_id, role_id) SELECT 901, id FROM roles WHERE clinic_id = 999 AND name = 'Staff'`);
    });

    afterAll(async () => {
        // Clean up test data in correct order (child records first)
        try {
            await db.executeQuery('DELETE FROM audit_logs WHERE clinic_id IN (0, 999)');
            await db.executeQuery('DELETE FROM clinic_settings WHERE clinic_id = 999');
            await db.executeQuery('DELETE FROM user_roles WHERE user_id IN (SELECT id FROM auth_users WHERE clinic_id IN (0, 999))');
            await db.executeQuery('DELETE FROM auth_users WHERE clinic_id IN (0, 999)');
            await db.executeQuery('DELETE FROM roles WHERE clinic_id IN (0, 999)');
            await db.executeQuery('DELETE FROM clinics WHERE id IN (0, 999)');
        } catch (error) {
            console.error('Cleanup error:', error.message);
        }
        await db.closePool();
    });

    describe('GET /api/v1/clinics/:id', () => {
        test('should return clinic details for authorized owner', async () => {
            const response = await request(app)
                .get(`/api/v1/clinics/${clinicId}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Test Clinic');
        });

        test('should return clinic details for authorized staff', async () => {
            const response = await request(app)
                .get(`/api/v1/clinics/${clinicId}`)
                .set('Authorization', `Bearer ${staffToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should reject access to another clinic', async () => {
            await request(app)
                .get('/api/v1/clinics/100')
                .set('Authorization', `Bearer ${ownerToken}`)
                .expect(403);
        });
    });

    describe('PUT /api/v1/clinics/:id', () => {
        test('should update clinic info by owner', async () => {
            const updateData = {
                name: 'Updated Clinic Name',
                email: 'updated@clinic.com',
                contact_number: '654321',
                address: 'New Address',
                timezone: 'UTC'
            };

            const response = await request(app)
                .put(`/api/v1/clinics/${clinicId}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Clinic Name');
        });

        test('should reject update by staff', async () => {
            await request(app)
                .put(`/api/v1/clinics/${clinicId}`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ name: 'Staff Try' })
                .expect(403);
        });
    });

    describe('Settings Management', () => {
        test('should update a clinic setting by owner', async () => {
            const settingData = {
                key: 'test_setting',
                value: 'test_value'
            };

            const response = await request(app)
                .post(`/api/v1/clinics/${clinicId}/settings`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(settingData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.key).toBe('test_setting');
        });

        test('should retrieve clinic settings', async () => {
            const response = await request(app)
                .get(`/api/v1/clinics/${clinicId}/settings`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('test_setting', 'test_value');
        });

        test('should reject settings update by staff', async () => {
            await request(app)
                .post(`/api/v1/clinics/${clinicId}/settings`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ key: 'fail', value: 'fail' })
                .expect(403);
        });
    });

    describe('SuperAdmin Access', () => {
        test('should allow SuperAdmin to list all clinics', async () => {
            const response = await request(app)
                .get('/api/v1/clinics')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should block non-SuperAdmin from listing clinics', async () => {
            await request(app)
                .get('/api/v1/clinics')
                .set('Authorization', `Bearer ${ownerToken}`)
                .expect(403);
        });
    });
});
