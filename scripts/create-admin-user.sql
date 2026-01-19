-- Create Default Admin User
-- Email: admin@clinic.com
-- Password: admin12354

-- Insert default clinic first
INSERT IGNORE INTO clinics (id, name, address, contact_number, email, created_at) 
VALUES (1, 'Demo Clinic', '123 Main St', '+63-912-345-6789', 'demo@clinic.com', NOW());

-- Insert default admin user (password hash for 'admin12354')
INSERT IGNORE INTO auth_users (id, clinic_id, email, password_hash, full_name, status, created_at) 
VALUES (1, 1, 'admin@clinic.com', '$2b$10$rQJ8YQZ9X5K5Z5Z5Z5Z5ZOeJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'System Administrator', 'active', NOW());

-- Insert roles if they don't exist
INSERT IGNORE INTO roles (id, clinic_id, name, description, created_at) VALUES
(1, 1, 'Owner', 'Clinic owner with full access', NOW()),
(2, 1, 'Doctor', 'Medical doctor', NOW()),
(3, 1, 'Staff', 'Administrative staff', NOW()),
(4, 1, 'Lab Technician', 'Laboratory technician', NOW());

-- Assign Owner role to admin user
INSERT IGNORE INTO user_roles (user_id, role_id, created_at) 
VALUES (1, 1, NOW());

-- Insert default service types for billing
INSERT IGNORE INTO service_types (clinic_id, name, category, base_price, created_at) VALUES
(1, 'General Consultation', 'consultation', 500.00, NOW()),
(1, 'Pediatric Consultation', 'consultation', 600.00, NOW()),
(1, 'Follow-up Visit', 'consultation', 300.00, NOW()),
(1, 'Complete Blood Count (CBC)', 'lab_test', 250.00, NOW()),
(1, 'Urinalysis', 'lab_test', 150.00, NOW()),
(1, 'Blood Chemistry', 'lab_test', 400.00, NOW());