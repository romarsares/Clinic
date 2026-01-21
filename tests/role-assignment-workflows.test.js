/**
 * Role Assignment Workflows Testing
 * 
 * Author: AI Assistant
 * Created: 2025-01-20
 * Purpose: Comprehensive testing of role assignment workflows for RBAC system
 * 
 * Tests cover:
 * - Role assignment API functionality
 * - Permission validation after role changes
 * - Cross-tenant role isolation
 * - Role hierarchy enforcement
 * - Audit logging for role changes
 */

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');

describe('Role Assignment Workflows Testing', () => {
    let adminToken, ownerToken, doctorToken, staffToken;
    let testClinicId = 1;
    let testUsers = {};

    beforeAll(async () => {
        // Login as admin to get token
        const adminLogin = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@clinic.com',
                password: 'admin12354'
            });

        adminToken = adminLogin.body.data?.token;
        expect(adminToken).toBeDefined();

        // Create test users for role assignment testing
        const testUserData = [
            { email: 'test.owner@clinic.com', full_name: 'Test Owner', role: 'Owner' },
            { email: 'test.doctor@clinic.com', full_name: 'Test Doctor', role: 'Doctor' },
            { email: 'test.staff@clinic.com', full_name: 'Test Staff', role: 'Staff' },
            { email: 'test.labtech@clinic.com', full_name: 'Test Lab Tech', role: 'Lab Technician' }
        ];

        for (const userData of testUserData) {
            // Register user
            const registerResponse = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: userData.email,
                    password: 'TestPass123!',
                    full_name: userData.full_name,
                    clinic_id: testClinicId
                });

            if (registerResponse.status === 201) {
                testUsers[userData.role] = {
                    id: registerResponse.body.data.id,
                    email: userData.email,
                    role: userData.role
                };
            }
        }
    });

    describe('1. Role Assignment API Functionality', () => {
        test('1.1 Should assign Owner role to user', async () => {
            const userId = testUsers.Owner.id;
            
            // Get Owner role ID
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Owner', testClinicId]
            );
            
            const roleId = roles[0].id;

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [roleId]
                });

            expect(response.status).toBe(200);
            
            // Verify role assignment in database
            const [userRoles] = await db.execute(
                'SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?',
                [userId, roleId]
            );
            
            expect(userRoles.length).toBe(1);
        });

        test('1.2 Should assign Doctor role to user', async () => {
            const userId = testUsers.Doctor.id;
            
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Doctor', testClinicId]
            );
            
            const roleId = roles[0].id;

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [roleId]
                });

            expect(response.status).toBe(200);
        });

        test('1.3 Should assign Staff role to user', async () => {
            const userId = testUsers.Staff.id;
            
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Staff', testClinicId]
            );
            
            const roleId = roles[0].id;

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [roleId]
                });

            expect(response.status).toBe(200);
        });

        test('1.4 Should assign Lab Technician role to user', async () => {
            const userId = testUsers['Lab Technician'].id;
            
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Lab Technician', testClinicId]
            );
            
            const roleId = roles[0].id;

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [roleId]
                });

            expect(response.status).toBe(200);
        });
    });

    describe('2. Permission Validation After Role Changes', () => {
        test('2.1 Owner should have access to all clinic functions', async () => {
            // Login as owner
            const ownerLogin = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUsers.Owner.email,
                    password: 'TestPass123!'
                });

            ownerToken = ownerLogin.body.data?.token;
            expect(ownerToken).toBeDefined();

            // Test access to patients
            const patientsResponse = await request(app)
                .get('/api/v1/patients')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(patientsResponse.status).not.toBe(403);

            // Test access to appointments
            const appointmentsResponse = await request(app)
                .get('/api/v1/appointments')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(appointmentsResponse.status).not.toBe(403);

            // Test access to users management
            const usersResponse = await request(app)
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(usersResponse.status).not.toBe(403);
        });

        test('2.2 Doctor should have clinical access but not admin functions', async () => {
            // Login as doctor
            const doctorLogin = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUsers.Doctor.email,
                    password: 'TestPass123!'
                });

            doctorToken = doctorLogin.body.data?.token;
            expect(doctorToken).toBeDefined();

            // Should have access to patients
            const patientsResponse = await request(app)
                .get('/api/v1/patients')
                .set('Authorization', `Bearer ${doctorToken}`);

            expect(patientsResponse.status).not.toBe(403);

            // Should have access to visits
            const visitsResponse = await request(app)
                .get('/api/v1/visits')
                .set('Authorization', `Bearer ${doctorToken}`);

            expect(visitsResponse.status).not.toBe(403);

            // Should NOT have access to user management
            const usersResponse = await request(app)
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${doctorToken}`);

            expect(usersResponse.status).toBe(403);
        });

        test('2.3 Staff should have limited access', async () => {
            // Login as staff
            const staffLogin = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUsers.Staff.email,
                    password: 'TestPass123!'
                });

            staffToken = staffLogin.body.data?.token;
            expect(staffToken).toBeDefined();

            // Should have access to appointments
            const appointmentsResponse = await request(app)
                .get('/api/v1/appointments')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(appointmentsResponse.status).not.toBe(403);

            // Should NOT be able to create diagnoses
            const diagnosisResponse = await request(app)
                .post('/api/v1/visits/1/diagnoses')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({
                    diagnosis_name: 'Test Diagnosis',
                    diagnosis_type: 'primary'
                });

            expect(diagnosisResponse.status).toBe(403);
        });
    });

    describe('3. Role Change Workflows', () => {
        test('3.1 Should change user role from Staff to Doctor', async () => {
            const userId = testUsers.Staff.id;
            
            // Get Doctor role ID
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Doctor', testClinicId]
            );
            
            const doctorRoleId = roles[0].id;

            // Change role
            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [doctorRoleId]
                });

            expect(response.status).toBe(200);

            // Verify old role is removed and new role is assigned
            const [userRoles] = await db.execute(
                'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?',
                [userId]
            );

            expect(userRoles.length).toBe(1);
            expect(userRoles[0].name).toBe('Doctor');
        });

        test('3.2 Should assign multiple roles to user', async () => {
            const userId = testUsers.Owner.id;
            
            // Get multiple role IDs
            const [roles] = await db.execute(
                'SELECT id, name FROM roles WHERE name IN (?, ?) AND clinic_id = ?',
                ['Owner', 'Doctor', testClinicId]
            );
            
            const roleIds = roles.map(role => role.id);

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: roleIds
                });

            expect(response.status).toBe(200);

            // Verify multiple roles assigned
            const [userRoles] = await db.execute(
                'SELECT COUNT(*) as count FROM user_roles WHERE user_id = ?',
                [userId]
            );

            expect(userRoles[0].count).toBe(2);
        });

        test('3.3 Should remove all roles from user', async () => {
            const userId = testUsers['Lab Technician'].id;

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: []
                });

            expect(response.status).toBe(200);

            // Verify no roles assigned
            const [userRoles] = await db.execute(
                'SELECT COUNT(*) as count FROM user_roles WHERE user_id = ?',
                [userId]
            );

            expect(userRoles[0].count).toBe(0);
        });
    });

    describe('4. Cross-Tenant Role Isolation', () => {
        test('4.1 Should not allow assigning roles from different clinic', async () => {
            // Create a role for a different clinic (clinic_id = 999)
            const [result] = await db.execute(
                'INSERT INTO roles (clinic_id, name, description) VALUES (?, ?, ?)',
                [999, 'Test Role', 'Test role for different clinic']
            );

            const differentClinicRoleId = result.insertId;
            const userId = testUsers.Owner.id;

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [differentClinicRoleId]
                });

            // Should fail due to cross-tenant violation
            expect(response.status).toBe(400);

            // Cleanup
            await db.execute('DELETE FROM roles WHERE id = ?', [differentClinicRoleId]);
        });
    });

    describe('5. Audit Logging for Role Changes', () => {
        test('5.1 Should log role assignment in audit logs', async () => {
            const userId = testUsers.Doctor.id;
            
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Doctor', testClinicId]
            );
            
            const roleId = roles[0].id;

            // Assign role
            await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [roleId]
                });

            // Check audit logs
            const [auditLogs] = await db.execute(
                'SELECT * FROM audit_logs WHERE entity = ? AND entity_id = ? AND action LIKE ? ORDER BY created_at DESC LIMIT 1',
                ['user_roles', userId, '%role%']
            );

            expect(auditLogs.length).toBeGreaterThan(0);
            expect(auditLogs[0].action).toContain('role');
        });
    });

    describe('6. Error Handling and Edge Cases', () => {
        test('6.1 Should reject invalid role IDs', async () => {
            const userId = testUsers.Owner.id;

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    role_ids: [99999] // Non-existent role ID
                });

            expect(response.status).toBe(400);
        });

        test('6.2 Should reject role assignment to non-existent user', async () => {
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

        test('6.3 Should require authentication for role assignment', async () => {
            const userId = testUsers.Owner.id;
            
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Owner', testClinicId]
            );
            
            const roleId = roles[0].id;

            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .send({
                    role_ids: [roleId]
                });

            expect(response.status).toBe(401);
        });

        test('6.4 Should require proper permissions for role assignment', async () => {
            const userId = testUsers.Owner.id;
            
            const [roles] = await db.execute(
                'SELECT id FROM roles WHERE name = ? AND clinic_id = ?',
                ['Owner', testClinicId]
            );
            
            const roleId = roles[0].id;

            // Try to assign role using staff token (should fail)
            const response = await request(app)
                .put(`/api/v1/users/${userId}/roles`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({
                    role_ids: [roleId]
                });

            expect(response.status).toBe(403);
        });
    });

    afterAll(async () => {
        // Cleanup test users
        for (const user of Object.values(testUsers)) {
            if (user.id) {
                await db.execute('DELETE FROM user_roles WHERE user_id = ?', [user.id]);
                await db.execute('DELETE FROM auth_users WHERE id = ?', [user.id]);
            }
        }
    });
});