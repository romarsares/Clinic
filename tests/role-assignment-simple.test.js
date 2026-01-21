/**
 * Role Assignment Workflows Testing - Simplified Version
 * 
 * Author: AI Assistant
 * Created: 2025-01-20
 * Purpose: Test role assignment functionality using existing admin user
 */

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');

describe('Role Assignment Workflows - Simplified Testing', () => {
    let adminToken;
    let testUserId;
    const testClinicId = 1;

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

        // Create a test user for role assignment
        const testUser = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'test.roleuser@clinic.com',
                password: 'TestPass123!',
                full_name: 'Test Role User',
                clinic_id: testClinicId
            });

        if (testUser.status === 201) {
            testUserId = testUser.body.data.id;
        }
    });

    describe('1. Basic Role Assignment Functionality', () => {
        test('1.1 Should get available roles for clinic', async () => {
            const [roles] = await db.execute(
                'SELECT id, name FROM roles WHERE clinic_id = ?',
                [testClinicId]
            );

            expect(roles.length).toBeGreaterThan(0);
            expect(roles.some(role => role.name === 'Owner')).toBe(true);
            expect(roles.some(role => role.name === 'Doctor')).toBe(true);
            expect(roles.some(role => role.name === 'Staff')).toBe(true);
        });

        test('1.2 Should assign Doctor role to test user', async () => {
            if (!testUserId) {
                console.log('Skipping test - no test user created');
                return;
            }

            // Get Doctor role ID
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Doctor', testClinicId]
            );

            expect(roles.length).toBe(1);
            const doctorRoleId = roles[0].id;

            const response = await request(app)
                .put(`/api/v1/users/${testUserId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [doctorRoleId]
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify role assignment in database
            const [userRoles] = await db.execute(
                'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
                [testUserId, doctorRoleId]
            );

            expect(userRoles.length).toBe(1);
        });

        test('1.3 Should change user role from Doctor to Staff', async () => {
            if (!testUserId) {
                console.log('Skipping test - no test user created');
                return;
            }

            // Get Staff role ID
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Staff', testClinicId]
            );

            expect(roles.length).toBe(1);
            const staffRoleId = roles[0].id;

            const response = await request(app)
                .put(`/api/v1/users/${testUserId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [staffRoleId]
                });

            expect(response.status).toBe(200);

            // Verify only Staff role is assigned
            const [userRoles] = await db.execute(
                'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?',
                [testUserId]
            );

            expect(userRoles.length).toBe(1);
            expect(userRoles[0].name).toBe('Staff');
        });

        test('1.4 Should remove all roles from user', async () => {
            if (!testUserId) {
                console.log('Skipping test - no test user created');
                return;
            }

            const response = await request(app)
                .put(`/api/v1/users/${testUserId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: []
                });

            expect(response.status).toBe(200);

            // Verify no roles assigned
            const [userRoles] = await db.execute(
                'SELECT COUNT(*) as count FROM user_roles WHERE user_id = ?',
                [testUserId]
            );

            expect(userRoles[0].count).toBe(0);
        });
    });

    describe('2. Role Assignment Security', () => {
        test('2.1 Should reject invalid role IDs', async () => {
            if (!testUserId) {
                console.log('Skipping test - no test user created');
                return;
            }

            const response = await request(app)
                .put(`/api/v1/users/${testUserId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [99999] // Non-existent role ID
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('2.2 Should reject role assignment to non-existent user', async () => {
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Owner', testClinicId]
            );

            const roleId = roles[0].id;

            const response = await request(app)
                .put('/api/v1/users/99999/roles')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [roleId]
                });

            expect(response.status).toBe(404);
        });

        test('2.3 Should require authentication for role assignment', async () => {
            if (!testUserId) {
                console.log('Skipping test - no test user created');
                return;
            }

            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Owner', testClinicId]
            );

            const roleId = roles[0].id;

            const response = await request(app)
                .put(`/api/v1/users/${testUserId}/roles`)
                .send({
                    role_ids: [roleId]
                });

            expect(response.status).toBe(401);
        });
    });

    describe('3. User Management API', () => {
        test('3.1 Should list users with their roles', async () => {
            const response = await request(app)
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('3.2 Should get user details with roles', async () => {
            if (!testUserId) {
                console.log('Skipping test - no test user created');
                return;
            }

            const response = await request(app)
                .get(`/api/v1/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(testUserId);
            expect(Array.isArray(response.body.data.roles)).toBe(true);
        });

        test('3.3 Should update user status', async () => {
            if (!testUserId) {
                console.log('Skipping test - no test user created');
                return;
            }

            const response = await request(app)
                .put(`/api/v1/users/${testUserId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'suspended'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify status change
            const [users] = await db.execute(
                'SELECT status FROM auth_users WHERE id = ?',
                [testUserId]
            );

            expect(users[0].status).toBe('suspended');
        });
    });

    afterAll(async () => {
        // Cleanup test user
        if (testUserId) {
            try {
                await db.execute('DELETE FROM user_roles WHERE user_id = ?', [testUserId]);
                await db.execute('DELETE FROM auth_users WHERE id = ?', [testUserId]);
            } catch (error) {
                console.log('Cleanup error (non-critical):', error.message);
            }
        }
    });
});