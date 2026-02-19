/**
 * Patient Management Direct Test
 * Tests patient model and database operations directly
 */

const Patient = require('../src/models/Patient');
const db = require('../src/config/database');

describe('Patient Management - Direct Database Tests', () => {
    let patientModel;
    let testPatientId;
    let testChildId;
    const testClinicId = 1;

    beforeAll(() => {
        patientModel = new Patient(db);
    });

    afterAll(async () => {
        // Cleanup
        if (testChildId) {
            await db.execute('DELETE FROM patients WHERE id = ?', [testChildId]);
        }
        if (testPatientId) {
            await db.execute('DELETE FROM patients WHERE id = ?', [testPatientId]);
        }
    });

    describe('Create Patient', () => {
        it('should create a new patient', async () => {
            const patientData = {
                clinic_id: testClinicId,
                first_name: 'Test',
                last_name: 'Patient',
                birth_date: '1990-01-15',
                gender: 'male',
                contact_number: '09171234567',
                email: 'test.patient@example.com',
                notes: 'Test patient'
            };

            const patient = await patientModel.create(patientData);
            
            expect(patient).toBeDefined();
            expect(patient.id).toBeDefined();
            expect(patient.first_name).toBe('Test');
            expect(patient.last_name).toBe('Patient');
            
            testPatientId = patient.id;
        });
    });

    describe('Get Patient', () => {
        it('should retrieve patient by ID', async () => {
            const patient = await patientModel.getById(testPatientId);
            
            expect(patient).toBeDefined();
            expect(patient.id).toBe(testPatientId);
            expect(patient.first_name).toBe('Test');
            expect(patient.clinic_id).toBe(testClinicId);
        });

        it('should return null for non-existent patient', async () => {
            const patient = await patientModel.getById(999999);
            expect(patient).toBeNull();
        });
    });

    describe('List Patients', () => {
        it('should list patients by clinic', async () => {
            const result = await patientModel.listByClinic(testClinicId, {
                page: 1,
                limit: 10
            });
            
            expect(result).toBeDefined();
            expect(result.patients).toBeDefined();
            expect(Array.isArray(result.patients)).toBe(true);
            expect(result.patients.length).toBeGreaterThan(0);
            expect(result.total).toBeDefined();
        });
    });

    describe('Search Patients', () => {
        it('should search patients by name', async () => {
            const results = await patientModel.search(testClinicId, 'Test', { limit: 10 });
            
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
            
            const found = results.find(p => p.id === testPatientId);
            expect(found).toBeDefined();
        });

        it('should return empty array for no matches', async () => {
            const results = await patientModel.search(testClinicId, 'NonExistentName12345', { limit: 10 });
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(0);
        });
    });

    describe('Update Patient', () => {
        it('should update patient information', async () => {
            const updates = {
                contact_number: '09189876543',
                email: 'updated.patient@example.com'
            };

            const updated = await patientModel.update(testPatientId, updates, testClinicId);
            
            expect(updated).toBeDefined();
            expect(updated.contact_number).toBe('09189876543');
            expect(updated.email).toBe('updated.patient@example.com');
        });
    });

    describe('Parent-Child Relationships', () => {
        it('should create a child patient', async () => {
            const childData = {
                clinic_id: testClinicId,
                first_name: 'Child',
                last_name: 'Patient',
                birth_date: '2020-05-10',
                gender: 'female'
            };

            const child = await patientModel.createChild(testPatientId, childData);
            
            expect(child).toBeDefined();
            expect(child.id).toBeDefined();
            expect(child.first_name).toBe('Child');
            
            testChildId = child.id;
        });

        it('should get children of parent', async () => {
            const children = await patientModel.getChildren(testPatientId, testClinicId);
            
            expect(Array.isArray(children)).toBe(true);
            expect(children.length).toBeGreaterThan(0);
            
            const found = children.find(c => c.id === testChildId);
            expect(found).toBeDefined();
        });

        it('should get parent of child', async () => {
            const parent = await patientModel.getParent(testChildId, testClinicId);
            
            expect(parent).toBeDefined();
            expect(parent.id).toBe(testPatientId);
        });
    });

    describe('Patient Statistics', () => {
        it('should get patient count by clinic', async () => {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM patients WHERE clinic_id = ? AND deleted_at IS NULL',
                [testClinicId]
            );
            
            expect(rows[0].count).toBeGreaterThan(0);
        });

        it('should get patients by gender', async () => {
            const [rows] = await db.execute(
                'SELECT gender, COUNT(*) as count FROM patients WHERE clinic_id = ? AND deleted_at IS NULL GROUP BY gender',
                [testClinicId]
            );
            
            expect(Array.isArray(rows)).toBe(true);
            expect(rows.length).toBeGreaterThan(0);
        });
    });
});
