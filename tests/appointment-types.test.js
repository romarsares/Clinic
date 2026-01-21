const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');

describe('Appointment Types API', () => {
    let authToken;
    let clinicId = 1;

    beforeAll(async () => {
        // Login to get auth token
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@clinic.com',
                password: 'admin12354'
            });

        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await db.close();
    });

    describe('GET /api/v1/appointment-types', () => {
        it('should get all appointment types for clinic', async () => {
            const response = await request(app)
                .get('/api/v1/appointment-types')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            
            // Check default appointment types exist
            const typeNames = response.body.data.map(type => type.name);
            expect(typeNames).toContain('Consultation');
            expect(typeNames).toContain('Follow-up');
        });
    });

    describe('POST /api/v1/appointment-types', () => {
        it('should create new appointment type', async () => {
            const newType = {
                name: 'Test Appointment',
                description: 'Test appointment type',
                duration_minutes: 45,
                color: '#ff0000'
            };

            const response = await request(app)
                .post('/api/v1/appointment-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newType);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Appointment type created successfully');
            expect(response.body.data.id).toBeDefined();
        });

        it('should reject duplicate appointment type name', async () => {
            const duplicateType = {
                name: 'Consultation', // Already exists
                description: 'Duplicate test',
                duration_minutes: 30
            };

            const response = await request(app)
                .post('/api/v1/appointment-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send(duplicateType);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Appointment type name already exists');
        });
    });

    describe('PUT /api/v1/appointment-types/:id', () => {
        let appointmentTypeId;

        beforeAll(async () => {
            // Create a test appointment type
            const createResponse = await request(app)
                .post('/api/v1/appointment-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Update Test Type',
                    description: 'For update testing',
                    duration_minutes: 30
                });
            
            appointmentTypeId = createResponse.body.data.id;
        });

        it('should update appointment type', async () => {
            const updateData = {
                name: 'Updated Test Type',
                description: 'Updated description',
                duration_minutes: 60,
                color: '#00ff00'
            };

            const response = await request(app)
                .put(`/api/v1/appointment-types/${appointmentTypeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Appointment type updated successfully');
        });
    });

    describe('DELETE /api/v1/appointment-types/:id', () => {
        let appointmentTypeId;

        beforeAll(async () => {
            // Create a test appointment type
            const createResponse = await request(app)
                .post('/api/v1/appointment-types')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Delete Test Type',
                    description: 'For delete testing',
                    duration_minutes: 30
                });
            
            appointmentTypeId = createResponse.body.data.id;
        });

        it('should delete appointment type', async () => {
            const response = await request(app)
                .delete(`/api/v1/appointment-types/${appointmentTypeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Appointment type deleted successfully');
        });
    });
});