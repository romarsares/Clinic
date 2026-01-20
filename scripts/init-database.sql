-- Clinic SaaS Database Initialization Script
-- This script creates all required tables for the clinic management system

-- Drop existing tables if they exist (for clean setup)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS failed_access_logs;
DROP TABLE IF EXISTS sms_logs;
DROP TABLE IF EXISTS lab_result_details;
DROP TABLE IF EXISTS lab_results;
DROP TABLE IF EXISTS lab_request_items;
DROP TABLE IF EXISTS lab_requests;
DROP TABLE IF EXISTS lab_tests;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS billing_items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS visit_attachments;
DROP TABLE IF EXISTS patient_medical_history;
DROP TABLE IF EXISTS patient_medications;
DROP TABLE IF EXISTS patient_allergies;
DROP TABLE IF EXISTS visit_vital_signs;
DROP TABLE IF EXISTS visit_diagnoses;
DROP TABLE IF EXISTS visit_notes;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS auth_users;
DROP TABLE IF EXISTS clinic_settings;
DROP TABLE IF EXISTS clinics;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Clinics
CREATE TABLE clinics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    contact_number VARCHAR(50),
    email VARCHAR(100),
    timezone VARCHAR(50),
    status ENUM('trial','active','suspended') DEFAULT 'trial',
    subscription_plan VARCHAR(50),
    trial_ends_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_clinic_email (email)
);

-- 2. Clinic Settings
CREATE TABLE clinic_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    UNIQUE KEY uq_clinic_key (clinic_id, `key`)
);

-- 3. Authentication & Users
CREATE TABLE auth_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    status ENUM('active','suspended') DEFAULT 'active',
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    UNIQUE KEY uq_user_email_clinic (clinic_id, email),
    INDEX idx_user_clinic (clinic_id)
);

-- 4. Roles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    UNIQUE KEY uq_role_name_clinic (clinic_id, name)
);

-- 5. User Role Assignments
CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE KEY uq_user_role (user_id, role_id)
);

-- 6. Permissions
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(50),
    UNIQUE KEY uq_permission_name (name)
);

-- 7. Role Permission Assignments
CREATE TABLE role_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id),
    UNIQUE KEY uq_role_permission (role_id, permission_id)
);

-- 8. Patients
CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    patient_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender ENUM('male','female','other'),
    contact_number VARCHAR(50),
    email VARCHAR(100),
    parent_patient_id BIGINT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (parent_patient_id) REFERENCES patients(id),
    UNIQUE KEY uq_patient_code_clinic (clinic_id, patient_code),
    INDEX idx_patient_clinic (clinic_id),
    INDEX idx_patient_parent (parent_patient_id)
);

-- 9. Appointments
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status ENUM('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled',
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES auth_users(id),
    INDEX idx_appointment_clinic_date (clinic_id, scheduled_date)
);

-- 10. Visits
CREATE TABLE visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    appointment_id BIGINT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    visit_date DATETIME NOT NULL,
    status ENUM('open','closed') DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES auth_users(id),
    INDEX idx_visit_clinic_date (clinic_id, visit_date)
);

-- 11. Visit Notes
CREATE TABLE visit_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    note_type ENUM('complaint','diagnosis','treatment','remarks'),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    INDEX idx_visit_notes (visit_id)
);

-- 12. Visit Diagnoses
CREATE TABLE visit_diagnoses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    diagnosis_type ENUM('primary', 'secondary') DEFAULT 'primary',
    diagnosis_code VARCHAR(50),
    diagnosis_name VARCHAR(255) NOT NULL,
    clinical_notes TEXT,
    diagnosed_by BIGINT NOT NULL,
    diagnosed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (diagnosed_by) REFERENCES auth_users(id),
    INDEX idx_visit_diagnosis_code (diagnosis_code)
);

-- 13. Visit Vital Signs
CREATE TABLE visit_vital_signs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    temperature DECIMAL(4,1),
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate INT,
    respiratory_rate INT,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    bmi DECIMAL(4,2),
    oxygen_saturation INT,
    recorded_by BIGINT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (recorded_by) REFERENCES auth_users(id),
    INDEX idx_visit_vitals (visit_id)
);

-- 14. Patient Allergies
CREATE TABLE patient_allergies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    allergen VARCHAR(255) NOT NULL,
    reaction TEXT,
    severity ENUM('mild', 'moderate', 'severe'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- 15. Patient Medications
CREATE TABLE patient_medications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE,
    end_date DATE,
    prescribed_by BIGINT,
    status ENUM('active', 'discontinued') DEFAULT 'active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (prescribed_by) REFERENCES auth_users(id)
);

-- 16. Patient Medical History
CREATE TABLE patient_medical_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    history_type ENUM('past_illness', 'surgery', 'hospitalization', 'family_history') NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    diagnosed_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- 17. Services
CREATE TABLE services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    service_type ENUM('consultation', 'procedure', 'laboratory') DEFAULT 'consultation',
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    UNIQUE KEY uq_service_name_clinic (clinic_id, name)
);

-- 18. Lab Tests
CREATE TABLE lab_tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    test_code VARCHAR(50) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    normal_range_config JSON,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    UNIQUE KEY uq_lab_test_code_clinic (clinic_id, test_code)
);

-- 19. Lab Requests
CREATE TABLE lab_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,
    request_number VARCHAR(50) NOT NULL,
    requested_by BIGINT NOT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    urgency ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    clinical_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (requested_by) REFERENCES auth_users(id),
    UNIQUE KEY uq_lab_request_number (clinic_id, request_number),
    INDEX idx_lab_request_status (clinic_id, status)
);

-- 20. Bills
CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    visit_id BIGINT,
    amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2),
    status ENUM('unpaid','paid','void') DEFAULT 'unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    INDEX idx_billing_clinic_status (clinic_id, status)
);

-- 21. Billing Items
CREATE TABLE billing_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    billing_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    lab_request_id BIGINT,
    description VARCHAR(255),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2),
    amount DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (billing_id) REFERENCES bills(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id),
    INDEX idx_billing_item_billing (billing_id)
);

-- 22. Payments
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    billing_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash','card','gcash'),
    payment_date DATETIME,
    received_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (billing_id) REFERENCES bills(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (received_by) REFERENCES auth_users(id),
    INDEX idx_payment_billing (billing_id)
);

-- 23. Lab Request Items
CREATE TABLE lab_request_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_request_id BIGINT NOT NULL,
    lab_test_id BIGINT NOT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id),
    FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id)
);

-- 24. Lab Results
CREATE TABLE lab_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_request_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    result_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    entered_by BIGINT NOT NULL,
    verified_by BIGINT,
    overall_status ENUM('normal', 'abnormal', 'critical') DEFAULT 'normal',
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (entered_by) REFERENCES auth_users(id),
    FOREIGN KEY (verified_by) REFERENCES auth_users(id)
);

-- 25. Lab Result Details
CREATE TABLE lab_result_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_result_id BIGINT NOT NULL,
    lab_test_id BIGINT NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    result_value VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    normal_range VARCHAR(100),
    is_abnormal BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_result_id) REFERENCES lab_results(id),
    FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id),
    INDEX idx_lab_result_detail_result (lab_result_id)
);

-- 26. Audit Logs
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    user_id BIGINT,
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id BIGINT,
    entity VARCHAR(50),
    entity_id BIGINT,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(50),
    user_agent TEXT,
    method VARCHAR(10),
    url VARCHAR(500),
    status_code INT,
    request_body JSON,
    response_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (user_id) REFERENCES auth_users(id),
    INDEX idx_audit_clinic_user (clinic_id, user_id)
);

-- 27. Failed Access Logs
CREATE TABLE failed_access_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(50),
    user_agent TEXT,
    url VARCHAR(500),
    method VARCHAR(10),
    status_code INT,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_failed_access_ip (ip_address),
    INDEX idx_failed_access_time (attempted_at)
);

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, category) VALUES
('patients.view', 'View Patients', 'Can view patient demographic data and lists.', 'Patient'),
('patients.create', 'Create Patients', 'Can create new patient profiles.', 'Patient'),
('appointments.view', 'View Appointments', 'Can view the clinic appointment schedule.', 'Appointment'),
('appointments.create', 'Create Appointments', 'Can schedule new appointments for patients.', 'Appointment'),
('clinical.diagnoses.create', 'Create Diagnoses', 'Can add a clinical diagnosis to a patient visit.', 'Clinical'),
('clinical.vitals.create', 'Record Vital Signs', 'Can record patient vital signs.', 'Clinical'),
('labs.requests.create', 'Create Lab Requests', 'Can order new laboratory tests for a patient.', 'Laboratory'),
('labs.results.enter', 'Enter Lab Results', 'Can enter the results for a completed lab test.', 'Laboratory'),
('billing.invoices.view', 'View Invoices', 'Can view patient invoices and billing history.', 'Billing'),
('admin.users.manage', 'Manage Users', 'Can create, edit, and suspend users within the clinic.', 'Admin');

-- Insert default clinic
INSERT INTO clinics (id, name, email, status) VALUES (1, 'Demo Clinic', 'demo@clinic.com', 'active');

-- Insert default roles
INSERT INTO roles (id, clinic_id, name, description) VALUES 
(1, 1, 'Super User', 'System administrator with full access across all clinics'),
(2, 1, 'Owner', 'Clinic owner with full access'),
(3, 1, 'Doctor', 'Medical doctor with clinical privileges'),
(4, 1, 'Staff', 'Administrative staff'),
(5, 1, 'Lab Technician', 'Laboratory technician');

-- Insert admin user (password: admin12354)
INSERT INTO auth_users (id, clinic_id, email, password_hash, first_name, last_name, full_name, status) VALUES 
(1, 1, 'admin@clinic.com', '$2b$10$K7L/8Y1t85uuiRLI4lO8VO8FNkpfOKlY2pBshEf68MBVwHlgHlO.K', 'Admin', 'User', 'Admin User', 'active');

-- Assign admin user to Super User role
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Insert sample data for dashboard
INSERT INTO patients (id, clinic_id, patient_code, full_name, first_name, last_name, birth_date, gender) VALUES 
(1, 1, 'P001', 'John Doe', 'John', 'Doe', '1990-01-01', 'male');

INSERT INTO appointments (id, clinic_id, patient_id, doctor_id, appointment_date, scheduled_date, scheduled_time, status) VALUES 
(1, 1, 1, 1, CURDATE(), CURDATE(), '09:00:00', 'scheduled');

INSERT INTO visits (id, clinic_id, patient_id, doctor_id, visit_date, status) VALUES 
(1, 1, 1, 1, NOW(), 'open');

INSERT INTO bills (id, clinic_id, patient_id, visit_id, amount, total_amount, net_amount, status) VALUES 
(1, 1, 1, 1, 1500.00, 1500.00, 1500.00, 'unpaid');

INSERT INTO audit_logs (id, clinic_id, user_id, action, table_name, record_id) VALUES 
(1, 1, 1, 'LOGIN', 'auth_users', 1);