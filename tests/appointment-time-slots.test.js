const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');

describe('Appointment Time Slots API', () => {
    let authToken;
    let clinicId = 1;
    let doctorId = 1;
    let patientId = 1;

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
        // Clean up test appointments
        await db.execute(
            'DELETE FROM appointments WHERE clinic_id = ? AND patient_id = ? AND appointment_date = CURDATE()',
            [clinicId, patientId]
        );
        await db.close();
    });

    describe('GET /api/v1/appointments/available-slots', () => {
        it('should get available time slots for a doctor', async () => {
            const today = new Date().toISOString().split('T')[0];
            
            const response = await request(app)
                .get('/api/v1/appointments/available-slots')
                .query({
                    doctor_id: doctorId,
                    date: today
                })
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            
            // Check slot structure
            const firstSlot = response.body.data[0];
            expect(firstSlot).toHaveProperty('time');
            expect(firstSlot).toHaveProperty('available');
            expect(firstSlot.available).toBe(true);
        });

        it('should require doctor_id and date parameters', async () => {
            const response = await request(app)
                .get('/api/v1/appointments/available-slots')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Doctor ID and date are required');
        });
    });

    describe('POST /api/v1/appointments/validate-slot', () => {
        it('should validate available time slot', async () => {
            const today = new Date().toISOString().split('T')[0];
            
            const response = await request(app)
                .post('/api/v1/appointments/validate-slot')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    doctor_id: doctorId,
                    appointment_date: today,
                    appointment_time: '10:00',
                    duration: 30
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(true);
            expect(response.body.data.message).toBe('Time slot is available');
        });

        it('should reject time outside operating hours', async () => {
            const today = new Date().toISOString().split('T')[0];
            
            const response = await request(app)
                .post('/api/v1/appointments/validate-slot')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    doctor_id: doctorId,
                    appointment_date: today,
                    appointment_time: '07:00', // Before 8 AM
                    duration: 30
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(false);
            expect(response.body.data.message).toBe('Appointment time must be between 8:00 AM and 6:00 PM');
        });
    });

    describe('Appointment Conflict Prevention', () => {
        let appointmentId;

        beforeAll(async () => {
            // Create a test appointment
            const today = new Date().toISOString().split('T')[0];
            const createResponse = await request(app)
                .post('/api/v1/appointments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    patient_id: patientId,
                    doctor_id: doctorId,
                    appointment_date: today,
                    appointment_time: '14:00',
                    duration: 30,
                    notes: 'Test appointment for conflict checking'
                });
            
            appointmentId = createResponse.body.data.id;
        });

        afterAll(async () => {
            // Clean up test appointment
            if (appointmentId) {
                await request(app)
                    .delete(`/api/v1/appointments/${appointmentId}`)
                    .set('Authorization', `Bearer ${authToken}`);
            }
        });

        it('should detect time slot conflict', async () => {
            const today = new Date().toISOString().split('T')[0];
            
            const response = await request(app)
                .post('/api/v1/appointments/validate-slot')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    doctor_id: doctorId,
                    appointment_date: today,
                    appointment_time: '14:15', // Overlaps with existing appointment
                    duration: 30
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(false);
            expect(response.body.data.message).toBe('Time slot is already booked');
        });

        it('should prevent creating conflicting appointment', async () => {
            const today = new Date().toISOString().split('T')[0];
            
            const response = await request(app)
                .post('/api/v1/appointments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    patient_id: patientId,
                    doctor_id: doctorId,
                    appointment_date: today,
                    appointment_time: '14:00', // Same time as existing appointment
                    duration: 30,
                    notes: 'Conflicting appointment'
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Time slot is already booked');
        });

        it('should show unavailable slots in available-slots endpoint', async () => {
            const today = new Date().toISOString().split('T')[0];
            
            const response = await request(app)
                .get('/api/v1/appointments/available-slots')
                .query({
                    doctor_id: doctorId,
                    date: today
                })
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            
            // The 14:00 slot should not be in available slots
            const unavailableSlot = response.body.data.find(slot => slot.time === '14:00');
            expect(unavailableSlot).toBeUndefined();
        });
    });
});