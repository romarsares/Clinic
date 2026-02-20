/**
 * Multi-Tenant Isolation Test
 * Verifies that users from one clinic cannot access data from another clinic
 */

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');

describe('Multi-Tenant Data Isolation', () => {
    let clinic1Token, clinic2Token;
    let clinic1PatientId, clinic2PatientId;

    beforeAll(async () => {
        // Setup: Create two clinics with users and patients
        // This assumes you have test data or setup scripts
    });

    test('User from Clinic 1 cannot list patients from Clinic 2', async () => {
        const response = await request(app)
            .get('/api/v1/patients')
            .set('Authorization', `Bearer ${clinic1Token}`);

        expect(response.status).toBe(200);
        const patientIds = response.body.data.patients.map(p => p.id);
        expect(patientIds).not.toContain(clinic2PatientId);
    });

    test('User from Clinic 1 cannot view patient from Clinic 2', async () => {
        const response = await request(app)
            .get(`/api/v1/patients/${clinic2PatientId}`)
            .set('Authorization', `Bearer ${clinic1Token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('not found');
    });

    test('User from Clinic 1 cannot update patient from Clinic 2', async () => {
        const response = await request(app)
            .put(`/api/v1/patients/${clinic2PatientId}`)
            .set('Authorization', `Bearer ${clinic1Token}`)
            .send({ first_name: 'Hacked' });

        expect(response.status).toBe(404);
    });

    test('User from Clinic 1 cannot delete patient from Clinic 2', async () => {
        const response = await request(app)
            .delete(`/api/v1/patients/${clinic2PatientId}`)
            .set('Authorization', `Bearer ${clinic1Token}`);

        expect(response.status).toBe(404);
    });

    test('Search only returns patients from user clinic', async () => {
        const response = await request(app)
            .get('/api/v1/patients/search?q=test')
            .set('Authorization', `Bearer ${clinic1Token}`);

        expect(response.status).toBe(200);
        const patientIds = response.body.data.map(p => p.id);
        expect(patientIds).not.toContain(clinic2PatientId);
    });

    afterAll(async () => {
        await db.end();
    });
});
