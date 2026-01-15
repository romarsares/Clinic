-- Clinic Operations SaaS - MySQL DDL (MVP v2 - Clinical Enhanced)

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

-- 2. Clinic Settings (for tenant-specific configurations)
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

-- 4. Roles (for RBAC)
CREATE TABLE roles (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
clinic_id BIGINT NOT NULL,
name VARCHAR(50) NOT NULL, -- e.g., Owner, Doctor, Staff, Lab Technician
description VARCHAR(255),
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (clinic_id) REFERENCES clinics(id),
UNIQUE KEY uq_role_name_clinic (clinic_id, name)
);

-- 5. User Role Assignments
-- A user has no permissions until a role is assigned here. This enforces a "default-deny" security model.
CREATE TABLE user_roles (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
user_id BIGINT NOT NULL,
role_id BIGINT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES auth_users(id),
FOREIGN KEY (role_id) REFERENCES roles(id),
UNIQUE KEY uq_user_role (user_id, role_id)
);

-- 6. Permissions (for fine-grained access control)
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

-- 8. Patients (Core patient records)
CREATE TABLE patients (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
clinic_id BIGINT NOT NULL,
patient_code VARCHAR(50) NOT NULL,
full_name VARCHAR(255) NOT NULL,
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

-- 9. Appointments (Scheduling)
CREATE TABLE appointments (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
clinic_id BIGINT NOT NULL,
patient_id BIGINT NOT NULL,
doctor_id BIGINT NOT NULL,
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

-- 10. Visits (Patient encounters)
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

-- 11. Visit Notes (General purpose notes)
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

-- NEW CLINICAL TABLES START HERE --

-- 12. Visit Diagnoses (Structured clinical diagnoses)
CREATE TABLE visit_diagnoses (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
visit_id BIGINT NOT NULL,
clinic_id BIGINT NOT NULL,
diagnosis_type ENUM('primary', 'secondary') DEFAULT 'primary',
diagnosis_code VARCHAR(50), -- ICD-10 code
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

-- 13. Visit Vital Signs (Clinical measurements)
CREATE TABLE visit_vital_signs (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
visit_id BIGINT NOT NULL,
clinic_id BIGINT NOT NULL,
temperature DECIMAL(4,1), -- Celsius
blood_pressure_systolic INT,
blood_pressure_diastolic INT,
heart_rate INT, -- bpm
respiratory_rate INT, -- per minute
weight DECIMAL(5,2), -- kg
height DECIMAL(5,2), -- cm
bmi DECIMAL(4,2),
oxygen_saturation INT, -- %
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

-- 14.5 Patient Medications (NEW)
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

-- 14.6 Patient Medical History (NEW)
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

-- 15. Visit Attachments
CREATE TABLE visit_attachments (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
visit_id BIGINT NOT NULL,
clinic_id BIGINT NOT NULL,
file_name VARCHAR(255),
file_path VARCHAR(500),
file_type VARCHAR(50),
uploaded_by BIGINT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (visit_id) REFERENCES visits(id),
FOREIGN KEY (clinic_id) REFERENCES clinics(id),
FOREIGN KEY (uploaded_by) REFERENCES auth_users(id),
INDEX idx_visit_attachment (visit_id)
);

-- 16. Services (for billing)
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

-- 17. Billings (Invoices)
CREATE TABLE billings (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
clinic_id BIGINT NOT NULL,
patient_id BIGINT NOT NULL,
visit_id BIGINT,
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

-- 18. Billing Items (Line items for an invoice)
CREATE TABLE billing_items (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
billing_id BIGINT NOT NULL,
service_id BIGINT NOT NULL,
lab_request_id BIGINT, -- Optional link to a lab request
description VARCHAR(255),
quantity INT DEFAULT 1,
unit_price DECIMAL(10,2),
amount DECIMAL(10,2),
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (billing_id) REFERENCES billings(id),
FOREIGN KEY (service_id) REFERENCES services(id),
FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id),
INDEX idx_billing_item_billing (billing_id)
);

-- 19. Payments
CREATE TABLE payments (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
billing_id BIGINT NOT NULL,
clinic_id BIGINT NOT NULL,
amount DECIMAL(10,2) NOT NULL,
payment_method ENUM('cash','card','gcash'),
payment_date DATETIME,
received_by BIGINT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (billing_id) REFERENCES billings(id),
FOREIGN KEY (clinic_id) REFERENCES clinics(id),
FOREIGN KEY (received_by) REFERENCES auth_users(id),
INDEX idx_payment_billing (billing_id)
);

-- 20. Audit Logs
CREATE TABLE audit_logs (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
clinic_id BIGINT NOT NULL,
user_id BIGINT NOT NULL,
action ENUM('create','update','delete','login','view'),
entity VARCHAR(50),
entity_id BIGINT,
old_value JSON,
new_value JSON,
ip_address VARCHAR(50),
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (clinic_id) REFERENCES clinics(id),
FOREIGN KEY (user_id) REFERENCES auth_users(id),
INDEX idx_audit_clinic_user (clinic_id, user_id)
);

-- LABORATORY MANAGEMENT MODULE --

-- 21. Lab Tests (Defines available tests)
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

-- 22. Lab Requests (Orders for lab tests)
CREATE TABLE lab_requests (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
clinic_id BIGINT NOT NULL,
patient_id BIGINT NOT NULL,
visit_id BIGINT NOT NULL,
request_number VARCHAR(50) NOT NULL,
requested_by BIGINT NOT NULL, -- User with 'order_labs' permission (Doctor)
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

-- 23. Lab Request Items (Specific tests in an order)
CREATE TABLE lab_request_items (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
lab_request_id BIGINT NOT NULL,
lab_test_id BIGINT NOT NULL,
status ENUM('pending', 'completed') DEFAULT 'pending',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id),
FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id)
);

-- 24. Lab Results (Header for a set of results)
CREATE TABLE lab_results (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
lab_request_id BIGINT NOT NULL,
clinic_id BIGINT NOT NULL,
result_date DATETIME DEFAULT CURRENT_TIMESTAMP,
entered_by BIGINT NOT NULL, -- User with 'enter_lab_results' permission (Lab Technician)
verified_by BIGINT, -- User with 'verify_lab_results' permission (Doctor)
overall_status ENUM('normal', 'abnormal', 'critical') DEFAULT 'normal',
remarks TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id),
FOREIGN KEY (clinic_id) REFERENCES clinics(id),
FOREIGN KEY (entered_by) REFERENCES auth_users(id),
FOREIGN KEY (verified_by) REFERENCES auth_users(id)
);

-- 25. Lab Result Details (NEW)
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

-- END OF DDL --

-- DEFAULT DATA FOR PERMISSIONS (Enables Checkbox-style UI for Admins) --
INSERT INTO `permissions` (`name`, `display_name`, `description`, `category`) VALUES
-- Patient Management
('patients.view', 'View Patients', 'Can view patient demographic data and lists.', 'Patient'),
('patients.create', 'Create Patients', 'Can create new patient profiles.', 'Patient'),
('patients.edit', 'Edit Patients', 'Can edit patient demographic information.', 'Patient'),
('patients.delete', 'Delete Patients', 'Can soft-delete patient profiles.', 'Patient'),

-- Appointment Management
('appointments.view', 'View Appointments', 'Can view the clinic appointment schedule.', 'Appointment'),
('appointments.create', 'Create Appointments', 'Can schedule new appointments for patients.', 'Appointment'),
('appointments.edit', 'Edit Appointments', 'Can reschedule or update existing appointments.', 'Appointment'),
('appointments.cancel', 'Cancel Appointments', 'Can cancel an appointment.', 'Appointment'),

-- Clinical Documentation (Sensitive)
('clinical.diagnoses.create', 'Create Diagnoses', 'Can add a clinical diagnosis to a patient visit. (Doctor-level)', 'Clinical'),
('clinical.diagnoses.edit', 'Edit Diagnoses', 'Can edit an existing clinical diagnosis.', 'Clinical'),
('clinical.vitals.create', 'Record Vital Signs', 'Can record patient vital signs like BP, temp, etc.', 'Clinical'),
('clinical.history.view', 'View Medical History', 'Can view a patient''s full medical history, including past diagnoses and treatments.', 'Clinical'),

-- Laboratory Management (Sensitive)
('labs.requests.create', 'Create Lab Requests', 'Can order new laboratory tests for a patient. (Doctor-level)', 'Laboratory'),
('labs.requests.view', 'View Lab Requests', 'Can view the status of lab requests.', 'Laboratory'),
('labs.results.enter', 'Enter Lab Results', 'Can enter the results for a completed lab test. (Lab Tech-level)', 'Laboratory'),
('labs.results.verify', 'Verify Lab Results', 'Can review and verify the accuracy of entered lab results. (Doctor-level)', 'Laboratory'),

-- Billing & Payments
('billing.invoices.view', 'View Invoices', 'Can view patient invoices and billing history.', 'Billing'),
('billing.invoices.create', 'Create Invoices', 'Can create new invoices for services rendered.', 'Billing'),
('billing.payments.create', 'Record Payments', 'Can record a payment made against an invoice.', 'Billing'),

-- Reporting
('reports.operational.view', 'View Operational Reports', 'Can view reports on appointments, revenue, etc.', 'Reports'),
('reports.clinical.view', 'View Clinical Reports', 'Can view reports on disease prevalence, common diagnoses, etc. (Sensitive)', 'Reports'),

-- Administration
('admin.users.manage', 'Manage Users', 'Can create, edit, and suspend users within the clinic.', 'Admin'),
('admin.roles.manage', 'Manage Roles & Permissions', 'Can create and edit roles and their assigned permissions.', 'Admin'),
('admin.settings.manage', 'Manage Clinic Settings', 'Can configure clinic-wide settings.', 'Admin');

-- This provides a comprehensive list for a UI where an admin can assign permissions to roles. Per claude.md rules:
-- A "Staff" role should get permissions like 'patients.view', 'appointments.create', and 'billing.invoices.view'. It should NOT get any 'clinical.*' permissions.
-- A "Doctor" role would get Staff permissions plus all 'clinical.*' and 'labs.requests.create' permissions.




-- Optional Tables --
CREATE TABLE sms_logs (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
clinic_id BIGINT NOT NULL,
recipient VARCHAR(20) NOT NULL,
message TEXT NOT NULL,
status ENUM('sent','delivered','failed') DEFAULT 'sent',
provider_message_id VARCHAR(255),
sent_by BIGINT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (clinic_id) REFERENCES clinics(id),
FOREIGN KEY (sent_by) REFERENCES auth_users(id),
INDEX idx_sms_clinic_status (clinic_id, status)
);
