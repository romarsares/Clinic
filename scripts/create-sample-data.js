const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createSampleData() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    
    // Database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD || 'N1mbu$12354',
      database: 'clinic_saas'
    });

    console.log('✅ Connected to database');

    // Generate password hashes
    const adminHash = await bcrypt.hash('admin12354', 10);
    const doctorHash = await bcrypt.hash('doctor123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);
    const labtechHash = await bcrypt.hash('labtech123', 10);

    console.log('🔐 Generated password hashes');

    // 1. Insert clinics
    await connection.execute(`
      INSERT IGNORE INTO clinics (id, name, address, contact_number, email, created_at) VALUES
      (1, 'Sunshine Pediatric Clinic', '123 Main Street, Manila', '+63-2-123-4567', 'info@sunshineclinic.com', NOW()),
      (2, 'Happy Kids Medical Center', '456 Health Ave, Quezon City', '+63-2-987-6543', 'contact@happykids.com', NOW())
    `);

    // 2. Insert roles
    await connection.execute(`
      INSERT IGNORE INTO roles (id, clinic_id, name, description, created_at) VALUES
      (1, 1, 'Owner', 'Clinic owner with full access', NOW()),
      (2, 1, 'Doctor', 'Medical doctor', NOW()),
      (3, 1, 'Staff', 'Administrative staff', NOW()),
      (4, 1, 'Lab Technician', 'Laboratory technician', NOW()),
      (5, 1, 'Admin', 'System administrator', NOW())
    `);

    // 3. Insert users
    await connection.execute(`
      INSERT IGNORE INTO auth_users (id, clinic_id, email, password_hash, full_name, status, created_at) VALUES
      (1, 1, 'admin@clinic.com', ?, 'System Administrator', 'active', NOW()),
      (2, 1, 'dr.santos@clinic.com', ?, 'Dr. Maria Santos', 'active', NOW()),
      (3, 1, 'staff@clinic.com', ?, 'Jane Dela Cruz', 'active', NOW()),
      (4, 1, 'labtech@clinic.com', ?, 'John Lab Tech', 'active', NOW())
    `, [adminHash, doctorHash, staffHash, labtechHash]);

    // 4. Assign user roles
    await connection.execute(`
      INSERT IGNORE INTO user_roles (user_id, role_id, created_at) VALUES
      (1, 1, NOW()),  -- Admin as Owner
      (1, 5, NOW()),  -- Admin as Admin
      (2, 2, NOW()),  -- Dr. Santos as Doctor
      (3, 3, NOW()),  -- Jane as Staff
      (4, 4, NOW())   -- John as Lab Technician
    `);

    // 5. Insert appointment types
    await connection.execute(`
      INSERT IGNORE INTO appointment_types (id, clinic_id, name, description, duration_minutes, color, created_at) VALUES
      (1, 1, 'General Consultation', 'Regular pediatric consultation', 30, '#007bff', NOW()),
      (2, 1, 'Follow-up Visit', 'Follow-up consultation', 20, '#28a745', NOW()),
      (3, 1, 'Vaccination', 'Immunization appointment', 15, '#ffc107', NOW()),
      (4, 1, 'Emergency', 'Emergency consultation', 45, '#dc3545', NOW())
    `);

    // 6. Insert sample patients
    await connection.execute(`
      INSERT IGNORE INTO patients (id, clinic_id, patient_code, full_name, first_name, last_name, birth_date, gender, contact_number, email, notes, created_at) VALUES
      (1, 1, 'P001', 'Juan Dela Cruz', 'Juan', 'Dela Cruz', '2018-05-15', 'male', '+63-912-345-6789', 'parent1@email.com', 'Regular patient', NOW()),
      (2, 1, 'P002', 'Maria Garcia', 'Maria', 'Garcia', '2020-03-22', 'female', '+63-917-123-4567', 'parent2@email.com', 'New patient', NOW()),
      (3, 1, 'P003', 'Pedro Santos', 'Pedro', 'Santos', '2019-08-10', 'male', '+63-918-987-6543', 'parent3@email.com', 'Follow-up patient', NOW())
    `);

    // 7. Insert sample appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await connection.execute(`
      INSERT IGNORE INTO appointments (id, clinic_id, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, duration, status, notes, created_at) VALUES
      (1, 1, 1, 2, CURDATE(), '09:00:00', 'General Consultation', 30, 'scheduled', 'Regular checkup', NOW()),
      (2, 1, 2, 2, CURDATE(), '10:30:00', 'Vaccination', 15, 'scheduled', 'MMR vaccine', NOW()),
      (3, 1, 3, 2, ?, '14:00:00', 'Follow-up Visit', 20, 'scheduled', 'Follow-up for fever', NOW())
    `, [tomorrow.toISOString().split('T')[0]]);

    // 8. Insert sample visits
    await connection.execute(`
      INSERT IGNORE INTO visits (id, clinic_id, appointment_id, patient_id, doctor_id, visit_date, status, created_at) VALUES
      (1, 1, 1, 1, 2, CURDATE(), 'open', NOW())
    `);

    // 9. Insert sample vital signs
    await connection.execute(`
      INSERT IGNORE INTO visit_vital_signs (visit_id, clinic_id, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, respiratory_rate, weight, height, bmi, oxygen_saturation, recorded_by, recorded_at, created_at) VALUES
      (1, 1, 36.5, 90, 60, 100, 20, 15.5, 95.0, 17.2, 98, 3, NOW(), NOW())
    `);

    // 10. Insert sample diagnoses
    await connection.execute(`
      INSERT IGNORE INTO visit_diagnoses (visit_id, clinic_id, diagnosis_type, diagnosis_code, diagnosis_name, clinical_notes, diagnosed_by, diagnosed_at, created_at) VALUES
      (1, 1, 'primary', 'J06.9', 'Acute upper respiratory infection, unspecified', 'Mild symptoms, no complications', 2, NOW(), NOW())
    `);

    // 11. Insert sample visit notes
    await connection.execute(`
      INSERT IGNORE INTO visit_notes (visit_id, clinic_id, note_type, content, created_at) VALUES
      (1, 1, 'chief_complaint', 'Child has been having runny nose and mild cough for 2 days', NOW()),
      (1, 1, 'clinical_assessment', 'Mild upper respiratory tract infection. No signs of complications.', NOW()),
      (1, 1, 'treatment_plan', '1. Paracetamol 80mg every 6 hours for fever\\n2. Increase fluid intake\\n3. Rest', NOW()),
      (1, 1, 'follow_up_instructions', 'Return if symptoms worsen or persist beyond 5 days', NOW())
    `);

    // 12. Insert sample medical history
    await connection.execute(`
      INSERT IGNORE INTO patient_allergies (patient_id, clinic_id, allergen, severity, reaction, status, notes, created_at) VALUES
      (1, 1, 'Penicillin', 'moderate', 'Skin rash', 'active', 'Developed rash after antibiotic treatment', NOW()),
      (2, 1, 'Peanuts', 'severe', 'Anaphylaxis', 'active', 'Severe allergic reaction to peanuts', NOW())
    `);

    await connection.execute(`
      INSERT IGNORE INTO patient_medications (patient_id, clinic_id, medication_name, dosage, frequency, status, start_date, notes, created_at) VALUES
      (1, 1, 'Vitamin D3', '400 IU', 'daily', 'active', CURDATE(), 'Daily vitamin supplement', NOW()),
      (3, 1, 'Iron Supplement', '15mg', 'daily', 'active', CURDATE(), 'For iron deficiency', NOW())
    `);

    // 13. Insert sample lab requests and results
    await connection.execute(`
      INSERT IGNORE INTO lab_requests (id, clinic_id, patient_id, visit_id, doctor_id, test_type, test_name, priority, status, notes, requested_at, created_at) VALUES
      (1, 1, 1, 1, 2, 'Hematology', 'Complete Blood Count (CBC)', 'normal', 'completed', 'Routine CBC', NOW(), NOW())
    `);

    await connection.execute(`
      INSERT IGNORE INTO lab_results (lab_request_id, clinic_id, technician_id, test_values, normal_ranges, abnormal_flags, notes, completed_at, created_at) VALUES
      (1, 1, 4, '{"Hemoglobin": "12.5", "White Blood Cells": "8.2", "Platelets": "250"}', '{"Hemoglobin": {"min": 11.0, "max": 14.0, "unit": "g/dL"}, "White Blood Cells": {"min": 5.0, "max": 12.0, "unit": "10³/μL"}, "Platelets": {"min": 150, "max": 400, "unit": "10³/μL"}}', '{}', 'Normal results', NOW(), NOW())
    `);

    console.log('✅ Sample data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👑 Admin: admin@clinic.com / admin12354');
    console.log('👨‍⚕️ Doctor: dr.santos@clinic.com / doctor123');
    console.log('👩‍💼 Staff: staff@clinic.com / staff123');
    console.log('🔬 Lab Tech: labtech@clinic.com / labtech123');
    console.log('\n📊 Sample Data Includes:');
    console.log('• 3 Patients with medical records');
    console.log('• 3 Appointments (today and tomorrow)');
    console.log('• 1 Active visit with complete documentation');
    console.log('• Vital signs, diagnoses, and treatment plans');
    console.log('• Medical history (allergies, medications)');
    console.log('• Lab request and results');
    console.log('• 4 Appointment types');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createSampleData();