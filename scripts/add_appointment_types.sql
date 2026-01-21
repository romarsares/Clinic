-- Add appointment types functionality
-- This script adds appointment type configuration to the clinic system

-- Create appointment_types table
CREATE TABLE appointment_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 30,
    color VARCHAR(7) DEFAULT '#007bff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    UNIQUE KEY uq_appointment_type_name_clinic (clinic_id, name),
    INDEX idx_appointment_type_clinic (clinic_id)
);

-- Add appointment_type_id column to appointments table
ALTER TABLE appointments ADD COLUMN appointment_type_id BIGINT NULL AFTER doctor_id;
ALTER TABLE appointments ADD FOREIGN KEY (appointment_type_id) REFERENCES appointment_types(id);

-- Insert default appointment types for existing clinic
INSERT INTO appointment_types (clinic_id, name, description, duration_minutes, color) VALUES
(1, 'Consultation', 'General medical consultation', 30, '#007bff'),
(1, 'Follow-up', 'Follow-up visit for existing condition', 20, '#28a745'),
(1, 'Check-up', 'Routine health check-up', 45, '#17a2b8'),
(1, 'Vaccination', 'Immunization appointment', 15, '#ffc107'),
(1, 'Emergency', 'Urgent medical consultation', 60, '#dc3545');